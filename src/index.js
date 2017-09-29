import _ from 'lodash'
import * as PIXI from 'pixi.js'

function main () {
  // Create the renderer.
  const renderer = PIXI.autoDetectRenderer(
    window.innerWidth,
    window.innerHeight
  )
  renderer.autoResize = true

  // Resize the renderer when the window size changes.
  window.addEventListener(
    'resize',
    _.debounce(onWindowResize.bind(null, renderer), 100)
  )

  // Add the stage.
  const stage = new PIXI.Container()
  renderer.render(stage)

  // Append it to the DOM.
  document.body.appendChild(renderer.view)
}

function onWindowResize (renderer, event) {
  renderer.resize(window.innerWidth, window.innerHeight)
}

main()
