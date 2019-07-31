import { LZW } from 'fast-lzw'
import { getDecoder as getDecoderGeotiffJS } from 'geotiff/dist/compression'
import BaseDecoder from 'geotiff/dist/compression/basedecoder'
import YieldExecutionEvery from './yield-execution-every'

const WORKER_POOL_SIZE = 4
const YIELD_EXECUTION_EVERY_MS = 100

let lzw = null

class FastLLZWDecoder extends BaseDecoder {
  constructor (...args) {
    super(args)
    lzw = lzw || new LZW(WORKER_POOL_SIZE)
    this.usingWorkers = lzw.usingWorkers
  }
  async decodeAll(fileDirectory, buffers) {
    return await lzw.decompress(buffers)
  }
  async decodeBlock(buffer) {
    return await lzw.decompress([buffer])
  }
  numWorkers() {
    return WORKER_POOL_SIZE
  }
}

class YieldingDecoder extends BaseDecoder {
  constructor(baseDecoder, ...args) {
    super(args)
    this.decoder = baseDecoder
    this.yielder = new YieldExecutionEvery(YIELD_EXECUTION_EVERY_MS)
  }
  async decodeBlock(buffer) {
    await this.yielder.maybeYield()
    return this.decoder.decodeBlock(buffer)
  }
}

const isLZW = fileDirectory => fileDirectory.Compression == 5
const getDecoder = (fileDirectory) => isLZW(fileDirectory)
  ? new FastLLZWDecoder()
  : new YieldingDecoder(
      getDecoderGeotiffJS(fileDirectory)
  )

export {
  getDecoder,
}
