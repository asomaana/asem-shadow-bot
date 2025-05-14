const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
const port = process.env.PORT || 3000;

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "asemshadow2025";
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || "EAAOLyeDxkKABO9Ke4kLM0MNnE6gvCodgsIlpYGNXrUkHMYZA4qhC6UFwOQl9XhDzyhtsFPbLogR7mhs0U64xkkyQ2TVPLBtlrbUGCb5u3SgvzzBCVRZCr0h3TGpHEI23tcouHwgxEbzRdZAZBmBYigrqAavkgPMhZBopndH0Y5IFzE5uEu2ePCjcJPTLyycjwTs4sNqckZCYcgZAdU27dESfzgZD";

app.use(bodyParser.json());

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.post("/webhook", async (req, res) => {
  const body = req.body;
  if (body.object === "whatsapp_business_account") {
    body.entry.forEach(async (entry) => {
      const changes = entry.changes;
      changes.forEach(async (change) => {
        const message = change.value.messages?.[0];
        const from = message?.from;
        const text = message?.text?.body;

        console.log("رسالة وصلت من:", from, "المحتوى:", text);

        if (text) {
          // رد تلقائي
          await axios.post(
            "https://graph.facebook.com/v18.0/598996079972985/messages",
            {
              messaging_product: "whatsapp",
              to: from,
              text: { body: "هلا بيك تفضل، عاصم الظل معك!" },
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

app.listen(port, () => {
  console.log(`عاصم الظل شغال على البورت ${port}`);
});