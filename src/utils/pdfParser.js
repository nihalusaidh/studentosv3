import * as pdfjs from 'pdfjs-dist'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

export async function extractTextFromPDF(file) {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
    let text = ''
    const maxPages = Math.min(pdf.numPages, 15)
    for (let i = 1; i <= maxPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      text += content.items.map(item => item.str).join(' ') + '\n'
    }
    return { text: text.trim(), pages: pdf.numPages }
  } catch (err) {
    return { error: 'Could not read PDF. Ensure it is a valid text-based PDF.', pages: 0 }
  }
}
