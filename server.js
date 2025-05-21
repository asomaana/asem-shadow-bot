const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

app.use(bodyParser.json());

// Webhook verification
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

// Handle incoming messages
app.post("/webhook", async (req, res) => {
  const body = req.body;

  if (body.object) {
    const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    const senderPhone = message?.from;
    const receivedText = message?.text?.body?.trim().toLowerCase();

    if (receivedText && senderPhone) {
      console.log("Received message:", receivedText);

      let replyText = `أهلاً بيك، وصلت رسالتك: ${receivedText}`;

      // ردود ذكية حسب الكلمات
      if (receivedText.includes("صباح الخير")) {
        replyText = "يا صباح الورد، معك Travelio AI";
      } else if (receivedText.includes("مساء الخير")) {
        replyText = "مساء النور، كيف فيني أساعدك؟";
      } else if (receivedText.includes("مين انت") || receivedText.includes("ذكاء صناعي") || receivedText.includes("بوت")) {
        replyText = "مش مهم، أنا بشتغل 24/7 وما بتعب، أنا عاصم وأوجدني عاصم وسماني Travelio AI";
      }

      try {
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
      } catch (error) {
        console.error("Error sending reply:", error.response?.data || error.message);
      }
    }

    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
