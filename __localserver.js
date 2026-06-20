const http = require('http');
const fs = require('fs');
const path = require('path');
const root = 'C:\\Users\\dugus\\PycharmProjects\\skin1';
const mime = {
  'html': 'text/html; charset=utf-8',
  'css':  'text/css; charset=utf-8',
  'js':   'application/javascript; charset=utf-8',
  'png':  'image/png',
  'jpg':  'image/jpeg',
  'jpeg': 'image/jpeg',
  'webp': 'image/webp',
  'svg':  'image/svg+xml',
  'ico':  'image/x-icon'
};
http.createServer((req, res) => {
  let url = req.url.split('?')[0];
  let filePath = path.join(root, url === '/' ? 'hero-preview.html' : url);
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    const ext = filePath.split('.').pop().toLowerCase();
    res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(3000, '127.0.0.1', () => { console.log('ready'); });
