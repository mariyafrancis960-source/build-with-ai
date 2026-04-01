require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(bodyParser.json());

/* ================= EMAIL ================= */
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "your@gmail.com",
        pass: "app password" // ⚠️ App Password
    }
});

/* ================= TEST ================= */
app.get("/", (req, res) => {
    res.send("Server working ✅");
});

/* ================= EMAIL ROUTE ================= */
app.post("/send-alert", async (req, res) => {

    const { message } = req.body;

    console.log("Incoming:", message);

    try {
        await transporter.sendMail({
            from: "gmail@gmail.com",
            to: "gmail@gmail.com",
            subject: "Emergency Alert",
            text: message
        });

        res.send("Email sent");

    } catch (err) {
        console.error("EMAIL ERROR:", err);
        res.status(500).send("Email failed");
    }
});

/* ================= OPTIONAL AI (SAFE FAIL) ================= */
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GENAI_API_KEY);

app.post("/ai-response", async (req, res) => {

    const { type, location } = req.body;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `
Emergency Type: ${type}
Location: ${location}

Give short safety instructions.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;

        res.json({ reply: response.text() });

    } catch (err) {
        console.error("AI ERROR:", err);
        res.status(500).json({ error: "AI failed" });
    }
});

/* ================= START ================= */
app.listen(3000, () => {
    console.log("🚀 Server running on port 3000");
});
