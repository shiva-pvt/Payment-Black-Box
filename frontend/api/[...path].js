export default async function handler(req, res) {
  // Extract the original path from the request URL
  const targetPath = req.url.replace(/^\/api/, '');
  const url = `https://payment-black-box-production.up.railway.app${targetPath}`;
  
  try {
    const options = {
      method: req.method,
      headers: {
        'Content-Type': req.headers['content-type'] || 'application/json'
      }
    };
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      options.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }
    
    const response = await fetch(url, options);
    
    // Parse response
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
