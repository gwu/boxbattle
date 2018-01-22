import _ from 'lodash'
import * as PIXI from 'pixi.js'
import greenUrl from './TurtleGreen.png'

export const textures = {
  green: greenUrl
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
