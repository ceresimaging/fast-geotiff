import readGeoTIFFDecode from './decode'
import readGeoTiffMMAP from './mmap'
import { readGeoTIFF as readGeoTIFFJsLib, arrayBufferToGeoTiffJSImage } from './geotiff-js-lib'

const PROFILE=true

function decode(img, arrayBuffer) {
  const format = img.fileDirectory.SampleFormat ? Math.max(...img.fileDirectory.SampleFormat) : 1

  if (img.planarConfiguration && !img.isTiled && img.getTileHeight() == 1 && format == 1) {
    if (img.fileDirectory.Compression == 1) {
      // RAW, not compressed, use MMAP for insane speed
      return readGeoTiffMMAP(img, arrayBuffer)
    } else {
      // Its all in a direct read order, but compressed
      return readGeoTIFFDecode(img, arrayBuffer)
    }
  } else {
    // Its something else, let GeoTiff.js deal with it
    return readGeoTIFFJsLib(img)
  }
}

async function readRasterFromURL(url) {
  time(`readRaster:${url}`)
  const response = await fetch(url)
  const arrayBuffer = await response.arrayBuffer()
  const imageData = readRaster(arrayBuffer)
  timeEnd(`readRaster:${url}`)
  return imageData
}

function time(s) {
  if (PROFILE)
    console.time(s)
}

function timeEnd(s) {
  if (PROFILE)
    console.timeEnd(s)
}

async function readRaster(arrayBuffer) {
  const img = await arrayBufferToGeoTiffJSImage(arrayBuffer)
  const imageData = await decode(img, arrayBuffer)
  return imageData
}

export { readRaster, readRasterFromURL }