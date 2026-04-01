function sendAlert(type) {

    let message = "";

    if (type === "fire") {
        message = "🔥 Fire Emergency";
    } else if (type === "medical") {
        message = "🏥 Medical Emergency";
    } else {
        message = "⚠️ Security Threat";
    }

    if (navigator.geolocation) {

        navigator.geolocation.getCurrentPosition(position => {

            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            const fullMessage = `
${message}

📍 Location:
Latitude: ${lat}
Longitude: ${lon}

Google Maps: https://www.google.com/maps?q=${lat},${lon}
            `;

            sendToServer(fullMessage, type, lat, lon);

        }, error => {

            const fallbackMessage = `
${message}

📍 Location: Not available
            `;

            sendToServer(fallbackMessage, type, null, null);
        });

    } else {
        alert("Geolocation not supported");
    }
}

function sendToServer(message, type, lat, lon) {

    fetch("http://127.0.0.1:3000/send-alert", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ message })
    })
    .then(res => {
        if (!res.ok) throw new Error("Email failed");
        return res.text();
    })
    .then(data => {

        console.log("Email Response:", data);
        alert("Alert sent successfully!");

        // Always run voice instructions
        speakInstructions(type);

        // Try AI only if location exists
        if (lat !== null && lon !== null) {
            getAIResponse(type, lat, lon);
        }

    })
    .catch(err => {
        console.error("Email Error:", err);
        alert("Email sending failed");
    });
}

function getAIResponse(type, lat, lon) {

    fetch("http://127.0.0.1:3000/ai-response", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            type: type,
            location: `${lat}, ${lon}`
        })
    })
    .then(res => {
        if (!res.ok) throw new Error("AI failed");
        return res.json();
    })
    .then(data => {

        console.log("AI:", data.reply);

        const speech = new SpeechSynthesisUtterance(data.reply);
        window.speechSynthesis.speak(speech);

        alert(data.reply);

    })
    .catch(err => {
        console.error("AI error:", err);
        alert("AI response failed (but alert is still sent)");
    });
}

function speakInstructions(type) {

    let instruction = "";

    if (type === "fire") {
        instruction = "Fire emergency detected. Evacuate using stairs. Do not use elevators. Stay low to avoid smoke.";
    } 
    else if (type === "medical") {
        instruction = "Medical emergency detected. Check responsiveness. Call for help and provide first aid if trained.";
    } 
    else {
        instruction = "Security threat detected. Move to a safe place and stay alert.";
    }

    const speech = new SpeechSynthesisUtterance(instruction);
    window.speechSynthesis.speak(speech);
}

/* BUTTONS */
document.getElementById("btn-fire").onclick = () => sendAlert("fire");
document.getElementById("btn-medical").onclick = () => sendAlert("medical");
document.getElementById("btn-threat").onclick = () => sendAlert("threat");