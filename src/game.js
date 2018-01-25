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

    this.tick = (delta) => {
      this._playingField.tick(delta)
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

    this.tick = (delta) => {
      this._grid.tick(delta)
    }
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
    border.lineStyle(1, 0x003399, 1)
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
    frame.lineStyle(2, 0xffffff, 1)
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

    this.createGridPosition =
      (block, row, col) => new GridPosition(
        this._size, this._width, this._height, block, row, col
      )

    this.clear()

    this.tick = (delta) => {
      // Scan over the blocks to see if any should start falling.
      // Scan from the bottom row upwards.
      _.range(1, this._height - 1).forEach(
        (row) => _.range(this._width).forEach(
          (col) => {
            const block = this._blocks[row][col].block
            const below = this._blocks[row - 1][col].block
            const above = this._blocks[row + 1][col].block
            if (!below.isWeightBearing && block.type !== Block.Types.EMPTY) {
              block.fall(() => {
                if (above.type === Block.Types.EMPTY) {
                  this.setBlock(row, col, new Block({ type: Block.Types.EMPTY }))
                }
                this.setBlock(row - 1, col, block)
              })
            }
          }
        )
      )

      // Find any matches.
      _.range(this._height).forEach(
        (row) => _.range(this._width).forEach(
          col => {
            const block = this._blocks[row][col].block

            // Horizontal matches.
            let c = 1
            while (col + c < this._width && this._blocks[row][col + c].block.matches(block)) {
              c++
            }
            if (c >= 3) {
              _.range(c).forEach((c) => {
                this._blocks[row][col + c].block.match(() => {
                  this.setBlock(row, col + c, new Block({ type: Block.Types.EMPTY }))
                })
              })
            }

            // TODO vertical matches.
          }
        )
      )

      // All the blocks should tick.
      _.range(this._height).forEach(
        (row) => _.range(this._width).forEach(
          col => {
            const block = this._blocks[row][col].block
            block.tick(delta)
          }
        )
      )
    }
  }

  clear () {
    this._blocks = _.range(this._height).map(
      (row) => _.range(this._width).map(
        (block) => this.createGridPosition(new Block({ type: Block.Types.EMPTY }))
      )
    )
  }

  swap (row, col) {
    const left = this._blocks[row][col].block
    const right = this._blocks[row][col + 1].block
    this.setBlock(row, col, right)
    this.setBlock(row, col + 1, left)
  }

  setBlock (row, col, block) {
    this._view.removeChild(this._blocks[row][col].view)

    const gridPosition = this.createGridPosition(block, row, col)
    if (block.type !== Block.Types.EMPTY) {
      this._view.addChild(gridPosition.view)
    }
    this._blocks[row][col] = gridPosition
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

class GridPosition {
  constructor (size, width, height, block, row, col) {
    this._view = new PIXI.Container()
    this.block = block

    this._view.y = (height - row - 1) * size
    this._view.x = col * size
    this._view.addChild(block.view)
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

    this.tick = (delta) => {
      if (this._isFalling) {
        this._fallingTimeElapsed += delta

        this._view.y = this._fallingTimeElapsed < Block.FALL_DELAY
          ? 0
          : (
            this._size * (this._fallingTimeElapsed - Block.FALL_DELAY) /
              (Block.FALL_DURATION - Block.FALL_DELAY)
          )

        if (this._fallingTimeElapsed >= Block.FALL_DURATION) {
          this._isFalling = false
          this._view.y = 0
          this._onFallComplete()
        }
      }

      if (this._isMatching) {
        this._matchingTimeElapsed += delta

        this._view.alpha =
          (Block.MATCH_DURATION - this._matchingTimeElapsed) / Block.MATCH_DURATION

        if (this._matchingTimeElapsed >= Block.MATCH_DURATION) {
          this._isMatching = false
          this._onMatchComplete()
        }
      }
    }
  }

  get view () {
    return this._view
  }

  get type () {
    return this._type
  }

  get isWeightBearing () {
    return this._type !== Block.Types.EMPTY && !this._isFalling
  }

  fall (onFallComplete) {
    if (this._isFalling) {
      return
    }
    this._isFalling = true
    this._fallingTimeElapsed = 0
    this._onFallComplete = onFallComplete
  }

  matches (other) {
    return (this._type === Block.Types.COLOR && !this._isFalling &&
            !(this._isMatching && this._matchingTimeElapsed > 0) &&
            other._type === Block.Types.COLOR && !other._isFalling &&
            !(other._isMatching && other._matchingTimeElapsed > 0) &&
            this._color === other._color)
  }

  match (onMatchComplete) {
    if (this._isMatching && this._matchingTimeElapsed > 0) {
      return
    }

    this._isMatching = true
    this._matchingTimeElapsed = 0
    this._onMatchComplete = onMatchComplete
  }
}

Block.Types = {
  EMPTY: Symbol('EMPTY'),
  COLOR: Symbol('COLOR')
}

Block.Colors = [
  'red', 'yellow', 'green', 'blue', 'purple'
]

Block.FALL_DURATION = 15
Block.FALL_DELAY = 10
Block.MATCH_DURATION = 60
