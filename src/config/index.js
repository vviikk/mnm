const { app } = require('electron')

const Store = require('electron-store')

const store = new Store()

if (!app.isPackaged) {
  const defaultOptions = require('./defaultConfig.json')
  store.store = defaultOptions
  console.log('Default config loaded for development')
}

// store.set('unicorn', '🦄')
// console.log(store.get('unicorn'))
console.log(store.get('options'))
//= > '🦄'

module.exports = {
  store,
  ...store.store,
}
