import readGeoTIFFDecode from './decode'
import readGeoTiffMMAP from './mmap'
import { readGeoTIFF as readGeoTIFFJsLib, arrayBufferToGeoTiffJSImage } from './geotiff-js-lib'

const PROFILE=true

function decode(img, arrayBuffer, url) {
  const format = img.fileDirectory.SampleFormat ? Math.max(...img.fileDirectory.SampleFormat) : 1

  if (img.planarConfiguration && !img.isTiled && img.getTileHeight() == 1 && format == 1) {
    if (img.Compression == 1) {
      // RAW, not compressed, use MMAP for insane speed
      console.log(`Reading ${url} with MMAP`)
      return readGeoTiffMMAP(img, arrayBuffer)
    } else {
      // Its all in a direct read order, but compressed
      console.log(`Reading ${url} with Decode`)
      return readGeoTIFFDecode(img, arrayBuffer)
    }
  } else {
    // Its something else, let GeoTiff.js deal with it
    console.warn(`Reading ${url} with GeoTIFF.js`)
    return readGeoTIFFJsLib(img)
  }
}

export default async function loadGeotiff(url) {
  function time(s) {
    if (PROFILE)
      console.time(s + url)
  }
  
  function timeEnd(s) {
    if (PROFILE)
      console.timeEnd(s + url)
  }

  const response = await fetch(url)
  const arrayBuffer = await response.arrayBuffer()

  const img = await arrayBufferToGeoTiffJSImage(arrayBuffer)

  time('decode')
  const imageData = await decode(img, arrayBuffer, url)
  timeEnd('decode')

  const canvas = new OffscreenCanvas(imageData.width, imageData.height)
  canvas.getContext("2d")
    .putImageData(imageData, 0, 0)

  return canvas
}
