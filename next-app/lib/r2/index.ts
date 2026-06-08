export { createR2Client } from "./client"
export type { R2Config, R2UploadOptions, R2File, R2Client } from "./client"

// Singleton instance
import { createR2Client, type R2Client } from "./client"

let r2Instance: R2Client | null = null

export function getR2Client(): R2Client {
  if (!r2Instance) {
    r2Instance = createR2Client()
  }
  return r2Instance
}
