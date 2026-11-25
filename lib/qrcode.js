// Pure JavaScript, zero-dependency QR Code SVG generator (Byte mode, ECC Level L, Versions 1-10)
// Generates 100% standards-compliant scannable QR codes offline.

const EXP_TABLE = new Array(256)
const LOG_TABLE = new Array(256)
for (let i = 0; i < 8; i++) EXP_TABLE[i] = 1 << i
for (let i = 8; i < 256; i++) {
  EXP_TABLE[i] = EXP_TABLE[i - 4] ^ EXP_TABLE[i - 5] ^ EXP_TABLE[i - 6] ^ EXP_TABLE[i - 8]
}
for (let i = 0; i < 255; i++) LOG_TABLE[EXP_TABLE[i]] = i

function glog(n) {
  if (n < 1) throw new Error('glog(' + n + ')')
  return LOG_TABLE[n]
}
function gexp(n) {
  while (n < 0) n += 255
  while (n >= 256) n -= 255
  return EXP_TABLE[n]
}

class Poly {
  constructor(num, shift) {
    let offset = 0
    while (offset < num.length && num[offset] === 0) offset++
    this.num = new Array(num.length - offset + shift)
    for (let i = 0; i < num.length - offset; i++) this.num[i] = num[i + offset]
  }
  get(i) { return this.num[i] }
  getLength() { return this.num.length }
  multiply(e) {
    const num = new Array(this.getLength() + e.getLength() - 1).fill(0)
    for (let i = 0; i < this.getLength(); i++) {
      for (let j = 0; j < e.getLength(); j++) {
        num[i + j] ^= gexp(glog(this.get(i)) + glog(e.get(j)))
      }
    }
    return new Poly(num, 0)
  }
  mod(e) {
    if (this.getLength() - e.getLength() < 0) return this
    const ratio = glog(this.get(0)) - glog(e.get(0))
    const num = this.num.slice()
    for (let i = 0; i < e.getLength(); i++) num[i] ^= gexp(glog(e.get(i)) + ratio)
    return new Poly(num, 0).mod(e)
  }
}

function getErrorCorrectPolynomial(ecLen) {
  let a = new Poly([1], 0)
  for (let i = 0; i < ecLen; i++) a = a.multiply(new Poly([1, gexp(i)], 0))
  return a
}

// RS Blocks for Error Correction Level L, Versions 1..10: [count, totalCount, dataCount]
const RS_BLOCKS_L = {
  1: [[1, 26, 19]],
  2: [[1, 44, 34]],
  3: [[1, 70, 55]],
  4: [[1, 100, 80]],
  5: [[1, 134, 108]],
  6: [[2, 86, 68]],
  7: [[2, 98, 78]],
  8: [[2, 121, 97]],
  9: [[2, 146, 116]],
  10: [[2, 86, 68], [2, 87, 69]],
}

const ALIGNMENT_PATTERNS = {
  1: [],
  2: [6, 18],
  3: [6, 22],
  4: [6, 26],
  5: [6, 30],
  6: [6, 34],
  7: [6, 22, 38],
  8: [6, 24, 42],
  9: [6, 26, 46],
  10: [6, 28, 50],
}

const G15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | 1
const G18 = (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | 1
const G15_MASK = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1)

function getBCHDigit(data) {
  let digit = 0
  while (data !== 0) { digit++; data >>>= 1 }
  return digit
}

function getBCHTypeInfo(data) {
  let d = data << 10
  while (getBCHDigit(d) - getBCHDigit(G15) >= 0) {
    d ^= G15 << (getBCHDigit(d) - getBCHDigit(G15))
  }
  return ((data << 10) | d) ^ G15_MASK
}

function getBCHTypeNumber(data) {
  let d = data << 12
  while (getBCHDigit(d) - getBCHDigit(G18) >= 0) {
    d ^= G18 << (getBCHDigit(d) - getBCHDigit(G18))
  }
  return (data << 12) | d
}

function utf8Bytes(str) {
  if (typeof TextEncoder !== 'undefined') {
    return Array.from(new TextEncoder().encode(str))
  }
  const bytes = []
  for (let i = 0; i < str.length; i++) {
    let c = str.charCodeAt(i)
    if (c < 0x80) bytes.push(c)
    else if (c < 0x800) bytes.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f))
    else bytes.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f))
  }
  return bytes
}

function pickVersion(byteLen) {
  for (let v = 1; v <= 10; v++) {
    const blocks = RS_BLOCKS_L[v]
    const totalData = blocks.reduce((s, [cnt, , d]) => s + cnt * d, 0)
    const headerBits = 4 + (v < 10 ? 8 : 16)
    if (headerBits + byteLen * 8 <= totalData * 8) return v
  }
  return 10
}

