import { uint16ToUint8 } from './shared'
import { fromArrayBuffer } from 'geotiff/dist/geotiff.bundle'

async function arrayBufferToGeoTiffJSImage (arrayBuffer) {
  const tiff = await fromArrayBuffer(arrayBuffer)
  return await tiff.getImage()
}

async function readGeoTIFF(img, arrayBuffer) {
  const rasters = await img.readRasters({ interleave: true })
  const rgba = uint16ToUint8(rasters)
  return new ImageData(rgba, img.getWidth(), img.getHeight())
}

export { arrayBufferToGeoTiffJSImage, readGeoTIFF }
