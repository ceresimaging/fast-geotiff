import { arrayTypeFor, getDecoder, uint16ToUint8, range } from './shared'
import zip from 'pop-zip/zip'
import flatten from 'array-flatten'

const partition = (arr, numPartitions) => {
  const len = arr.length
  numPartitions = Math.max(1, Math.min(arr.length, numPartitions))
  const partitionSize = Math.floor(len / numPartitions)
  return range(numPartitions).map((n) => {
    const start = n * partitionSize
    const end = start + partitionSize
    return arr.slice(start, end)
  })
}

export default async function readGeoTIFF (img, arrayBuffer) {
  const format = img.fileDirectory.SampleFormat ? Math.max(...img.fileDirectory.SampleFormat) : 1
  const maxBitsPerSample = Math.max(...img.fileDirectory.BitsPerSample)

  if (img.isTiled || !img.planarConfiguration || img.getTileHeight() != 1 || format != 1) {
    throw Error("Can't handle this type of GeoTIFF, try readGeoTiff, or geotiff.js instead")
  }

  const width = img.getWidth()
  const height = img.getHeight()
  const numSamples = img.fileDirectory.SamplesPerPixel
  
  const ArrayType = arrayTypeFor(format, maxBitsPerSample)
  
  const decoder = getDecoder(img.fileDirectory)

  let rawArray = new Uint8Array(arrayBuffer)
  if (decoder.usingWorkers) {
    if (window.SharedArrayBuffer && !(arrayBuffer instanceof window.SharedArrayBuffer)) {
      arrayBuffer = new window.SharedArrayBuffer(rawArray.byteLength)
      const copyArray = new Uint8Array(arrayBuffer, 0, rawArray.byteLength)
      copyArray.set(rawArray)
      rawArray = copyArray
    }  
  }

  // OK, this is messed up, but if we don't do this, we don't get
  // complete strips, and LZW decode fails (???)
  // You can see the image corruption decrease as we read more and
  // more data. This is especially pronounced in the 'transparent'
  // parts of images, which should compress more, which makes me
  // wonder if we're misunderstanding how to read the strips?
  const MAGIC_FACTOR_READ_N_EXTRA_BYTES_FOR_EACH_STRIP = 16384

  const strips = zip(
    img.fileDirectory.StripOffsets,
    img.fileDirectory.StripByteCounts
  ).map(([ byteOffset, numBytes ]) => 
    rawArray.subarray(
      byteOffset,
      byteOffset + MAGIC_FACTOR_READ_N_EXTRA_BYTES_FOR_EACH_STRIP + numBytes
    )
  )

  const numPartitions = decoder.numWorkers ? decoder.numWorkers() : 1
  let rgba = new ArrayType(width * height * numSamples)

  const decoderResults = flatten(
    await Promise.all(
      partition(strips, numPartitions)
      .map(rawStripArrays => decoder.decodeAll
        ? decoder.decodeAll(img.fileDirectory, rawStripArrays)
        : Promise.all(
            rawStripArrays.map((rawStripArray) => decoder.decode(img.fileDirectory, rawStripArray))
          )
      )
    )
  )

  decoderResults
    .map(stripBytes => new ArrayType(stripBytes.buffer, stripBytes.byteOffset, stripBytes.length / ArrayType.BYTES_PER_ELEMENT))
    .reduce((rgbaIndex, strip) => {
      rgba.set(strip, rgbaIndex)
      return rgbaIndex + strip.length
    }, 0)

  if (ArrayType == Uint16Array) {
    rgba = uint16ToUint8(rgba)
  }

  return new ImageData(rgba, width, height)
}