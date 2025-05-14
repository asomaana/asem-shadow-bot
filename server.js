const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "asemshadow2025";
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || "YOUR_WHATSAPP_TOKEN_HERE"; // غيّر هذا لو ما استخدمت Environment Variables

app.use(bodyParser.json());

// Webhook verification
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Handle incoming messages
app.post("/webhook", async (req, res) => {
  const body = req.body;

  if (body.object === "whatsapp_business_account") {
    body.entry.forEach(async (entry) => {
      const changes = entry.changes || [];
      changes.forEach(async (change) => {
        const message = change.value?.messages?.[0];
        const phone_number_id = change.value?.metadata?.phone_number_id;
        const from = message?.from;
        const msg_body = message?.text?.body;

        if (msg_body && from && phone_number_id) {
          await axios.post(
            `https://graph.facebook.com/v19.0/${phone_number_id}/messages`,
            {
              messaging_product: "whatsapp",
              to: from,
              text: { body: `هلا بيك، وصلتني: ${msg_body}` },
            },
            {
              headers: {
                Authorization: `Bearer ${WHATSAPP_TOKEN}`,
                "Content-Type": "application/json",
              },
            }
          );
        }
      });
    });

    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

app.listen(PORT, () => {
  console.log(`عاصم الظل شغال على البورت ${PORT}`);
});