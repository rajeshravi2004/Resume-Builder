const ALLOWED_TYPES = new Set(['refine', 'design', 'linkedin']);
const PROVIDERS = { openai: { name: 'OpenAI', env: 'OPENAI_API_KEY' }, gemini: { name: 'Google Gemini', env: 'GEMINI_API_KEY' } };
const getAiProviders = () => Object.fromEntries(Object.entries(PROVIDERS).map(([id, config]) => [id, Boolean(process.env[config.env]?.trim())]));

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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-AI-API-Key, X-OpenAI-API-Key');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const provider = body.provider ?? 'openai';
    if (!Object.hasOwn(PROVIDERS, provider)) return res.status(400).json({ error: 'Select a supported AI provider: OpenAI or Google Gemini.' });
    if (body.model != null && typeof body.model !== 'string') return res.status(400).json({ error: 'Model must be a model ID.' });
    const selectedModel = provider === 'gemini' ? (body.model || '').trim().replace(/^models\//, '') : (body.model || '').trim();
    const validModel = provider === 'gemini' ? /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,199}$/ : /^[a-zA-Z0-9][a-zA-Z0-9._:/-]{0,199}$/;
    if (((body.model || '').trim() && !selectedModel) || (selectedModel && (!validModel.test(selectedModel) || selectedModel.includes('://')))) return res.status(400).json({ error: 'Enter a valid model ID without spaces or a URL in Settings.' });
    const config = PROVIDERS[provider];
    const suppliedKey = String(req.headers['x-ai-api-key'] || (provider === 'openai' ? req.headers['x-openai-api-key'] || '' : '')).trim();
    const apiKey = suppliedKey || process.env[config.env]?.trim();
    if (!apiKey) return res.status(503).json({ error: `${config.name} is not configured. Add its API key in Settings or configure ${config.env} on the server.` });
    if (!ALLOWED_TYPES.has(body.type)) return res.status(400).json({ error: 'Unsupported AI request' });

    let instructions;
    let input;
    let tools;
    if (body.type === 'refine') {
      if (!body.text || body.text.length > 15000) return res.status(400).json({ error: 'Text is required and must be under 15,000 characters.' });
      instructions = 'You are a meticulous executive resume editor. Return only the revised text. Preserve factual accuracy, dates, technologies, names, and metrics. Never invent achievements. Keep the natural voice and formatting appropriate for a professional resume.';
      input = `Context: ${String(body.context || 'resume content').slice(0, 500)}\nInstruction: ${String(body.instruction || 'Improve clarity and impact').slice(0, 1000)}\n\nText:\n${body.text}`;
    } else if (body.type === 'design') {
      if (!body.prompt || body.prompt.length > 3000) return res.status(400).json({ error: 'A design prompt is required.' });
      instructions = 'You are a senior editorial designer creating ATS-conscious resume systems. Return ONLY valid JSON. Do not add markdown. Use accessible contrast and conservative print-safe choices.';
      input = `Create an editable resume design from this request: ${body.prompt}\nReturn JSON exactly with this shape: {"name":"short design name","design":{"primaryColor":"#hex","accentColor":"#hex","textColor":"#hex","fontFamily":"one of Inter, Arial, Georgia, Times New Roman, Trebuchet, Garamond with fallbacks","headingFont":"same options","fontSize":number 8.5-13,"nameSize":number 24-46,"lineHeight":number 1.2-1.8,"pageMargin":number 20-56,"sectionSpacing":number 8-30,"itemSpacing":number 5-18,"layout":"one-column or two-column","sidebarSide":"left or right","sidebarWidth":number 25-40,"headerAlign":"left or center"}}`;
    } else {
      let profileUrl;
      try { profileUrl = new URL(String(body.url || '')); } catch { return res.status(400).json({ error: 'Enter a valid LinkedIn profile URL.' }); }
      const isLinkedIn = /(^|\.)linkedin\.com$/i.test(profileUrl.hostname) && /^\/in\/[^/]+/i.test(profileUrl.pathname);
      if (profileUrl.protocol !== 'https:' || !isLinkedIn) return res.status(400).json({ error: 'Use a public LinkedIn profile URL such as https://www.linkedin.com/in/username.' });
      const normalizedUrl = `${profileUrl.origin}${profileUrl.pathname}`;
      instructions = 'You extract factual resume information from a user-supplied public LinkedIn profile using web search. Return ONLY valid JSON with no markdown or commentary. Never infer facts from the URL slug, never invent dates, achievements, employers, education, skills, contact details, or metrics. Use empty strings and empty arrays for facts that are not explicitly supported by public web results. If the profile cannot be accessed or confidently identified, set verification.accessible to false.';
      input = `Inspect this exact public LinkedIn profile: ${normalizedUrl}\n\nReturn JSON exactly in this shape:\n{"basics":{"fullName":"","title":"","email":"","phone":"","location":"","website":"","linkedin":"${normalizedUrl}","summary":""},"sections":{"experience":[{"role":"","company":"","period":"","summary":""}],"projects":[{"name":"","tech":"","description":""}],"education":[{"degree":"","school":"","period":"","score":""}],"skills":[{"name":"Core skills","level":"comma-separated verified skills"}],"certifications":[{"name":"","year":""}],"languages":[{"name":"","level":""}],"interests":[{"name":""}]},"verification":{"accessible":true,"factsFound":0,"warnings":["limitations or uncertain fields"]}}\n\nOnly include entries supported by the exact profile or public results clearly referring to the same person. The summary may concisely paraphrase verified facts, but must not add claims.`;
      tools = [{ type: 'web_search' }];
    }

    const geminiModel = (selectedModel || (body.type === 'linkedin' && process.env.GEMINI_WEB_MODEL) || process.env.GEMINI_MODEL || 'gemini-3.6-flash').replace(/^models\//, '');
    const response = provider === 'gemini' ? await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(geminiModel)}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: instructions }] },
        contents: [{ role: 'user', parts: [{ text: input }] }],
        ...(body.type === 'design' ? { generationConfig: { responseMimeType: 'application/json' } } : {}),
        ...(body.type === 'linkedin' ? { tools: [{ google_search: {} }] } : {}),
      }),
    }) : await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: selectedModel || (body.type === 'linkedin' ? (process.env.OPENAI_WEB_MODEL || process.env.OPENAI_MODEL || 'gpt-5.4-mini') : (process.env.OPENAI_MODEL || 'gpt-5-mini')),
        instructions,
        input,
        store: false,
        ...(tools ? { tools, tool_choice: 'auto', max_tool_calls: 3, include: ['web_search_call.action.sources'] } : {}),
      }),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error?.message || `${config.name} request failed`);
    const output = provider === 'gemini'
      ? (payload.candidates?.[0]?.content?.parts || []).filter(part => !part.thought).map(part => part.text || '').join('')
      : extractText(payload);
    if (!output) throw new Error('The AI response was empty.');
    if (body.type === 'refine') return res.status(200).json({ text: output.trim() });
    const parsed = parseJson(output);
    if (body.type === 'linkedin') {
      if (!parsed?.verification?.accessible || !parsed?.basics?.fullName) return res.status(422).json({ error: 'LinkedIn did not expose enough public information for a reliable import. Check that the profile is public and try again.' });
      parsed.basics = { fullName: '', title: '', email: '', phone: '', location: '', website: '', linkedin: '', summary: '', ...parsed.basics, linkedin: String(body.url).trim() };
      const sections = parsed.sections || {};
      parsed.sections = Object.fromEntries(['experience', 'projects', 'education', 'skills', 'certifications', 'languages', 'interests'].map(key => [key, Array.isArray(sections[key]) ? sections[key] : []]));
    }
    return res.status(200).json(parsed);
  } catch (error) {
    console.error('AI request failed:', error);
    return res.status(500).json({ error: error.message || 'AI request failed' });
  }
};

module.exports.getAiProviders = getAiProviders;
