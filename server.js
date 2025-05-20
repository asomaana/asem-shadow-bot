const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const app = express();
const PORT = process.env.PORT || 3000;

// استدعاء المتغيرات من Environment
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

app.use(bodyParser.json());

// تأكيد تشغيل السيرفر
app.get("/", (req, res) => {
  res.send("Travellio AI is live");
});

// تحقق Webhook من Meta
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified successfully.");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// استقبال الرسائل من Meta
app.post("/webhook", async (req, res) => {
  const body = req.body;

  if (body.object) {
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const message = changes?.value?.messages?.[0];

    if (message?.type === "text") {
      const from = message.from;
      const text = message.text.body.toLowerCase();

      console.log("Received message:", text);

      // الرد
      const reply = {
        messaging_product: "whatsapp",
        to: from,
        text: { body: ⁠ تم استلام: ${text} ⁠ },
      };

      try {
        await axios.post(
          ⁠ https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages ⁠,
          reply,
          {
            headers: {
              Authorization: ⁠ Bearer ${WHATSAPP_TOKEN} ⁠,
              "Content-Type": "application/json",
            },
          }
        );
      } catch (error) {
        console.error("Error sending message:", error.response?.data || error);
      }
    }

    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

app.listen(PORT, () => {
  console.log(⁠ عاصم الظل شغال على البورت ${PORT} ⁠);
});