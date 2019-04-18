import { getSafeFilename } from './utils.js'

describe('utils', () => {
  it('gets safe filename', () => {
    expect(getSafeFilename('123.jpg')).toEqual('123.jpg')
  })
})
