const express = require('express');
const axios = require('axios');
const Groq = require('groq-sdk');
const path = require('path');
const dotenv = require('dotenv');

// Initialize dotenv to load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Initialize the Groq SDK with the API key
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Middleware to parse JSON data
app.use(express.json());
app.use(express.static('public'));

// Serve index.html at the root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle POST request for chatbot interaction
app.post('/api/chat', async (req, res) => {
    const userMessage = req.body.message;

    try {
        // Create chat completion request to Groq API
        const chatCompletion = await groq.chat.completions.create({
            "messages": [
                { "role": "user", "content": userMessage }
            ],
            "model": "llama-3.1-70b-versatile",  // You can change the model as needed
            "temperature": 1,
            "max_tokens": 1024,
            "top_p": 1,
            "stream": false,  // Set stream to false for simplicity
            "stop": null
        });

        // Check if we have a valid response and send it back
        const answer = chatCompletion.choices[0]?.message?.content || "Sorry, I couldn't understand your question.";
        res.json({ answer });
    } catch (error) {
        console.error('Error querying Groq API:', error.message);
        res.status(500).json({ error: 'Failed to get a response from Groq API' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
