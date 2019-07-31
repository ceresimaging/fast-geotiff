import {uint16ToUint8} from './shared'

export default async function readGeoTiff (img, arrayBuffer) {
  const format = img.fileDirectory.SampleFormat ? Math.max(...img.fileDirectory.SampleFormat) : 1
  const maxBitsPerSample = Math.max(...img.fileDirectory.BitsPerSample)

  if (img.isTiled || !img.planarConfiguration || img.fileDirectory.Compression != 1 || img.getTileHeight() != 1 || format != 1 || maxBitsPerSample != 16) {
    // CANNOT DECODE, only for uncompressed, planar GeoTIFFS with strips
    throw Error("Can't handle this type of GeoTIFF, try readGeoTiff, or geotiff.js instead")
  }

  const stripOffsets = img.fileDirectory.StripOffsets
  const uint16Array = new Uint16Array(arrayBuffer,
    stripOffsets[0],
    // FIXME: weird, the file is actually LONGER than the byte counts here suggest
    // and if you don't read the whole thing... it doesn't work.... huh
    // stripOffsets[stripOffsets.length - 1] + img.fileDirectory.StripByteCounts[stripOffsets.length - 1]
  )

  const rgba = uint16ToUint8(uint16Array)

  return new ImageData(rgba, img.getWidth(), img.getHeight())
}