const sanitizeFilename = require('sanitize-filename')
const electron = require('electron')

const USER_PATH = (electron.app || electron.remote.app).getPath('userData')

const ICON_PATH = 'icons'

module.exports = {
  USER_PATH,
  isProd: () => process.env === 'development',
  getSafeFilename: url =>
    `file://${USER_PATH}/${ICON_PATH}/${sanitizeFilename(url)}`,
}
