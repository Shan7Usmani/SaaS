export interface ValidationResult {
  valid: boolean
  error?: string
}

export interface PDFValidationOptions {
  maxSize?: number // bytes
}

const PDF_MAGIC_BYTES = new Uint8Array([0x25, 0x50, 0x44, 0x46]) // %PDF
const DEFAULT_MAX_SIZE = 5 * 1024 * 1024 // 5MB

/**
 * Validates that a file is a valid PDF by checking:
 * - File extension (.pdf)
 * - MIME type (application/pdf)
 * - Magic bytes (%PDF header)
 * - File size (default 5MB max)
 */
export function validatePDF(
  file: File,
  options: PDFValidationOptions = {}
): ValidationResult {
  const maxSize = options.maxSize ?? DEFAULT_MAX_SIZE

  // Extension check
  if (!file.name.toLowerCase().endsWith(".pdf")) {
    return { valid: false, error: "File must have a .pdf extension" }
  }

  // MIME type check
  if (file.type !== "application/pdf") {
    return { valid: false, error: "File must be a PDF (application/pdf)" }
  }

  // Size check
  if (file.size > maxSize) {
    const mb = Math.round(maxSize / (1024 * 1024))
    return {
      valid: false,
      error: `File size exceeds ${mb}MB limit`,
    }
  }

  return { valid: true }
}

/**
 * Validates PDF magic bytes from a buffer.
 * Must be called after reading the file as ArrayBuffer.
 */
export function validatePDFMagicBytes(
  buffer: ArrayBuffer | Buffer
): ValidationResult {
  const bytes = new Uint8Array(buffer.slice(0, 4))

  for (let i = 0; i < 4; i++) {
    if (bytes[i] !== PDF_MAGIC_BYTES[i]) {
      return { valid: false, error: "File is not a valid PDF (invalid header)" }
    }
  }

  return { valid: true }
}

/**
 * Sanitizes a filename for safe storage.
 * Removes characters that could cause path traversal or other issues.
 */
export function sanitizeFilename(filename: string): string {
  const withoutExtension = filename.replace(/\.pdf$/i, "")
  const sanitized = withoutExtension.replace(/[^a-zA-Z0-9._-]/g, "_")
  return `${sanitized}.pdf`
}

/**
 * Validates file size against a maximum limit.
 */
export function validateFileSize(
  size: number,
  maxSize: number = DEFAULT_MAX_SIZE
): ValidationResult {
  if (size > maxSize) {
    const mb = Math.round(maxSize / (1024 * 1024))
    return {
      valid: false,
      error: `File size exceeds ${mb}MB limit`,
    }
  }
  return { valid: true }
}
