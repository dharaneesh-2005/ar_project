let mediaRecorder;
let audioChunks = [];
let audioBlob;
let stream;

// Don't auto-request microphone on load

async function startGame() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('Microphone access granted');
    } catch (error) {
        alert('Microphone access required');
        return;
    }
    
    document.getElementById('intro-screen').classList.add('hidden');
    document.getElementById('ar-scene').style.display = 'block';
    
    setTimeout(() => {
        console.log('Showing voice chat now');
        showVoiceChat("Do you see the enemy over there?");
        speak("Do you see the enemy over there?");
        setTimeout(() => startRecording(), 1000);
    }, 5000);
}

function showVoiceChat(text) {
    const chatBox = document.getElementById('voice-chat');
    chatBox.textContent = text;
    chatBox.classList.remove('hidden');
    console.log('Voice chat shown:', text);
}

function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
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
        setTimeout(() => {
            mediaRecorder.stop();
            stream.getTracks().forEach(track => track.stop());
        }, 5000);
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
    document.getElementById('ar-scene').style.display = 'none';
    document.getElementById('result-screen').classList.remove('hidden');
    document.getElementById('transcript').textContent = transcript || 'Unable to transcribe';
    
    const audioPlayer = document.getElementById('audio-player');
    audioPlayer.src = URL.createObjectURL(audioBlob);
}
