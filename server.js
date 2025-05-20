const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// قراءة التوكنات من Environment Variables
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

app.use(bodyParser.json());

// تأكيد الربط مع فيسبوك
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

// استلام الرسائل من واتساب
app.post("/webhook", async (req, res) => {
  const body = req.body;

  if (body.object) {
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (message && message.type === "text") {
      const from = message.from;
      const text = message.text.body.toLowerCase();
      console.log("Received message:", text);

      let reply = "";

      // الردود الذكية
      if (text.includes("مرحبا") || text.includes("السلام")) {
        reply = "أهلاً وسهلاً! كيف فيني أساعدك اليوم؟";
      } else if (text.includes("اسطنبول") || text.includes("istanbul")) {
        reply = "لدينا باقات رائعة إلى إسطنبول! بتحب أرسل لك التفاصيل؟";
      } else if (text.includes("شكرا") || text.includes("thx")) {
        reply = "العفو، هذا واجبي!";
      } else {
        reply = "معك Travelio AI – كيف بقدر أساعدك؟";
      }

      // إرسال الرد
      await axios.post(
        `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: "whatsapp",
          to: from,
          text: { body: reply },
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

// تشغيل السيرفر
app.listen(PORT, () => {
  console.log(`عاصم الظل شغال على البورت ${PORT}`);
});