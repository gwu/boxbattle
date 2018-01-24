import _ from 'lodash'
import * as PIXI from 'pixi.js'
import { getTexture } from './textures'

export class PlayingField {
  constructor (opts) {
    this._view = new PIXI.Container()
    this._width = opts.width
    this._height = opts.height
    this._size = opts.size || 40

    this._grid = new Grid({
      width: this._width,
      height: this._height,
      size: this._size
    })
    this._grid.loadPuzzle()
    this._view.addChild(this._grid.view)

    this._cursor = new Cursor({
      size: this._size,
      width: this._width,
      height: this._height
    })
    this._view.addChild(this._cursor.view)

    window.addEventListener('keydown', (event) => {
      switch (event.key) {
        case 'a':
          this._grid.swap(this._cursor.y, this.cursor.x)
          break
        case 'ArrowUp':
          this._cursor.y++
          break
        case 'ArrowDown':
          this._cursor.y--
          break
        case 'ArrowLeft':
          this._cursor.x--
          break
        case 'ArrowRight':
          this._cursor.x++
          break
        default:
          return
      }
      event.preventDefault()
    })
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

class Grid {
  constructor (opts) {
    this._view = new PIXI.Container()
    this._width = opts.width
    this._height = opts.height
    this._size = opts.size
    this.clear()
  }

  clear () {
    this._blocks = _.range(this._height).map(
      (row) => _.range(this._width).map(
        (block) => new Block({ type: Block.Types.EMPTY })
      )
    )
  }

  swap (row, col) {
    const left = this._blocks[row][col]
    const right = this._blocks[row][col + 1]
    this.setBlock(row, col, right)
    this.setBlock(row, col + 1, left)
  }

  setBlock (row, col, block) {
    this._view.removeChild(this._blocks[row][col].view)

    const blockViewContainer = new PIXI.Container()
    blockViewContainer.y = (this._height - row - 1) * this._size
    blockViewContainer.x = col * this._size
    blockViewContainer.addChild(block.view)
    this._view.addChild(blockViewContainer)
    this._blocks[row][col] = block
  }

  loadPuzzle () {
    this.clear()
    this.setBlock(0, 0, new Block({
      type: Block.Types.COLOR,
      color: Block.Colors[2],
      size: this._size
    }))
    this.setBlock(0, 1, new Block({
      type: Block.Types.COLOR,
      color: Block.Colors[2],
      size: this._size
    }))
    this.setBlock(0, 3, new Block({
      type: Block.Types.COLOR,
      color: Block.Colors[2],
      size: this._size
    }))
  }

  get view () {
    return this._view
  }
}

class Block {
  constructor (opts) {
    this._view = new PIXI.Container()
    this._type = opts.type
    this._color = opts.color
    this._size = opts.size

    if (this._type === Block.Types.COLOR) {
      const block = new PIXI.Sprite(getTexture(this._color))
      block.width = this._size
      block.height = this._size
      this._view.addChild(block)
    }
  }

  get view () {
    return this._view
  }
}

Block.Types = {
  EMPTY: Symbol('EMPTY'),
  COLOR: Symbol('COLOR')
}

Block.Colors = [
  'red', 'yellow', 'green', 'blue', 'purple'
]
