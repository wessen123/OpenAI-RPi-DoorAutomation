require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const say = require('say');
const axios = require('axios');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Endpoint to generate a fun, golf-themed greeting using OpenAI
app.post('/generate-greeting', async (req, res) => {
    const { name, day } = req.body;
    const openaiApiKey = process.env.OPENAI_API_KEY;

    try {
        // Request to OpenAI for a playful, golf-themed greeting
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "user",
                        content: `Create a fun and energetic welcome message for ${name}, who is here to play golf on ${day}. Make it golf-themed and playful. Mention something unique about the name "${name}" if possible, and include a bit of humor to make them smile.`
                    }
                ],
                max_tokens: 100,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${openaiApiKey}`,
                },
            }
        );

        const greetingMessage = response.data.choices[0].message.content.trim();
        res.json({ message: greetingMessage });
    } catch (error) {
        console.error("Error generating greeting:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Failed to generate greeting" });
    }
});

// Endpoint to convert text to speech and save as .wav
app.post('/generate-tts', (req, res) => {
    const { text } = req.body;
    const filename = `${uuidv4()}.wav`; // Generate a unique filename
    const filePath = path.join(__dirname, 'audio', filename);

    // Generate TTS and save as .wav using `say`
    say.export(text, null, 1.0, filePath, (err) => {
        if (err) {
            console.error("Error generating TTS:", err);
            return res.status(500).json({ error: "Failed to generate TTS" });
        }
        // Send the file path back to the client
        res.json({ audioPath: `/audio/${filename}` });
    });
});

// Serve audio files statically
app.use('/audio', express.static(path.join(__dirname, 'audio')));

// Start the server
app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
});
