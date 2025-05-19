import path from 'node:path'
import { mkdir, stat } from 'node:fs/promises'
export default async function createDir($path) {
  const outputDir = path.dirname($path)
  try { await stat(outputDir) }
  catch($err) { await mkdir(outputDir, { recursive: true }) }
}