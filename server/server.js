import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config(); // učitaj .env

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const AZURE_URL = process.env.AZURE_URL;
const API_KEY = process.env.API_KEY;

app.post("/predict", async (req, res) => {
    try {
        const response = await fetch(AZURE_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify(req.body)
        });

        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.toString() });
    }
});

app.listen(PORT, () => console.log(`Proxy server running on http://localhost:${PORT}`));
