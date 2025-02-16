const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const GEMINI_KEY = process.env.GEMINI_KEY;
const DEEPGRAM_KEY = process.env.DEEPGRAM_KEY;

app.post('/ask', async (req, res) => {
    try {
        // Get Gemini response
        const geminiRes = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_KEY}`,
            { contents: [{ parts: [{ text: req.body.text }] }] }
        );

        const answer = geminiRes.data.candidates[0].content.parts[0].text;

        // Get TTS from Deepgram
        const ttsRes = await axios.post(
            'https://api.deepgram.com/v1/speak?model=aura-asteria-en',
            { text: answer },
            {
                headers: {
                    'Authorization': `Token ${DEEPGRAM_KEY}`,
                    'Content-Type': 'application/json'
                },
                responseType: 'stream'
            }
        );

        // Stream audio to ESP32
        res.setHeader('Content-Type', 'audio/wav');
        ttsRes.data.pipe(res);

    } catch (error) {
        console.error(error);
        res.status(500).send("Processing error");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
