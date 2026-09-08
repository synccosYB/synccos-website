const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const sgMail = require('@sendgrid/mail');

const PORT = 5000;
const HOST = '0.0.0.0';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'support@synccos.com';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@synccos.com';
const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
const RECAPTCHA_SITE_KEY = process.env.RECAPTCHA_SITE_KEY;

async function verifyRecaptcha(token) {
  if (!RECAPTCHA_SECRET_KEY) return true;
  
  return new Promise((resolve) => {
    const postData = `secret=${RECAPTCHA_SECRET_KEY}&response=${token}`;
    const options = {
      hostname: 'www.google.com',
      path: '/recaptcha/api/siteverify',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result.success === true);
        } catch {
          resolve(false);
        }
      });
    });
    
    req.on('error', () => resolve(false));
    req.write(postData);
    req.end();
  });
}

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.php': 'text/html',
  '.xml': 'application/xml',
  '.txt': 'text/plain'
};

const cleanPaths = [
  'connexabi', 'pricing', 'voip', 'contact', 'check-writer', 'feed',
  'roadmap', 'faq', 'synccos-os',
  'synccos-cookies-policy', 'synccos-data-processing', 
  'synccos-privacy-policy', 'synccos-terms-of-service',
  'wp-content', 'wp-includes', 'wp-json', 'comments',
  'blog'
];

async function handleContactForm(req, res) {
  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', async () => {
    try {
      const params = new URLSearchParams(body);
      const name = params.get('your-name') || '';
      const email = params.get('your-email') || '';
      const phone = params.get('tel-272') || '';
      const subject = params.get('subject') || '';
      const message = params.get('message') || '';
      const recaptchaToken = params.get('g-recaptcha-response') || '';

      if (!name || !email || !message) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Please fill in all required fields.' }));
        return;
      }

      if (RECAPTCHA_SECRET_KEY && RECAPTCHA_SITE_KEY) {
        if (!recaptchaToken) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Please complete the CAPTCHA.' }));
          return;
        }

        const isValidCaptcha = await verifyRecaptcha(recaptchaToken);
        if (!isValidCaptcha) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'CAPTCHA verification failed. Please try again.' }));
          return;
        }
      }

      const msg = {
        to: ADMIN_EMAIL,
        from: FROM_EMAIL,
        subject: `Contact Form: ${subject} - from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nProduct: ${subject}\n\nMessage:\n${message}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Product of Interest:</strong> ${subject}</p>
          <h3>Message:</h3>
          <p>${message.replace(/\n/g, '<br>')}</p>
        `
      };

      await sgMail.send(msg);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Thank you! Your message has been sent.' }));
    } catch (error) {
      console.error('SendGrid error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Failed to send message. Please try again later.' }));
    }
  });
}

const server = http.createServer((req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method === 'POST' && req.url === '/api/contact') {
    return handleContactForm(req, res);
  }

  if (req.method === 'GET' && req.url === '/api/recaptcha-key') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ siteKey: RECAPTCHA_SITE_KEY || '' }));
    return;
  }

  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  
  if (urlPath === '/') {
    urlPath = '/synccos.com/';
  }
  
  // Handle root-level files like sitemap.xml and robots.txt
  if (urlPath === '/sitemap.xml' || urlPath === '/robots.txt') {
    urlPath = '/synccos.com' + urlPath;
  }
  
  const pathSegment = urlPath.split('/')[1];
  if (cleanPaths.includes(pathSegment)) {
    urlPath = '/synccos.com' + urlPath;
  }
  
  let filePath = '.' + urlPath;

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  const extname = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        if (extname === '.js') {
          res.writeHead(404, { 'Content-Type': 'application/javascript' });
          res.end('');
          return;
        }
        fs.readFile('./synccos.com/404.html', (err404, content404) => {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          if (err404) {
            res.end('<h1>404 - Page Not Found</h1>');
          } else {
            res.end(content404);
          }
        });
      } else {
        res.writeHead(500);
        res.end('Server Error: ' + err.code);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Static file server running at http://${HOST}:${PORT}/`);
});
