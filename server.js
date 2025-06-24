const express = require("express");
const bodyParser = require("body-parser");
const { OpenAI } = require("openai");

const app = express();

app.use(bodyParser.json());

// Load environment variables
require("dotenv").config();

// Initialize OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure your .env file contains the correct API key
});

app.post("/ask", async (req, res) => {
  try {
    const { question } = req.body;

    // Use the completion API of OpenAI
    const response = await openai.completions.create({
      model: "text-davinci-003", // or "gpt-3.5-turbo", depending on the model you want to use
      prompt: question,
      max_tokens: 150,
    });

    res.json({ answer: response.choices[0].text.trim() });
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong!");
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});