export function generateQRMatrix(text) {
  const bytes = utf8Bytes(String(text || ''))
  const version = pickVersion(bytes.length)
  const moduleCount = version * 4 + 17

  // Build data bits
  const bits = []
  const pushBits = (val, len) => {
    for (let i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1)
  }

  pushBits(4, 4) // Byte mode
  pushBits(bytes.length, version < 10 ? 8 : 16)
  for (const b of bytes) pushBits(b, 8)

  const rsSpec = RS_BLOCKS_L[version]
  const rsBlocks = []
  for (const [count, totalCount, dataCount] of rsSpec) {
    for (let i = 0; i < count; i++) rsBlocks.push({ totalCount, dataCount })
  }
  const totalDataCount = rsBlocks.reduce((s, b) => s + b.dataCount, 0)

  if (bits.length + 4 <= totalDataCount * 8) pushBits(0, 4)
  while (bits.length % 8 !== 0) bits.push(0)

  const dataBytes = []
  for (let i = 0; i < bits.length; i += 8) {
    let b = 0
    for (let j = 0; j < 8; j++) b = (b << 1) | bits[i + j]
    dataBytes.push(b)
  }
  let padToggle = true
  while (dataBytes.length < totalDataCount) {
    dataBytes.push(padToggle ? 0xec : 0x11)
    padToggle = !padToggle
  }

  // Reed-Solomon interleaving
  let offset = 0
  let maxDc = 0
  let maxEc = 0
  const dcdata = []
  const ecdata = []
  for (let r = 0; r < rsBlocks.length; r++) {
    const dcCount = rsBlocks[r].dataCount
    const ecCount = rsBlocks[r].totalCount - dcCount
    maxDc = Math.max(maxDc, dcCount)
    maxEc = Math.max(maxEc, ecCount)
    const dc = dataBytes.slice(offset, offset + dcCount)
    offset += dcCount
    dcdata.push(dc)
    const rsPoly = getErrorCorrectPolynomial(ecCount)
    const rawPoly = new Poly(dc, rsPoly.getLength() - 1)
    const modPoly = rawPoly.mod(rsPoly)
    const ec = new Array(rsPoly.getLength() - 1).fill(0)
    for (let i = 0; i < ec.length; i++) {
      const modIdx = i + modPoly.getLength() - ec.length
      ec[i] = modIdx >= 0 ? modPoly.get(modIdx) : 0
    }
    ecdata.push(ec)
  }

  const finalData = []
  for (let i = 0; i < maxDc; i++) {
    for (let r = 0; r < rsBlocks.length; r++) {
      if (i < dcdata[r].length) finalData.push(dcdata[r][i])
    }
  }
  for (let i = 0; i < maxEc; i++) {
    for (let r = 0; r < rsBlocks.length; r++) {
      if (i < ecdata[r].length) finalData.push(ecdata[r][i])
    }
  }

  // Create matrix
  const modules = Array.from({ length: moduleCount }, () => new Array(moduleCount).fill(null))

  const setupPositionProbe = (row, col) => {
    for (let r = -1; r <= 7; r++) {
      if (row + r <= -1 || moduleCount <= row + r) continue
      for (let c = -1; c <= 7; c++) {
        if (col + c <= -1 || moduleCount <= col + c) continue
        modules[row + r][col + c] =
          (0 <= r && r <= 6 && (c === 0 || c === 6)) ||
          (0 <= c && c <= 6 && (r === 0 || r === 6)) ||
          (2 <= r && r <= 4 && 2 <= c && c <= 4)
      }
    }
  }

  setupPositionProbe(0, 0)
  setupPositionProbe(moduleCount - 7, 0)
  setupPositionProbe(0, moduleCount - 7)

  // Alignment patterns
  const pos = ALIGNMENT_PATTERNS[version] || []
  for (let i = 0; i < pos.length; i++) {
    for (let j = 0; j < pos.length; j++) {
      const row = pos[i]
      const col = pos[j]
      if (modules[row][col] !== null) continue
      for (let r = -2; r <= 2; r++) {
        for (let c = -2; c <= 2; c++) {
          modules[row + r][col + c] = Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0)
        }
      }
    }
  }

  // Timing patterns
  for (let i = 8; i < moduleCount - 8; i++) {
    if (modules[i][6] === null) modules[i][6] = i % 2 === 0
    if (modules[6][i] === null) modules[6][i] = i % 2 === 0
  }

  // Format info (ECC L = 01, Mask 0 = 000 => 01000 = 8)
  const maskPattern = 0
  const formatBits = getBCHTypeInfo((1 << 3) | maskPattern)
  for (let i = 0; i < 15; i++) {
    const mod = ((formatBits >> i) & 1) === 1
    if (i < 6) modules[i][8] = mod
    else if (i < 8) modules[i + 1][8] = mod
    else modules[moduleCount - 15 + i][8] = mod

    if (i < 8) modules[8][moduleCount - i - 1] = mod
    else if (i < 9) modules[8][15 - i - 1 + 1] = mod
    else modules[8][15 - i - 1] = mod
  }
  modules[moduleCount - 8][8] = true

  // Version info for v >= 7
  if (version >= 7) {
    const vBits = getBCHTypeNumber(version)
    for (let i = 0; i < 18; i++) {
      const mod = ((vBits >> i) & 1) === 1
      modules[Math.floor(i / 3)][(i % 3) + moduleCount - 8 - 3] = mod
      modules[(i % 3) + moduleCount - 8 - 3][Math.floor(i / 3)] = mod
    }
  }

  // Map data with mask pattern 0: (row + col) % 2 === 0
  let inc = -1
  let row = moduleCount - 1
  let bitIndex = 7
  let byteIndex = 0
  for (let col = moduleCount - 1; col > 0; col -= 2) {
    if (col === 6) col--
    while (true) {
      for (let c = 0; c < 2; c++) {
        if (modules[row][col - c] === null) {
          let dark = false
          if (byteIndex < finalData.length) {
            dark = ((finalData[byteIndex] >>> bitIndex) & 1) === 1
          }
          if ((row + (col - c)) % 2 === 0) dark = !dark
          modules[row][col - c] = dark
          bitIndex--
          if (bitIndex === -1) {
            byteIndex++
            bitIndex = 7
          }
        }
      }
      row += inc
      if (row < 0 || moduleCount <= row) {
        row -= inc
        inc = -inc
        break
      }
    }
  }

  return modules
}
