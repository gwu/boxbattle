import _ from 'lodash'
import * as PIXI from 'pixi.js'
import greenUrl from './TurtleGreen.png'
import blueUrl from './TurtleBlue.png'
import redUrl from './TurtleRed.png'
import purpleUrl from './TurtlePurple.png'
import yellowUrl from './TurtleYellow.png'

export const textures = {
  green: greenUrl,
  blue: blueUrl,
  red: redUrl,
  purple: purpleUrl,
  yellow: yellowUrl
}

export function loadTextures () {
  return new Promise((resolve, reject) => {
    _(textures).values().forEach((url) => PIXI.loader.add(url))
    PIXI.loader.load(resolve)
  })
}

export function getTexture (name) {
  return PIXI.loader.resources[textures[name]].texture
}
