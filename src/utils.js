const sanitizeFilename = require('sanitize-filename')
const electron = require('electron')

const USER_PATH = (electron.app || electron.remote.app).getPath('userData')

module.exports = {
  USER_PATH,
  isProd: () => process.env === 'development',
  getSafeFilename: url => `${USER_PATH}/${sanitizeFilename(url)}`,
}
