// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, session } = require('electron')
const reload = require('electron-reload')
const ViewManager = require('./ViewManager')

const { options, services } = require('./config')

if (!app.isPackaged) {
  console.log('App isnt packaged')
  reload(__dirname, {
    electron: process.execPath,
    hardResetMethod: 'exit',
  })
}
// /////jgccrequire('update-electron-app')()

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let viewManager

app.setAppUserModelId(process.execPath)

const { viewOptions } = options

const resetUserAgent = () => {
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders['User-Agent'] = viewOptions.userAgent
    callback({ cancel: false, requestHeaders: details.requestHeaders })
  })
}

const createWindow = () => {
  resetUserAgent()
  // Create the browser window.
  mainWindow = new BrowserWindow({ width: 800, height: 600 })

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`)

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  mainWindow.on('bootstrap', () => {
    viewManager.clearUp()
  })

  ipcMain.on('add-service', (evt, service) => {
    console.log(service)
    viewManager.addView(service)
  })

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  ipcMain.on('move-to-tab', (evt, idx) => {
    console.log('move to' + idx)
    viewManager.moveToView(idx)
  })

  ipcMain.on('init', (evt, services) => {
    console.log('Booting up...')
    viewManager = new ViewManager(mainWindow)
    ipcMain.on('size', (evt, size) => {
      console.log('size event received')
      viewManager.size = size
    })

    console.log(app.getAppPath())
    // viewManager.addView(`file://${__dirname}/prefs.html`, { webPreferences: {nodeIntegration: true}})
  })
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', createWindow)
}

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
