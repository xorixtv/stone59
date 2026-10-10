const http = require('http');

const UPSTREAM = 'https://headless-pdwbqmlmldp-mahdicoppieters-140f.wix-site-host.com';
const PORT = process.env.PORT || 10000;

const CRITICAL_STYLE = `
<style id="stone59-critical">
html,body{margin:0;background:#050505;color:#fff}
body{overflow:hidden}
.intro{
  position:fixed!important;
  inset:0!important;
  z-index:3000!important;
  background:#020202!important;
  display:grid!important;
  place-items:center!important;
  text-align:center!important;
}
#site,.topbar{visibility:hidden}
html.stone59-ready #site,
html.stone59-ready .topbar{visibility:visible}
</style>
<script>
(function(){
  function reveal(){
    document.documentElement.classList.add('stone59-ready');
  }
  if(document.readyState==='complete'){
    reveal();
  }else{
    window.addEventListener('load',reveal,{once:true});
    setTimeout(reveal,2500);
  }
})();
</script>`;

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

    const contentType = upstream.headers.get('content-type') || '';
    const raw = Buffer.from(await upstream.arrayBuffer());

    if (contentType.includes('text/html')) {
      let html = raw.toString('utf8');
      if (html.includes('</head>')) {
        html = html.replace('</head>', CRITICAL_STYLE + '\n</head>');
      } else {
        html = CRITICAL_STYLE + html;
      }
      res.setHeader('content-type', 'text/html; charset=utf-8');
      res.end(html);
      return;
    }

    res.end(raw);
  } catch (err) {
    res.statusCode = 502;
    res.setHeader('content-type', 'text/plain; charset=utf-8');
    res.end('STONE59 temporairement indisponible.');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('STONE59 running on port ' + PORT);
});
