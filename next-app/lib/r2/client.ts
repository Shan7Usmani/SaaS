import { createHmac } from "node:crypto"

export interface R2Config {
  endpoint: string
  accessKeyId: string
  secretAccessKey: string
  bucket: string
  publicUrl?: string
}

export interface R2UploadOptions {
  contentType?: string
  upsert?: boolean
}

export interface R2File {
  key: string
  url: string
  size: number
  etag?: string
}

function getDefaultConfig(): R2Config {
  return {
    endpoint: process.env.R2_ENDPOINT || "",
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
    bucket: process.env.R2_BUCKET || "placementos-resumes",
    publicUrl: process.env.R2_PUBLIC_URL || "",
  }
}

function createSignedHeaders(
  method: string,
  path: string,
  config: R2Config
): Headers {
  const date = new Date().toUTCString()
  const headers = new Headers({
    Host: new URL(config.endpoint).host,
    "x-amz-date": date,
  })

  const stringToSign = `${method}\n\n\n${date}\n/${config.bucket}${path}`
  const signature = createHmac("sha256", config.secretAccessKey)
    .update(stringToSign)
    .digest("hex")

  headers.set(
    "Authorization",
    `AWS ${config.accessKeyId}:${signature}`
  )

  return headers
}

export function createR2Client(config?: Partial<R2Config>) {
  const cfg = { ...getDefaultConfig(), ...config }

  if (!cfg.endpoint || !cfg.accessKeyId || !cfg.secretAccessKey) {
    console.warn(
      "[R2] Missing configuration — set R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY"
    )
  }

  async function upload(
    key: string,
    buffer: Buffer | Uint8Array,
    options: R2UploadOptions = {}
  ): Promise<R2File> {
    const url = `${cfg.endpoint}/${cfg.bucket}/${key}`
    const headers = createSignedHeaders("PUT", `/${key}`, cfg)

    if (options.contentType) {
      headers.set("Content-Type", options.contentType)
    }

    const response = await fetch(url, {
      method: "PUT",
      headers,
      body: buffer as BodyInit,
    })

    if (!response.ok) {
      throw new Error(
        `R2 upload failed: ${response.status} ${response.statusText}`
      )
    }

    const publicUrl = cfg.publicUrl
      ? `${cfg.publicUrl}/${key}`
      : `${cfg.endpoint}/${cfg.bucket}/${key}`

    return {
      key,
      url: publicUrl,
      size: buffer.byteLength,
      etag: response.headers.get("etag") || undefined,
    }
  }

  async function get(key: string): Promise<Response> {
    const url = `${cfg.endpoint}/${cfg.bucket}/${key}`
    const headers = createSignedHeaders("GET", `/${key}`, cfg)
    const response = await fetch(url, { method: "GET", headers })

    if (!response.ok) {
      throw new Error(
        `R2 get failed: ${response.status} ${response.statusText}`
      )
    }

    return response
  }

  async function remove(key: string): Promise<void> {
    const url = `${cfg.endpoint}/${cfg.bucket}/${key}`
    const headers = createSignedHeaders("DELETE", `/${key}`, cfg)
    const response = await fetch(url, { method: "DELETE", headers })

    if (!response.ok) {
      throw new Error(
        `R2 delete failed: ${response.status} ${response.statusText}`
      )
    }
  }

  function getPublicUrl(key: string): string {
    const base = cfg.publicUrl || `${cfg.endpoint}/${cfg.bucket}`
    return `${base}/${key}`
  }

  return { upload, get, remove, getPublicUrl, config: cfg }
}

export type R2Client = ReturnType<typeof createR2Client>
