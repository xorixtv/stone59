const http = require('http');

const UPSTREAM = 'https://headless-pdwbqmlmldp-mahdicoppieters-140f.wix-site-host.com';
const PORT = process.env.PORT || 10000;

const server = http.createServer(async (req, res) => {
  try {
    const target = new URL(req.url || '/', UPSTREAM);
    const upstream = await fetch(target, {
      method: req.method,
      headers: {
        'user-agent': req.headers['user-agent'] || 'STONE59'
      },
      redirect: 'follow'
    });

    const headersToSkip = new Set([
      'content-security-policy',
      'content-security-policy-report-only',
      'x-frame-options',
      'transfer-encoding',
      'content-length',
      'connection'
    ]);

    upstream.headers.forEach((value, key) => {
      if (!headersToSkip.has(key.toLowerCase())) {
        try { res.setHeader(key, value); } catch {}
      }
    });

    res.setHeader('cache-control', 'public, max-age=60');
    res.statusCode = upstream.status;

    if (req.method === 'HEAD') {
      res.end();
      return;
    }

    const body = Buffer.from(await upstream.arrayBuffer());
    res.end(body);
  } catch (err) {
    res.statusCode = 502;
    res.setHeader('content-type', 'text/plain; charset=utf-8');
    res.end('STONE59 temporairement indisponible.');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('STONE59 running on port ' + PORT);
});
