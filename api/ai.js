const ALLOWED_TYPES = new Set(['refine', 'design']);

const extractText = payload => {
  if (payload.output_text) return payload.output_text;
  return (payload.output || []).flatMap(item => item.content || []).find(item => item.type === 'output_text')?.text || '';
};

const parseJson = value => {
  const cleaned = value.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  return JSON.parse(cleaned);
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.OPENAI_API_KEY) return res.status(503).json({ error: 'AI is not configured. Add OPENAI_API_KEY to the server environment.' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    if (!ALLOWED_TYPES.has(body.type)) return res.status(400).json({ error: 'Unsupported AI request' });

    let instructions;
    let input;
    if (body.type === 'refine') {
      if (!body.text || body.text.length > 15000) return res.status(400).json({ error: 'Text is required and must be under 15,000 characters.' });
      instructions = 'You are a meticulous executive resume editor. Return only the revised text. Preserve factual accuracy, dates, technologies, names, and metrics. Never invent achievements. Keep the natural voice and formatting appropriate for a professional resume.';
      input = `Context: ${String(body.context || 'resume content').slice(0, 500)}\nInstruction: ${String(body.instruction || 'Improve clarity and impact').slice(0, 1000)}\n\nText:\n${body.text}`;
    } else {
      if (!body.prompt || body.prompt.length > 3000) return res.status(400).json({ error: 'A design prompt is required.' });
      instructions = 'You are a senior editorial designer creating ATS-conscious resume systems. Return ONLY valid JSON. Do not add markdown. Use accessible contrast and conservative print-safe choices.';
      input = `Create an editable resume design from this request: ${body.prompt}\nReturn JSON exactly with this shape: {"name":"short design name","design":{"primaryColor":"#hex","accentColor":"#hex","textColor":"#hex","fontFamily":"one of Inter, Arial, Georgia, Times New Roman, Trebuchet, Garamond with fallbacks","headingFont":"same options","fontSize":number 8.5-13,"nameSize":number 24-46,"lineHeight":number 1.2-1.8,"pageMargin":number 20-56,"sectionSpacing":number 8-30,"itemSpacing":number 5-18,"layout":"one-column or two-column","sidebarSide":"left or right","sidebarWidth":number 25-40,"headerAlign":"left or center"}}`;
    }

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-5-mini', instructions, input, store: false }),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error?.message || 'OpenAI request failed');
    const output = extractText(payload);
    if (!output) throw new Error('The AI response was empty.');
    if (body.type === 'refine') return res.status(200).json({ text: output.trim() });
    const parsed = parseJson(output);
    return res.status(200).json(parsed);
  } catch (error) {
    console.error('AI request failed:', error);
    return res.status(500).json({ error: error.message || 'AI request failed' });
  }
};

