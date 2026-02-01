import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const AZURE_URL = process.env.AZURE_URL;
const API_KEY = process.env.API_KEY;

app.post("/predict", async (req, res) => {
  try {
    const payload = req.body;

    const response = await fetch(AZURE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).send(text);
    }

    const result = await response.json();
    res.json(result);

  } catch (err) {
    console.error("Greška kod proxy servera:", err);
    res.status(500).send({ error: "Greška kod proxy servera" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));
