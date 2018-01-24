import _ from 'lodash'
import * as PIXI from 'pixi.js'
import { loadTextures, getTexture } from './textures'
import { Game } from './game'

function main () {
  // Create the renderer.
  const app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight
  })
  app.renderer.autoResize = true

  // Resize the renderer when the window size changes.
  window.addEventListener(
    'resize',
    _.debounce(onWindowResize.bind(null, app.renderer), 100)
  )

  // Load and start the game
  loadTextures()
    .then(startGame.bind(null, app))

  // Append it to the DOM.
  document.body.appendChild(app.view)
}

function onWindowResize (renderer, event) {
  renderer.resize(window.innerWidth, window.innerHeight)
}

function startGame (app) {
  const game = new Game({
    type: Game.Type.PUZZLE,
    stage: 2
  })
  app.stage.addChild(game.view)

  const turtle = new PIXI.Sprite(getTexture('green'))
  turtle.anchor.set(0.5)
  turtle.x = app.screen.width / 2
  turtle.y = app.screen.height / 2
  app.stage.addChild(turtle)

  app.ticker.add((delta) => {
    turtle.rotation += 0.01 * delta
  })

  window.addEventListener('keydown', (event) => {
    switch (event.key) {
      case 'a':
        game.swap()
        break
      case 'ArrowUp':
        game.moveCursor(0, 1)
        break
      case 'ArrowDown':
        game.moveCursor(0, -1)
        break
      case 'ArrowLeft':
        game.moveCursor(-1, 0)
        break
      case 'ArrowRight':
        game.moveCursor(1, 0)
        break
      default:
        return
    }
    event.preventDefault()
  })
}

main()
