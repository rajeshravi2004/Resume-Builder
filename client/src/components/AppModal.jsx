import { AlertTriangle, Info, X } from 'lucide-react'

export function ConfirmModal({ title, description, confirmLabel = 'Confirm', tone = 'danger', onConfirm, onClose }) {
  return <div className="modal-layer" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title"><button className="modal-scrim" onClick={onClose} aria-label="Close" /><div className="modal-card confirm-modal"><div className={`confirm-icon ${tone}`}><AlertTriangle size={22} /></div><button className="icon-button confirm-close" onClick={onClose}><X size={19} /></button><h2 id="confirm-title">{title}</h2><p>{description}</p><div className="modal-actions"><button className="button secondary" onClick={onClose}>Cancel</button><button className={`button ${tone === 'danger' ? 'danger-button' : 'primary'}`} onClick={onConfirm}>{confirmLabel}</button></div></div></div>
}

export function NoticeModal({ title, description, onClose }) {
  return <div className="modal-layer" role="alertdialog" aria-modal="true" aria-labelledby="notice-title"><button className="modal-scrim" onClick={onClose} aria-label="Close" /><div className="modal-card confirm-modal"><div className="confirm-icon info"><Info size={22} /></div><button className="icon-button confirm-close" onClick={onClose}><X size={19} /></button><h2 id="notice-title">{title}</h2><p>{description}</p><div className="modal-actions"><button className="button primary" onClick={onClose}>Got it</button></div></div></div>
}
