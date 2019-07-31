# Description
FastGeoTIFF is a layer over GeoTIFF.js (https://geotiffjs.github.io/) 
optimized for high performance raster reads of commonly formatted GeoTIFFs.
For many common non-tiled, planar, RAW or LZW compressed GeoTIFFs, FastGeoTIFF
can decode an ImageData of the rasters 5-10x faster than GeoTIFF.js.

If FastGeoTIFF can't read the file, it will fall back to the (bundled) copy
of GeoTIFF.js.

```
import { readRasterFromURL } from 'fast-geotiff'

// Load the ImageData from a URL (an arraybuffer version also exists)
const imageData = await readRasterFromURL('http://server.com/some-image.tiff')

// Draw it to an <img>
const canvas = new OffscreenCanvas(imageData.width, imageData.height)
canvas.getContext("2d").putImageData(imageData, 0, 0)
const dataURL = canvas.getDataURL()
const img = document.createElement("img")
img.setAttribute("src", canvas.getDataURL())
document.appendChild(img)
```