export default async function handler(req, res) {
  // Original URL in Vercel is req.url
  // For a request to /api/transactions/123, req.url will be /api/transactions/123
  // Strip the /api prefix
  const targetPath = req.url.replace(/^\/api/, '');
  
  // Clean URL construction
  const url = `https://payment-black-box-production.up.railway.app${targetPath}`;

  try {
    const options = {
      method: req.method,
      headers: {}
    };
    
    if (req.headers['content-type']) {
        options.headers['Content-Type'] = req.headers['content-type'];
    } else {
        options.headers['Content-Type'] = 'application/json';
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      options.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }
    
    const response = await fetch(url, options);
    const data = await response.text();
    let json;
    try {
        json = JSON.parse(data);
    } catch(e) {
        return res.status(response.status).send(data);
    }
    return res.status(response.status).json(json);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
