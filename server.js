const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// بيانات API من Meta
const WHATSAPP_TOKEN = "EAAOLyeDxkKABOZBCYwZB2ZA76xmQ3MMiXys47RZAcgZAk9X5OnDHfvoinlkRZBnyoDAopitikymtme6cCDQzq5MuooHHcjGZCFdP2DFSRJm66RvlZCCEWLmX03DXoy9YpsW1WhSvGvfEyb48kNvjZBySrM2LdAMZBrQdEBBShEyF8XsTbo1dlWgBQIP342TJXpIZAHQI06qmhHgp6SHZAyb79pgkOA4ZD";
const PHONE_NUMBER_ID = "598960679972985"; // Phone number ID من Meta

app.use(bodyParser.json());

// صفحة اختبار بسيطة على المتصفح
app.get("/webhook", (req, res) => {
  res.send("Webhook endpoint for Travellio AI is live!");
});

// تحقق Meta من الربط
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === "123456shadowAsem") {
    console.log("Webhook verified successfully.");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// استقبال رسائل واتساب والرد عليها
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

      // ردود أولية ذكية
      if (text.includes("مرحبا") || text.includes("السلام")) {
        reply = "هلا بيك، معك Travelio AI. كيف بقدر أساعدك اليوم؟";
      } else if (text.includes("فندق") || text.includes("السعر")) {
        reply = "ممكن ترسللي اسم الفندق وتاريخ الوصول والمغادرة؟";
      } else if (text.includes("شكرا") || text.includes("ممتاز")) {
        reply = "العفو يا غالي، أنا بالخدمة دايمًا.";
      } else {
        reply = "وصلت رسالتك، براجعها وبرجعلك بأقرب وقت.";
      }

      // إرسال الرد عبر واتساب Cloud API
      await axios({
        method: "POST",
        url: `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        },
        data: {
          messaging_product: "whatsapp",
          to: from,
          text: { body: reply },
        },
      });
    }

    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

// تشغيل السيرفر
app.listen(PORT, () => {
  console.log(`Travellio AI server is running on port ${PORT}`);
});