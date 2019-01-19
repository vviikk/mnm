// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, session } = require('electron')

const ViewManager = require('./ViewManager')

const config = require('./config')

require('electron-reload')(__dirname, {
  electron: process.execPath,
  hardResetMethod: 'exit',
})

require('update-electron-app')()

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let viewManager

app.setAppUserModelId(process.execPath)

const OPTIONS = require('../package.json').config.mnm

const resetUserAgent = () => {
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders['User-Agent'] = OPTIONS.viewOptions.userAgent
    callback({ cancel: false, requestHeaders: details.requestHeaders })
  })
}

function createWindow() {
  resetUserAgent()
  // Create the browser window.
  mainWindow = new BrowserWindow({ width: 800, height: 600 })

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`)

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  ipcMain.on('move-to-tab', (evt, idx) => viewManager.moveToView(idx))
  ipcMain.on('init-services', (evt, services) => {
    console.log('services to init', services)
    viewManager = new ViewManager(mainWindow, services)
    // viewManager.addView(`file://${__dirname}/prefs.html`, { webPreferences: {nodeIntegration: true}})
  })
  ipcMain.on('size', (evt, size) => {
    viewManager.size = size
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
