import { uint16ToUint8 } from './shared'
import { fromArrayBuffer } from 'geotiff/dist/geotiff.bundle'

async function arrayBufferToGeoTiffJSImage (arrayBuffer) {
  const tiff = await fromArrayBuffer(arrayBuffer)
  return await tiff.getImage()
}

async function readGeoTIFF(arrayBuffer) {
  const image = await arrayBufferToGeoTiffJSImage(arrayBuffer)
  const rasters = await image.readRasters({ interleave: true })
  const rgba = uint16ToUint8(rasters)
  return new ImageData(rgba, image.getWidth(), image.getHeight())
}

export { arrayBufferToGeoTiffJSImage, readGeoTIFF }
