/**
 * VitalityX icon generator — zero-dependency PNG/ICO rasterizer.
 * Draws the brand mark (clinical-red rounded tile + white V) at any size:
 *   - app/icon.png           512px  (Next.js app icon)
 *   - public/logo.png        512px  (apple-touch / branding)
 *   - public/favicon.ico     16/32/48/64 PNG entries
 */
import { deflateSync, crc32 } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const RED = [232, 41, 28, 255]
const WHITE = [255, 255, 255, 255]
const TRANSPARENT = [0, 0, 0, 0]

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v))
}

function segmentDistance(px, py, ax, ay, bx, by) {
  const abx = bx - ax
  const aby = by - ay
  const t = clamp(((px - ax) * abx + (py - ay) * aby) / (abx * abx + aby * aby), 0, 1)
  const dx = px - (ax + t * abx)
  const dy = py - (ay + t * aby)
  return Math.sqrt(dx * dx + dy * dy)
}

function roundedRectCoverage(x, y, size, radius) {
  const half = size / 2
  const qx = Math.abs(x - half) - (half - radius)
  const qy = Math.abs(y - half) - (half - radius)
  const d = Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - radius
  return clamp(0.5 - d, 0, 1)
}

function vCoverage(x, y, size) {
  const s = (v) => v * size
  const stroke = s(0.115) / 2
  const d1 = segmentDistance(x, y, s(0.3), s(0.3), s(0.5), s(0.68))
  const d2 = segmentDistance(x, y, s(0.5), s(0.68), s(0.7), s(0.3))
  return clamp(stroke - Math.min(d1, d2) + 0.5, 0, 1)
}

function rasterize(size) {
  const px = Buffer.alloc(size * size * 4)
  const ss = 3
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0
      let g = 0
      let b = 0
      let a = 0
      for (let sy = 0; sy < ss; sy++) {
        for (let sx = 0; sx < ss; sx++) {
          const fx = x + (sx + 0.5) / ss
          const fy = y + (sy + 0.5) / ss
          const tile = roundedRectCoverage(fx, fy, size, size * 0.22)
          if (tile <= 0) continue
          const v = vCoverage(fx, fy, size)
          const color = v > 0 ? WHITE : RED
          r += color[0] * tile
          g += color[1] * tile
          b += color[2] * tile
          a += tile * 255
        }
      }
      const i = (y * size + x) * 4
      const samples = ss * ss
      if (a === 0) {
        px.writeUInt32BE(0, i)
        continue
      }
      px[i] = Math.round(r / samples)
      px[i + 1] = Math.round(g / samples)
      px[i + 2] = Math.round(b / samples)
      px[i + 3] = Math.round(a / samples)
    }
  }
  return px
}

function pngChunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const typeBuf = Buffer.from(type, 'ascii')
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])) >>> 0)
  return Buffer.concat([len, typeBuf, data, crcBuf])
}

function encodePng(size, rgba) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // RGBA
  const stride = size * 4
  const raw = Buffer.alloc((stride + 1) * size)
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride)
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(raw, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ])
}

function encodeIco(sizes) {
  const entries = sizes.map((s) => ({ size: s, data: encodePng(s, rasterize(s)) }))
  const header = Buffer.alloc(6)
  header.writeUInt16LE(1, 2) // ICO type
  header.writeUInt16LE(entries.length, 4)
  let offset = 6 + entries.length * 16
  const dir = entries.map((e) => {
    const b = Buffer.alloc(16)
    b[0] = e.size >= 256 ? 0 : e.size
    b[1] = e.size >= 256 ? 0 : e.size
    b.writeUInt16LE(1, 4) // planes
    b.writeUInt16LE(32, 6) // bpp
    b.writeUInt32LE(e.data.length, 8)
    b.writeUInt32LE(offset, 12)
    offset += e.data.length
    return b
  })
  return Buffer.concat([header, ...dir, ...entries.map((e) => e.data)])
}

const sizes = [16, 32, 48, 64, 128, 192, 512]
mkdirSync(resolve(ROOT, 'app'), { recursive: true })
mkdirSync(resolve(ROOT, 'public'), { recursive: true })

const png512 = encodePng(512, rasterize(512))
writeFileSync(resolve(ROOT, 'app', 'icon.png'), png512)
writeFileSync(resolve(ROOT, 'public', 'logo.png'), png512)
writeFileSync(resolve(ROOT, 'public', 'apple-touch-icon.png'), encodePng(180, rasterize(180)))
writeFileSync(resolve(ROOT, 'public', 'favicon.png'), encodePng(64, rasterize(64)))
writeFileSync(resolve(ROOT, 'public', 'favicon.ico'), encodeIco([16, 32, 48, 64]))

console.log('Generated app/icon.png, public/logo.png, public/apple-touch-icon.png, public/favicon.png, public/favicon.ico')
