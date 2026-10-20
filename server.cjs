// Truehost/cPanel Passenger entry point. Install and build on the hosting server.
process.env.NODE_ENV = 'production';
const http = require('node:http');
const next = require('next');
const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();
app.prepare().then(() => {
  const server = http.createServer((req, res) => {
    handle(req, res).catch(error => {
      console.error('Request failed', error);
      if (!res.headersSent) res.writeHead(500);
      res.end('The atelier is temporarily unavailable.');
    });
  });
  server.listen(process.env.PORT || 3000);
}).catch(error => { console.error('Startup failed', error); process.exit(1); });
