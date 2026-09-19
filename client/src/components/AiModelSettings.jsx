import { useState } from 'react'
import { getAiModel, setAiModel } from '../lib/api'

export function AiModelSettings({ provider }) {
  const [savedModel, setSavedModel] = useState(() => getAiModel(provider.id))
  const [selection, setSelection] = useState(() => !savedModel || provider.models.includes(savedModel) ? savedModel : 'custom')
  const [customModel, setCustomModel] = useState(savedModel)
  const [error, setError] = useState('')

  const saveModel = value => {
    try {
      const model = setAiModel(value, provider.id)
      setSavedModel(model)
      setError('')
    } catch (error) { setError(error.message) }
  }

  return <div className="ai-model-panel">
    <label className="ai-provider-field"><span>AI model</span><select aria-label="AI model" value={selection} onChange={event => {
      const next = event.target.value
      setSelection(next)
      setError('')
      if (next !== 'custom') saveModel(next)
    }}>
      <option value="">Default for this provider</option>
      {provider.models.map(model => <option key={model} value={model}>{model}</option>)}
      <option value="custom">Other / custom</option>
    </select></label>
    {selection === 'custom' && <div className="ai-custom-model">
      <label><span>Custom model ID</span><input aria-label="Custom model ID" value={customModel} maxLength={207} autoComplete="off" spellCheck="false" placeholder={provider.models[0]} onChange={event => { setCustomModel(event.target.value); setError('') }} onKeyDown={event => { if (event.key === 'Enter' && customModel.trim()) { event.preventDefault(); saveModel(customModel) } }} /></label>
      <button className="button secondary compact" disabled={!customModel.trim()} onClick={() => saveModel(customModel)}>Use model</button>
    </div>}
    {error && <p role="alert" className="danger-text">{error}</p>}
    <p role="status">{savedModel ? `Using ${savedModel} for all ${provider.name} AI tools.` : `Using the default ${provider.name} model.`} Model choices are saved for this browser session.</p>
    {selection === 'custom' && <p>Enter an exact model ID available to your API key, then select Use model. LinkedIn import requires a model that supports web search.</p>}
  </div>
}
