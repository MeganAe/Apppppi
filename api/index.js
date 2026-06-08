const express = require("express");
const cors = require("cors");
const { Hercai } = require("hercai");
const path = require("path");

const app = express();
const _client = new Hercai();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

const AVAILABLE_MODELS = [
  "v3", "v3-32k", "turbo", "turbo-16k",
  "gemini", "llama3-70b", "llama3-8b",
  "mixtral-8x7b", "gemma-7b", "gemma2-9b",
];

// ─────────────────────────────────────────────
//  GET /api/ai?prompt=...&model=...
// ─────────────────────────────────────────────
app.get("/api/ai", async (req, res) => {
  const { prompt, model = "v3" } = req.query;

  if (!prompt) {
    return res.status(400).json({
      success: false,
      error: "Le paramètre 'prompt' est requis.",
      example: "/api/ai?prompt=Bonjour comment vas-tu?",
    });
  }

  if (!AVAILABLE_MODELS.includes(model)) {
    return res.status(400).json({
      success: false,
      error: `Modèle invalide. Choisissez parmi : ${AVAILABLE_MODELS.join(", ")}`,
    });
  }

  try {
    const response = await _client.chat.completions.create({
      model: model,
      messages: [{ role: "user", content: prompt }],
    });

    const reply = response?.reply || response?.choices?.[0]?.message?.content || "";

    return res.json({
      success: true,
      model,
      prompt,
      reply,
    });
  } catch (err) {
    console.error("AI error:", err);
    return res.status(500).json({
      success: false,
      error: "Erreur lors du traitement de la requête.",
      details: err.message,
    });
  }
});

// ─────────────────────────────────────────────
//  GET /api/models
// ─────────────────────────────────────────────
app.get("/api/models", (req, res) => {
  res.json({ success: true, models: AVAILABLE_MODELS, default: "v3" });
});

// ─────────────────────────────────────────────
//  GET /api/health
// ─────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ success: true, status: "online", message: "Soli Deo Gloria 🙏" });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

module.exports = app;
      
