import _ from 'lodash'
import * as PIXI from 'pixi.js'
import { getTexture } from './textures'

const BLOCK_TYPES = [
  'red', 'yellow', 'green', 'blue', 'purple'
]

export class PlayingField {
  constructor (opts) {
    this._view = new PIXI.Container()
    this._width = opts.width
    this._height = opts.height
    this._size = opts.size || 40

    _.range(this._width).map((i) => {
      _.range(this._height).map((j) => {
        const blockType = BLOCK_TYPES[_.random(BLOCK_TYPES.length - 1)]
        const block = new PIXI.Sprite(getTexture(blockType))
        block.width = this._size
        block.height = this._size
        block.x = this._size * i
        block.y = this._size * j
        this._view.addChild(block)
      })
    })
  }

  get view () {
    return this._view
  }
}
