let mediaRecorder;
let audioChunks = [];
let audioBlob;
let stream;

console.log('app.js loaded successfully');

async function startGame() {
    console.log('START GAME CLICKED!');
    try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('Microphone access granted');
    } catch (error) {
        alert('⚠️ Microphone access required for team communication');
        return;
    }
    
    document.getElementById('intro-screen').classList.add('hidden');
    document.getElementById('ar-scene').classList.add('active');
    document.getElementById('crosshair').classList.remove('hidden');
    document.getElementById('game-hud').classList.remove('hidden');
    console.log('Intro hidden, AR scene shown, waiting 2 seconds...');
    
    setTimeout(() => {
        console.log('TIMEOUT TRIGGERED - About to show voice chat');
        const messages = [
            "Hey, do you see the enemy?",
            "Where is he? Can you spot him?",
            "I need your position report!"
        ];
        const msg = messages[Math.floor(Math.random() * messages.length)];
        console.log('Showing voice chat:', msg);
        showVoiceChat(msg);
        speak(msg);
        setTimeout(() => {
            console.log('Starting recording now...');
            startRecording();
        }, 2000);
    }, 2000);
    
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

function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.1;
    utterance.pitch = 0.9;
    utterance.volume = 0.8;
    speechSynthesis.speak(utterance);
}

async function startRecording() {
    try {
        if (!stream) {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        }
        
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
            audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            document.getElementById('voice-chat').classList.add('hidden');
            await uploadAudio(audioBlob);
        };

        mediaRecorder.start();
        showVoiceChat("🎤 Listening... Speak now!");
        
        setTimeout(() => {
            if (mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
                stream.getTracks().forEach(track => track.stop());
            }
        }, 6000);
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
    document.getElementById('transcript').textContent = transcript || '[Unable to transcribe - but audio was still captured]';
    
    const audioPlayer = document.getElementById('audio-player');
    audioPlayer.src = URL.createObjectURL(audioBlob);
    audioPlayer.load();
}
