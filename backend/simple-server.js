const express = require('express');
const app = express();

app.get('/', (req, res) => {
  console.log('Request received at /');
  res.send('Hello from Express on port 3000!');
});

app.get('/test', (req, res) => {
  console.log('Request received at /test');
  res.json({ message: 'Test endpoint working on port 3000' });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Express server listening on ${PORT}`);
});
