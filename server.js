
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('🚀 Travellio AI is live and ready!');
});

// Endpoint for webhook testing
app.post('/webhook', express.json(), (req, res) => {
  console.log('Webhook received:', req.body);
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`🔥 Server running on port ${port}`);
});
