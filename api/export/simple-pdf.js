module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    return res.status(200).json({
      success: true,
      message: 'Simple PDF endpoint is accessible',
      note: 'This is a test endpoint. Use /api/export/pdf for actual PDF generation.',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Test failed',
      message: err.message
    });
  }
};

