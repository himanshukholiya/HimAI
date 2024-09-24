import express from 'express';
import fetch from 'node-fetch';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Load personal data
const personalData = JSON.parse(fs.readFileSync('data.json', 'utf8'));

// Endpoint to handle the search queries
app.post('/chat', async (req, res) => {
    const { question } = req.body;

    if (!question) {
        return res.status(400).json({ message: 'Question is required' });
    }

    // Combine personal data with the user query
    const prompt = `${personalData.intro}\n\nUser's Question: ${question}`;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }]
            })
        });

        const data = await response.json();
        const answer = data.choices[0].message.content;
        res.json({ message: answer });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching response from OpenAI.' });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));