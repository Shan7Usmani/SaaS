export interface PDFExtractionResult {
  text: string
  pageCount: number
  metadata: Record<string, string>
}

export async function extractTextFromPDF(buffer: ArrayBuffer): Promise<PDFExtractionResult> {
  try {
    const pdfjsLib = await import("pdfjs-dist")
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
    const pageCount = pdf.numPages
    const pages: string[] = []

    for (let i = 1; i <= pageCount; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      const text = (content.items as Array<{ str: string }>)
        .filter((item) => typeof item.str === "string")
        .map((item) => item.str)
        .join(" ")
      pages.push(text)
    }

    return {
      text: pages.join("\n\n"),
      pageCount,
      metadata: {
        pages: String(pageCount),
      },
    }
  } catch (err) {
    throw new Error(
      `PDF extraction failed: ${err instanceof Error ? err.message : "Unknown error"}`
    )
  }
}
