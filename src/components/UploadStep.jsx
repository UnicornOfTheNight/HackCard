import { useState, useRef, useCallback } from 'react'
import { extractTextFromFile } from '../utils/fileExtractor'
import { adaptExamForDyslexia } from '../utils/googleApi'
import './UploadStep.css'

export default function UploadStep({ onAdapted, onLoading, onAdaptError, errorMessage }) {
  const [file, setFile] = useState(null)
  const [extractedText, setExtractedText] = useState('')
  const [dragging, setDragging] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [localError, setLocalError] = useState('')
  const inputRef = useRef()
  const error = localError || errorMessage

  const handleFile = useCallback(async (f) => {
    if (!f) return
    const ext = f.name.split('.').pop().toLowerCase()
    if (!['pdf', 'docx'].includes(ext)) {
      setLocalError('Only PDF and DOCX files are supported.')
      return
    }
    setLocalError('')
    setFile(f)
    setExtracting(true)
    try {
      const text = await extractTextFromFile(f)
      setExtractedText(text)
    } catch (e) {
      setLocalError(e.message)
      setFile(null)
    } finally {
      setExtracting(false)
    }
  }, [])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    handleFile(f)
  }, [handleFile])

  async function handleAdapt() {
    if (!extractedText) return
    setLocalError('')
    onLoading()
    try {
      const adapted = await adaptExamForDyslexia(extractedText)
      onAdapted(extractedText, adapted)
    } catch (e) {
      onAdaptError('Google Generative AI error: ' + e.message)
    }
  }

  const wordCount = extractedText
    ? extractedText.trim().split(/\s+/).filter(Boolean).length
    : 0

  return (
    <div className="upload-page">
      {/* Hero */}
      <div className="upload-hero">
        <div className="hero-tag">Phase 1 · Upload</div>
        <h1 className="hero-title">Upload your exam</h1>
        <p className="hero-sub">
          Drop a PDF or DOCX file. EduGen will instantly adapt it<br />for students with dyslexia using Google Gemini.
        </p>
      </div>

      {/* Drop zone */}
      <div
        className={`dropzone ${dragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !file && inputRef.current.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx"
          style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files[0])}
        />

        {!file && !extracting && (
          <div className="dropzone-empty">
            <div className="drop-icon">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M16 4L16 20M16 4L10 10M16 4L22 10" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 24H26" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round"/>
                <path d="M6 24V28H26V24" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="drop-main">Drop your exam here</p>
            <p className="drop-sub">or <span className="drop-link">browse file</span> · PDF or DOCX</p>
          </div>
        )}

        {extracting && (
          <div className="dropzone-extracting">
            <div className="mini-spinner" />
            <p>Extracting text from file…</p>
          </div>
        )}

        {file && !extracting && (
          <div className="dropzone-file">
            <div className="file-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="file-info">
              <p className="file-name">{file.name}</p>
              <p className="file-meta">{wordCount.toLocaleString()} words extracted · {(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button className="file-remove btn-ghost" onClick={(e) => { e.stopPropagation(); setFile(null); setExtractedText('') }}>
              ✕ Remove
            </button>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="upload-error">
          <span>⚠ {error}</span>
        </div>
      )}

      {/* Preview */}
      {extractedText && (
        <div className="preview-card">
          <div className="preview-header">
            <span className="preview-label">Extracted text preview</span>
            <span className="preview-count">{wordCount} words</span>
          </div>
          <div className="preview-body">
            <pre>{extractedText.slice(0, 600)}{extractedText.length > 600 ? '\n\n[…]' : ''}</pre>
          </div>
        </div>
      )}

      {/* Profile selector */}
      {extractedText && (
        <div className="profile-section">
          <p className="profile-label">Adaptation profile</p>
          <div className="profile-card active">
            <div className="profile-icon">◈</div>
            <div className="profile-info">
              <p className="profile-name">Dyslexia</p>
              <p className="profile-desc">Shorter sentences · Simpler vocabulary · Clear layout · Active voice</p>
            </div>
            <div className="profile-check">✓</div>
          </div>
          <p className="profile-more">More profiles coming in v2 (ADHD, visual impairment…)</p>
        </div>
      )}

      {/* CTA */}
      <div className="upload-cta">
        <button
          className="btn-primary cta-btn"
          disabled={!extractedText}
          onClick={handleAdapt}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2L14 8L8 14M2 8H14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Adapt for dyslexia
        </button>
        {!extractedText && (
          <p className="cta-hint">Upload a file to continue</p>
        )}
      </div>
    </div>
  )
}
