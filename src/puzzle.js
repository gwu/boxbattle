export function loadPuzzleData (stage) {
  return new Promise((resolve, reject) => {
    switch (stage) {
      case 1:
        return resolve({
          blocks: [
            { row: 0, col: 0, color: 2 },
            { row: 0, col: 1, color: 2 },
            { row: 0, col: 3, color: 2 }
          ]
        })
      case 2:
        return resolve({
          blocks: [
            { row: 0, col: 0, color: 2 },
            { row: 0, col: 1, color: 2 },
            { row: 1, col: 1, color: 2 }
          ]
        })
    }
    reject(new Error('Unrecognized stage'))
  })
}
