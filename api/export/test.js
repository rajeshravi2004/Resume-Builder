module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  try {
    return res.status(200).json({
      success: true,
      message: 'API is working',
      method: req.method,
      body: req.body,
      headers: req.headers,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Test failed',
      message: err.message
    });
  }
};

