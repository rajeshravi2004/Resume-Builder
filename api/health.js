const { getAiProviders } = require('./ai');

module.exports = async (req, res) => {
  const aiProviders = getAiProviders();
  res.json({
    ok: true,
    aiConfigured: Object.values(aiProviders).some(Boolean),
    aiProviders,
    timestamp: new Date().toISOString(),
  });
};

