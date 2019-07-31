import {getDecoder} from './decoder'

const formats = {
  // unsigned integer data
  1: {
    8: Uint8Array,
    16: Uint16Array,
    32: Uint32Array
  },
  // twos complement signed integer data
  2: {
    8: Int8Array,
    16: Int16Array,
    32: Int32Array
  },
  // floating point data
  3: {
    32: Float32Array,
    64: Float64Array
  }
}

const arrayTypeFor = (format, bitsPerSample) => formats[format][bitsPerSample]
const arrayForType = (format, bitsPerSample, size) => new arrayTypeFor(format, bitsPerSample)(size)

const range = n => Array(n).fill().map((_, i) => i)

function uint16ToUint8(uint16) {
  const rgba = new Uint8ClampedArray(uint16.length)

  for (let i=0; i < rgba.length; i++) {
    const val = uint16[i] >> 8
    const isAlphaChannel = (i+1) % 4 == 0
    const notBlack = val != 0

    rgba[i] = isAlphaChannel && notBlack ? 255 : val
  }

  return rgba
}

export { arrayForType, arrayTypeFor, range, getDecoder, uint16ToUint8 }