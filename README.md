# Description
FastGeoTIFF is a layer over GeoTIFF.js (https://geotiffjs.github.io/) 
optimized for high performance raster reads of commonly formatted GeoTIFFs.
For many common non-tiled, planar, RAW or LZW compressed GeoTIFFs, FastGeoTIFF
can decode an ImageData of the rasters 5-10x faster than GeoTIFF.js.

E.g. a 150MB LZW compressed GeoTIFF can be decoded to ImageData in ~1s.

If FastGeoTIFF can't read the file, it will fall back to the (bundled) copy
of GeoTIFF.js.

Uncompressed GeoTIFFs are 'read' using a direct mmap. LZW compressed GeoTIFFs
are decoded using 'fast-lzw' (https://github.com/ceresimaging/fast-lzw), which uses web assembly for performance.

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
