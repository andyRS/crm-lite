const http = require('http');

console.log('Starting HTTP server...');

const server = http.createServer((req, res) => {
  console.log(`[${new Date().toISOString()}] Request received: ${req.method} ${req.url} from ${req.socket.remoteAddress}:${req.socket.remotePort}`);

  if (req.url === '/test') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Test endpoint working!', timestamp: new Date().toISOString() }));
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello from HTTP server!');
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] HTTP server listening on ${PORT}`);
  console.log(`Server address: http://localhost:${PORT}`);
  console.log('Ready to accept connections...');
});

// Handle server errors
server.on('error', (err) => {
  console.error('Server error:', err);
});

// Handle connection events
server.on('connection', (socket) => {
  console.log(`[${new Date().toISOString()}] New connection from ${socket.remoteAddress}:${socket.remotePort}`);
});