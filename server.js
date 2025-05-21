const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

app.use(bodyParser.json());

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

app.post("/webhook", async (req, res) => {
 const body = req.body;

 if (body.object) {
   const entry = body.entry?.[0];
   const changes = entry?.changes?.[0];
   const message = changes?.value?.messages?.[0];

   if (message && message.text && message.from) {
     const senderPhone = message.from;
     const receivedText = message.text.body.toLowerCase();

     console.log("Received message:", receivedText);

     const replyText = `أهلاً بيك، وصلت رسالتك: ${receivedText}`;

     await axios.post(
       `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
       {
         messaging_product: "whatsapp",
         to: senderPhone,
         text: { body: replyText },
       },
       {
         headers: {
           Authorization: `Bearer ${WHATSAPP_TOKEN}`,
           "Content-Type": "application/json",
         },
       }
     );
   }

   res.sendStatus(200);
 } else {
   res.sendStatus(404);
 }
});

app.listen(PORT, () => {
 console.log(`Server is running on port ${PORT}`);
});