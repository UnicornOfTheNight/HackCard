import { useState } from 'react'
import UploadStep from './components/UploadStep'
import ResultStep from './components/ResultStep'
import './App.css'

export default function App() {
  const [step, setStep] = useState('upload')
  const [originalText, setOriginalText] = useState('')
  const [adaptedText, setAdaptedText] = useState('')

  function handleAdapted(original, adapted) {
    setOriginalText(original)
    setAdaptedText(adapted)
    setStep('result')
  }

  function handleReset() {
    setOriginalText('')
    setAdaptedText('')
    setStep('upload')
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <div className="logo">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="var(--accent)"/>
              <path d="M8 14L12 18L20 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="logo-text">EduGen</span>
          </div>
          <span className="logo-badge">Dyslexia Adapter · Beta</span>
        </div>
        <div className="header-steps">
          <Step num={1} label="Upload" active={step === 'upload'} done={step !== 'upload'} />
          <div className="step-line" />
          <Step num={2} label="Adapting" active={step === 'loading'} done={step === 'result'} />
          <div className="step-line" />
          <Step num={3} label="Result" active={step === 'result'} done={false} />
        </div>
      </header>

      <main className="app-main">
        {step === 'upload' && (
          <UploadStep
            onAdapted={handleAdapted}
            onLoading={() => setStep('loading')}
          />
        )}

        {step === 'loading' && (
          <div className="loading-screen">
            <div className="loading-card">
              <div className="loading-orb" />
              <h2 className="loading-title">Adapting your exam</h2>
              <p className="loading-sub">Claude is rewriting the content for dyslexic students…</p>
              <div className="loading-steps">
                <LoadingLine text="Reading exam content" delay="0s" />
                <LoadingLine text="Simplifying instructions" delay="0.6s" />
                <LoadingLine text="Restructuring layout" delay="1.2s" />
                <LoadingLine text="Generating adapted version" delay="1.8s" />
              </div>
            </div>
          </div>
        )}

        {step === 'result' && (
          <ResultStep
            original={originalText}
            adapted={adaptedText}
            onReset={handleReset}
          />
        )}
      </main>
    </div>
  )
}

function Step({ num, label, active, done }) {
  return (
    <div className={`step-item ${active ? 'active' : ''} ${done ? 'done' : ''}`}>
      <div className="step-circle">
        {done ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : num}
      </div>
      <span className="step-label">{label}</span>
    </div>
  )
}

function LoadingLine({ text, delay }) {
  return (
    <div className="loading-line" style={{ animationDelay: delay }}>
      <div className="loading-dot" style={{ animationDelay: delay }} />
      <span>{text}</span>
    </div>
  )
}
