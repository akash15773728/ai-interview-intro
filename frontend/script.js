let recognition;
let isRecording = false;

// Check for browser support
if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    
    recognition.onstart = function() {
        document.getElementById("recordBtn").innerText = "⏹ Stop Recording";
        document.getElementById("recordingStatus").style.display = "inline";
        document.getElementById("speech").placeholder = "Listening...";
        isRecording = true;
    };
    
    recognition.onresult = function(event) {
        let fullTranscript = "";
        for (let i = 0; i < event.results.length; ++i) {
             fullTranscript += event.results[i][0].transcript;
        }
        document.getElementById("speech").value = fullTranscript;
    };
    
    recognition.onend = function() {
        document.getElementById("recordBtn").innerText = "🎤 Start Recording";
        document.getElementById("recordingStatus").style.display = "none";
        isRecording = false;
    };
    
    recognition.onerror = function(event) {
        console.error("Speech recognition error", event.error);
        alert("Speech Recognition Error: " + event.error);
    };
} else {
    alert("Web Speech API is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
}

function toggleRecording() {
    if (!recognition) {
        alert("Your browser does not support live speech recognition. Try Google Chrome.");
        return;
    }
    
    if (isRecording) {
        recognition.stop();
    } else {
        document.getElementById("speech").value = ""; // Clear area for new voice recording
        recognition.start();
    }
}

async function submitSpeech() {
    let text = document.getElementById("speech").value;
    if (!text) return;

    let response = await fetch("http://127.0.0.1:5000/grade", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ speech: text })
    });

    let data = await response.json();

    let details = data.detected.length > 0 ? "\nTokens Matched: " + data.detected.join(", ") : "";
    document.getElementById("result").innerText = "Score: " + data.score + details;
}