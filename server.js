require('dotenv').config();
const express = require('express');
const multer = require('multer');
const Groq = require('groq-sdk');
const fs = require('fs');
const path = require('path');
const os = require('os');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.use(express.static('.'));

app.post('/api/process-voice', upload.single('audio'), async (req, res) => {
    try {
        const tmpDir = os.tmpdir();
        const audioPath = path.join(tmpDir, `audio-${Date.now()}.webm`);
        
        fs.writeFileSync(audioPath, req.file.buffer);
        
        const transcription = await groq.audio.transcriptions.create({
            file: fs.createReadStream(audioPath),
            model: 'whisper-large-v3',
            response_format: 'json'
        });

        fs.unlinkSync(audioPath);

        res.json({
            transcript: transcription.text,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Processing failed', transcript: 'Demo transcript' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
