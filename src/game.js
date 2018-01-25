import _ from 'lodash'
import * as PIXI from 'pixi.js'
import { getTexture } from './textures'
import { loadPuzzleData } from './puzzle'

export class Game {
  constructor (opts) {
    this._view = new PIXI.Container()
    this._playingField = new PlayingField({
      width: 6,
      height: 12,
      size: 32
    })
    this._view.addChild(this._playingField.view)
    this._view.x = window.innerWidth / 2 - 3 * 32
    this._view.y = window.innerHeight / 2 - 6 * 32

    if (opts.type === Game.Type.PUZZLE) {
      this._playingField.grid.loadPuzzle(opts.stage)
    }
  }

  get view () {
    return this._view
  }

  swap () {
    this._playingField.grid.swap(this._playingField.cursor.y, this._playingField.cursor.x)
  }

  moveCursor (dx, dy) {
    this._playingField.cursor.x += dx
    this._playingField.cursor.y += dy
  }
}

Game.Type = {
  PUZZLE: Symbol('PUZZLE')
}

export class PlayingField {
  constructor (opts) {
    this._view = new PIXI.Container()
    this._width = opts.width
    this._height = opts.height
    this._size = opts.size

    this._grid = new Grid({
      width: this._width,
      height: this._height,
      size: this._size
    })
    this._view.addChild(this._grid.view)

    this._cursor = new Cursor({
      width: this._width,
      height: this._height,
      size: this._size
    })
    this._view.addChild(this._cursor.view)

    this._frame = new Frame({
      width: this._width,
      height: this._height,
      size: this._size
    })
    this._view.addChild(this._frame.view)
  }

  get view () {
    return this._view
  }

  get cursor () {
    return this._cursor
  }

  get grid () {
    return this._grid
  }
}

class Frame {
  constructor (opts) {
    this._view = new PIXI.Container()
    this._size = opts.size
    this._width = opts.width
    this._height = opts.height

    const border = new PIXI.Graphics()
    border.lineStyle(8, 0x003399, 1)
    border.moveTo(0, 0)
    border.lineTo(this._size * this._width, 0)
    border.lineTo(this._size * this._width, this._size * this._height)
    border.lineTo(0, this._size * this._height)
    border.lineTo(0, 0)
    this._view.addChild(border)
  }

  get view () {
    return this._view
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

  loadPuzzle (stage) {
    this.clear()
    loadPuzzleData(stage)
      .then((data) => {
        data.blocks.forEach((blockDef) => {
          this.setBlock(blockDef.row, blockDef.col, new Block({
            type: Block.Types.COLOR,
            color: Block.Colors[blockDef.color],
            size: this._size
          }))
        })
      })
      .catch((err) => console.log(err))
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
