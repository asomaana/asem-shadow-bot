
const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const app = express();
require("dotenv").config();

const PORT = process.env.PORT || 10000;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const AI_API_URL = "https://shadow-csq8go14t-asem-bakirs-projects.vercel.app";


app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Shadow bot is live");
});

app.post("/webhook", async (req, res) => {
  const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  const senderPhone = message?.from;
  const text = message?.text?.body?.trim();

  if (senderPhone && text) {
    console.log("Received:", text);

    try {
      const aiRes = await axios.post(AI_API_URL, { message: text });
      const reply = aiRes.data.reply;

      if (reply) {
        await axios.post(`https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`, {
          messaging_product: "whatsapp",
          to: senderPhone,
          type: "text",
          text: { body: reply },
        }, {
          headers: {
            Authorization: `Bearer ${WHATSAPP_TOKEN}`,
            "Content-Type": "application/json",
          },
        });
      }
    } catch (err) {
      console.error("Error sending AI reply:", err.response?.data || err.message);
    }
  }

  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Bot is live on port ${PORT}`);
});