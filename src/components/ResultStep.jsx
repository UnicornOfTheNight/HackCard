import { useRef } from 'react'
import './ResultStep.css'

export default function ResultStep({ original, adapted, onReset }) {
  const printRef = useRef()
  const pdfRef = useRef()

  function handlePrint() {
    window.print()
  }

  async function handleDownloadPDF() {
    const { jsPDF } = await import('jspdf')
    const pdf = new jsPDF({
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
    })

    const margin = 15
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const maxWidth = pageWidth - margin * 2
    const maxY = pageHeight - margin

    let cursorY = margin

    pdf.setTextColor(31, 41, 55)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(18)
    pdf.text('EduGen - Adapted exam for dyslexic students', margin, cursorY)

    cursorY += 10
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(12)
    pdf.text('Profile: Dyslexia', margin, cursorY)

    cursorY += 10
    pdf.setTextColor(17, 24, 39)
    pdf.setFontSize(15)

    const lines = pdf.splitTextToSize(adapted || '', maxWidth)

    for (const line of lines) {
      if (cursorY > maxY) {
        pdf.addPage()
        cursorY = margin
        pdf.setTextColor(17, 24, 39)
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(15)
      }

      pdf.text(line, margin, cursorY)
      cursorY += 6
    }

    pdf.save('exam-adapted-dyslexia.pdf')
  }

  const originalWords = original.trim().split(/\s+/).filter(Boolean).length
  const adaptedWords = adapted.trim().split(/\s+/).filter(Boolean).length

  return (
    <div className="result-page">
      {/* Top bar */}
      <div className="result-topbar">
        <div className="result-title-row">
          <div className="success-badge">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7L5.5 10.5L12 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Adaptation complete
          </div>
          <h1 className="result-title">Your adapted exam is ready</h1>
        </div>
        <div className="result-actions">
          <button className="btn-ghost" onClick={onReset}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 7C1 3.69 3.69 1 7 1C9.13 1 11 2.12 12 3.8M13 7C13 10.31 10.31 13 7 13C4.87 13 3 11.88 2 10.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M11 1L13 4L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 13L1 10L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            New exam
          </button>
          <button className="btn-secondary" onClick={handlePrint}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="2" y="5" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M4 5V3C4 2.45 4.45 2 5 2H9C9.55 2 10 2.45 10 3V5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M4 9H10M4 11H8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            Print
          </button>
          <button className="btn-primary" onClick={handleDownloadPDF}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2V9M7 9L4 6.5M7 9L10 6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 11H12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            Download PDF
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="result-stats">
        <StatCard label="Original" value={`${originalWords} words`} color="secondary" />
        <StatCard label="Adapted" value={`${adaptedWords} words`} color="primary" />
        <StatCard label="Profile" value="Dyslexia" color="green" />
        <StatCard label="AI Model" value="Gemini 2.5 Flash" color="purple" />
      </div>

      {/* Side by side */}
      <div className="result-columns">
        <div className="result-col original-col">
          <div className="col-header">
            <span className="col-badge original-badge">Original</span>
            <span className="col-words">{originalWords} words</span>
          </div>
          <div className="col-body">
            <pre>{original}</pre>
          </div>
        </div>

        <div className="result-divider">
          <div className="divider-line" />
          <div className="divider-arrow">→</div>
          <div className="divider-line" />
        </div>

        <div className="result-col adapted-col">
          <div className="col-header">
            <span className="col-badge adapted-badge">Adapted · Dyslexia</span>
            <span className="col-words">{adaptedWords} words</span>
          </div>
          <div className="col-body adapted-body">
            <pre>{adapted}</pre>
          </div>
        </div>
      </div>

      <div className="pdf-export" ref={pdfRef}>
        <div className="print-header">
          <strong>EduGen</strong> Â· Adapted exam for dyslexic students
        </div>
        <div className="print-content">
          {adapted}
        </div>
      </div>

      {/* Print-only view */}
      <div className="print-only" ref={printRef}>
        <div className="print-header">
          <strong>EduGen</strong> · Adapted exam for dyslexic students
        </div>
        <div className="print-content">
          {adapted}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div className={`stat-card stat-${color}`}>
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
    </div>
  )
}
