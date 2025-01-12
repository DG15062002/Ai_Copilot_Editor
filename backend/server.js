require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const modelFlash = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });

app.post("/ai/:action", async (req, res) => {
  const { action } = req.params;
  const { text } = req.body;

  let prompt = text;
  if (action === "shorten") prompt += " Make it shorter and concise.";
  else if (action === "lengthen") prompt += " Make it longer and elaborative.";

  try {
    console.log("Sending prompt to Google Generative AI:", prompt);
    const result = await modelFlash.generateContent(prompt);
    console.log("Received result:", result);

    // Ensure that we call the text function to retrieve the response text
    const output = await result.response.text(); // Call the text function

    res.json({ result: output });
  } catch (err) {
    console.error("AI API Error: ", err);
    res.status(500).json({ error: `Failed to process AI request: ${err.message}` });
  }
});

app.listen(5001, () => console.log("Server running on http://localhost:5001"));
