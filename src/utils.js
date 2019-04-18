import sanitizeFilename from 'sanitize-filename'
const electron = require('electron')

export const getUserPath = () => (electron.app || electron.remote.app).getPath(
  'userData',
)
export const isProd = () => process.env === 'development'

export const getSafeFilename = url => getUserPath() + sanitizeFilename(url)
