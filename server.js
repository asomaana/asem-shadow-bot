const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "asemshadow2025";
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || "YOUR_WHATSAPP_TOKEN"; // غيّرها إذا بدك

app.use(bodyParser.json());

// Webhook verification (GET)
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

// Handle messages (POST)
app.post("/webhook", async (req, res) => {
 const body = req.body;

 if (body.object === "whatsapp_business_account") {
   body.entry.forEach(async (entry) => {
     const changes = entry.changes || [];
     const value = changes[0]?.value;
     const message = value?.messages?.[0];
     const phone_number_id = value?.metadata?.phone_number_id;
     const from = message?.from;
     const text = message?.text?.body;

     if (from && text) {
       console.log(`Received message from ${from}: ${text}`);

       // رد تلقائي
       await axios.post(
         `https://graph.facebook.com/v17.0/${phone_number_id}/messages`,
         {
           messaging_product: "whatsapp",
           to: from,
           text: { body: "هلا والله! معك عاصم الظل، كيف أقدر أساعدك؟" },
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

   res.sendStatus(200);
 } else {
   res.sendStatus(404);
 }
});

app.listen(PORT, () => {
 console.log("عاصم الظل شغّال على البورت", PORT);
});
