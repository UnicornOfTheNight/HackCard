import * as pdfjsLib from 'pdfjs-dist'
import pdfWorkerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import tesseractWorkerSrc from 'tesseract.js/dist/worker.min.js?url'

function normalizeExtractedText(text) {
  return text
    .replace(/\u0000/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

async function createOcrWorker() {
  const { createWorker } = await import('tesseract.js')

  return createWorker(['eng', 'fra'], 1, {
    workerPath: tesseractWorkerSrc,
  })
}

async function renderPdfPageToCanvas(page) {
  const viewport = page.getViewport({ scale: 2 })
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d', { willReadFrequently: true })

  if (!context) {
    throw new Error('Unable to create a canvas context for OCR.')
  }

  canvas.width = Math.ceil(viewport.width)
  canvas.height = Math.ceil(viewport.height)

  await page.render({
    canvasContext: context,
    viewport,
  }).promise

  return canvas
}

async function extractTextFromPdfPageWithOcr(page, worker) {
  const canvas = await renderPdfPageToCanvas(page)
  const { data } = await worker.recognize(canvas)
  return normalizeExtractedText(data?.text || '')
}

/**
 * Extracts plain text from a PDF or DOCX file in the browser.
 * Returns a string with the extracted text.
 */
export async function extractTextFromFile(file) {
  const ext = file.name.split('.').pop().toLowerCase()

  if (ext === 'pdf') {
    return await extractFromPDF(file)
  } else if (ext === 'docx') {
    return await extractFromDOCX(file)
  } else {
    throw new Error('Unsupported file type. Please upload a PDF or DOCX file.')
  }
}

async function extractFromPDF(file) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

  const pageTexts = []
  let ocrWorker = null

  try {
  for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      const selectableText = normalizeExtractedText(
        content.items
          .map((item) => ('str' in item ? item.str : ''))
          .filter(Boolean)
          .join(' ')
      )

      if (selectableText) {
        pageTexts.push(selectableText)
        continue
      }

      ocrWorker ??= await createOcrWorker()
      const ocrText = await extractTextFromPdfPageWithOcr(page, ocrWorker)

      if (ocrText) {
        pageTexts.push(ocrText)
      }
    }
  } catch (error) {
    if (String(error?.message || '').includes('fetch')) {
      throw new Error('OCR failed to load its language files. Check your internet connection and try again.')
    }

    throw error
  } finally {
    await ocrWorker?.terminate()
  }

  const fullText = normalizeExtractedText(pageTexts.join('\n\n'))

  if (!fullText) {
    throw new Error('No text could be extracted from this PDF, even with OCR. Try a clearer scan or a PDF with better image quality.')
  }

  return fullText
}

async function extractFromDOCX(file) {
  const mammoth = await import('mammoth')
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer })
  const text = normalizeExtractedText(result.value)

  if (!text) {
    throw new Error('No text was found in this DOCX file.')
  }

  return text
}
