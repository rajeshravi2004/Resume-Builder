const assert = require('node:assert/strict');
const handler = require('../api/ai');
const health = require('../api/health');

const invoke = async (body, headers = {}, method = 'POST', target = handler) => {
  const res = { code: 200, headers: {}, setHeader(key, value) { this.headers[key] = value; }, status(code) { this.code = code; return this; }, json(data) { this.data = data; return this; }, end() { return this; } };
  await target({ body, headers, method }, res);
  return res;
};

(async () => {
  const originalFetch = global.fetch;
  const originalEnv = { ...process.env };
  let requests = [];
  let output = 'Revised resume text';
  global.fetch = async (url, options) => {
    requests.push({ url, ...options, body: JSON.parse(options.body) });
    return { ok: true, json: async () => url.includes('googleapis')
      ? { candidates: [{ content: { parts: [{ thought: true, text: 'Hidden reasoning' }, { text: output }] } }] }
      : { output: [{ content: [{ type: 'output_text', text: output }] }] } };
  };
  try {
    delete process.env.OPENAI_API_KEY;
    delete process.env.GEMINI_API_KEY;
    for (const provider of ['openai', 'gemini']) {
      const result = await invoke({ type: 'refine', provider, text: 'Resume' });
      assert.equal(result.code, 503);
      assert.match(result.data.error, /Settings/);
    }
    assert.equal((await invoke({ provider: 'constructor' })).code, 400);
    assert.equal(requests.length, 0);
    process.env.OPENAI_API_KEY = 'server-openai-test-key';
    assert.equal((await invoke({ type: 'refine', provider: 'gemini', text: 'Resume' }, { 'x-openai-api-key': 'legacy-openai-test-key' })).code, 503);
    assert.deepEqual(handler.getAiProviders(), { openai: true, gemini: false });
    let result = await invoke({ type: 'refine', text: 'Resume' }, { 'x-openai-api-key': 'legacy-openai-test-key' });
    assert.equal(result.data.text, output);
    assert.equal(requests.at(-1).headers.Authorization, 'Bearer legacy-openai-test-key');
    result = await invoke({ type: 'refine', provider: 'gemini', text: 'Resume' }, { 'x-ai-api-key': 'session-gemini-test-key' });
    assert.equal(result.data.text, output);
    assert.match(requests.at(-1).url, /^https:\/\/generativelanguage.googleapis.com\//);
    assert.equal(requests.at(-1).headers['x-goog-api-key'], 'session-gemini-test-key');
    assert.equal(requests.at(-1).headers.Authorization, undefined);
    assert.ok(requests.at(-1).body.systemInstruction.parts[0].text);
    process.env.GEMINI_API_KEY = 'server-gemini-test-key';
    output = JSON.stringify({ name: 'Editorial', design: { layout: 'one-column' } });
    result = await invoke({ type: 'design', provider: 'gemini', prompt: 'Simple' });
    assert.equal(result.data.name, 'Editorial');
    assert.equal(requests.at(-1).body.generationConfig.responseMimeType, 'application/json');
    assert.equal(requests.at(-1).headers['x-goog-api-key'], 'server-gemini-test-key');
    result = await invoke({ type: 'design', provider: 'gemini', prompt: 'Simple' }, { 'x-ai-api-key': 'personal-gemini-test-key' });
    assert.equal(requests.at(-1).headers['x-goog-api-key'], 'personal-gemini-test-key');
    output = JSON.stringify({ basics: { fullName: 'Test Person' }, verification: { accessible: true }, sections: {} });
    result = await invoke({ type: 'linkedin', provider: 'gemini', url: 'https://www.linkedin.com/in/test-person' });
    assert.equal(result.code, 200);
    assert.deepEqual(requests.at(-1).body.tools, [{ google_search: {} }]);
    assert.equal(requests.at(-1).body.generationConfig, undefined);
    assert.deepEqual(result.data.sections.experience, []);
    output = JSON.stringify({ verification: { accessible: false } });
    assert.equal((await invoke({ type: 'linkedin', provider: 'gemini', url: 'https://www.linkedin.com/in/test-person' })).code, 422);
    assert.equal((await invoke({ type: 'linkedin', provider: 'gemini', url: 'https://example.com/in/test' })).code, 400);
    result = await invoke({}, {}, 'OPTIONS');
    assert.match(result.headers['Access-Control-Allow-Headers'], /X-AI-API-Key/);
    assert.equal((await invoke({}, {}, 'GET')).code, 405);
    result = await invoke({}, {}, 'GET', health);
    assert.deepEqual(result.data.aiProviders, { openai: true, gemini: true });
    console.log('PASS: provider routing, isolated credentials, session priority, legacy OpenAI keys, Gemini text/JSON/search, LinkedIn validation, CORS and health status');
  } finally {
    global.fetch = originalFetch;
    for (const key of ['OPENAI_API_KEY', 'GEMINI_API_KEY']) {
      if (originalEnv[key] === undefined) delete process.env[key];
      else process.env[key] = originalEnv[key];
    }
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
