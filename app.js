let mediaRecorder;
let audioChunks = [];
let audioBlob;
let stream;

console.log('app.js loaded successfully');

async function startGame() {
    console.log('START GAME CLICKED!');
    try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            }
        });
        console.log('Microphone access granted');
    } catch (error) {
        alert('⚠️ Microphone access required for team communication');
        return;
    }
    
    document.getElementById('intro-screen').classList.add('hidden');
    document.getElementById('ar-scene').classList.add('active');
    document.getElementById('crosshair').classList.remove('hidden');
    document.getElementById('game-hud').classList.remove('hidden');
    console.log('Intro hidden, AR scene shown, waiting 10 seconds for exploration...');
    
    setTimeout(() => {
        console.log('Exploration time over - showing voice chat');
        const msg = "Hey, did you spot the enemies? If yes, tell me where they are… And tell me if you think you can handle them alone.";
        console.log('Showing voice chat:', msg);
        showVoiceChat(msg);
        playAudio('https://res.cloudinary.com/dcamnqa7q/video/upload/v1765467221/audio_enemy_asking_sgpqtx.mp3');
        setTimeout(() => {
            console.log('Starting recording now...');
            startRecording();
        }, 8000);
    }, 10000);
    
    console.log('startGame function completed');
}

function showVoiceChat(text) {
    const chatBox = document.getElementById('voice-chat');
    console.log('Voice chat element:', chatBox);
    console.log('Setting text:', text);
    chatBox.textContent = text;
    chatBox.classList.remove('hidden');
    chatBox.style.display = 'block';
    console.log('Voice chat should be visible now');
}

function playAudio(url) {
    const audio = new Audio(url);
    audio.play();
}

async function startRecording() {
    try {
        if (!stream) {
            stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });
        }
        
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const analyzer = audioContext.createAnalyser();
        analyzer.fftSize = 512;
        source.connect(analyzer);
        
        const bufferLength = analyzer.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        let silenceStart = null;
        let hasSpoken = false;
        const SILENCE_THRESHOLD = 50;
        const SPEECH_THRESHOLD = 60;
        const SILENCE_DURATION = 2000;
        const MAX_RECORDING_TIME = 10000;
        const recordingStartTime = Date.now();

        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
            audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            document.getElementById('voice-chat').classList.add('hidden');
            audioContext.close();
            
            if (hasSpoken) {
                await uploadAudio(audioBlob);
            } else {
                showSecureMessage();
            }
        };

        mediaRecorder.start();
        showVoiceChat("🎤 Listening... Speak now!");
        
        const checkAudio = () => {
            if (mediaRecorder.state !== 'recording') return;
            
            if (Date.now() - recordingStartTime > MAX_RECORDING_TIME) {
                mediaRecorder.stop();
                stream.getTracks().forEach(track => track.stop());
                return;
            }
            
            analyzer.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((a, b) => a + b) / bufferLength;
            
            if (average > SPEECH_THRESHOLD) {
                hasSpoken = true;
                silenceStart = null;
            } else if (hasSpoken && average < SILENCE_THRESHOLD) {
                if (!silenceStart) {
                    silenceStart = Date.now();
                } else if (Date.now() - silenceStart > SILENCE_DURATION) {
                    mediaRecorder.stop();
                    stream.getTracks().forEach(track => track.stop());
                    return;
                }
            }
            
            requestAnimationFrame(checkAudio);
        };
        
        checkAudio();
    } catch (error) {
        alert('Microphone error: ' + error.message);
    }
}

async function uploadAudio(audioBlob) {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

    try {
        const response = await fetch('/api/process-voice', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        showResult(data.transcript, audioBlob);
    } catch (error) {
        showResult('Error processing audio', audioBlob);
    }
}

function showResult(transcript, audioBlob) {
    document.getElementById('ar-scene').classList.remove('active');
    document.getElementById('crosshair').classList.add('hidden');
    document.getElementById('game-hud').classList.add('hidden');
    document.getElementById('result-screen').classList.remove('hidden');
    
    const resultScreen = document.getElementById('result-screen');
    const capturedCard = resultScreen.querySelector('.captured-card');
    const warningCard = resultScreen.querySelector('.warning-card');
    
    capturedCard.style.display = 'block';
    warningCard.style.display = 'block';
    
    document.getElementById('transcript').textContent = transcript || '[Unable to transcribe - but audio was still captured]';
    
    const audioPlayer = document.getElementById('audio-player');
    audioPlayer.src = URL.createObjectURL(audioBlob);
    audioPlayer.load();
}

function showSecureMessage() {
    document.getElementById('ar-scene').classList.remove('active');
    document.getElementById('crosshair').classList.add('hidden');
    document.getElementById('game-hud').classList.add('hidden');
    document.getElementById('result-screen').classList.remove('hidden');
    
    const resultScreen = document.getElementById('result-screen');
    const title = resultScreen.querySelector('.result-title');
    const subtitle = resultScreen.querySelector('.result-subtitle');
    const capturedCard = resultScreen.querySelector('.captured-card');
    const warningCard = resultScreen.querySelector('.warning-card');
    
    title.textContent = '✅ MISSION COMPLETE - NO DATA CAPTURED';
    title.style.color = '#0f0';
    title.style.textShadow = '0 0 20px #0f0, 0 0 40px #0f0, 0 0 60px #0f0';
    
    subtitle.textContent = 'Your voice data is secure. No audio was processed.';
    subtitle.style.color = '#0f0';
    
    capturedCard.style.display = 'none';
    warningCard.style.display = 'none';
}
