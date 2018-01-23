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

    this._cursor = new Cursor({
      size: this._size,
      width: this._width,
      height: this._height
    })
    this._view.addChild(this._cursor.view)
  }

  get view () {
    return this._view
  }

  get cursor () {
    return this._cursor
  }
}

class Cursor {
  constructor (opts) {
    this._x = 0
    this._y = 0
    this._size = opts.size
    this._width = opts.width
    this._height = opts.height
    this._view = new PIXI.Container()
    this.x = 0
    this.y = 0

    const frame = new PIXI.Graphics()
    frame.lineStyle(4, 0xffffff, 1)
    frame.moveTo(0, 0)
    frame.lineTo(this._size * 2, 0)
    frame.lineTo(this._size * 2, this._size)
    frame.lineTo(0, this._size)
    frame.lineTo(0, 0)
    this._view.addChild(frame)

    window.addEventListener('keydown', (event) => {
      switch (event.key) {
        case 'ArrowUp':
          this.y++
          break
        case 'ArrowDown':
          this.y--
          break
        case 'ArrowLeft':
          this.x--
          break
        case 'ArrowRight':
          this.x++
          break
      }
      event.preventDefault()
    })
  }

  get view () {
    return this._view
  }

  get x () {
    return this._x
  }

  set x (val) {
    if (val < 0 || val >= this._width - 1) {
      return
    }
    this._x = val
    this._view.x = val * this._size
  }

  get y () {
    return this._y
  }

  set y (val) {
    if (val < 0 || val >= this._height) {
      return
    }
    this._y = val
    this._view.y = (this._height - val - 1) * this._size
  }
}
