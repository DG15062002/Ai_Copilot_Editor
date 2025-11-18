// backend/server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// healthcheck for docker
app.get('/health', (req, res) => res.send('ok'));

// Dummy AI routes
app.post('/api/make-shorter', (req, res) => {
  const { text } = req.body;
  res.json({ result: `Shorter version of: ${text}` });
});

app.post('/api/make-longer', (req, res) => {
  const { text } = req.body;
  res.json({ result: `Longer version of: ${text}` });
});

// Start server - read PORT and listen on 0.0.0.0
const PORT = process.env.PORT || 5005;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
