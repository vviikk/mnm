// Modules to control application life and create native browser window
const {app, BrowserWindow, BrowserView, ipcMain, session } = require('electron')
const ViewManager = require('./ViewManager')
const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow, viewManager

app.setAppUserModelId(process.execPath)

const OPTIONS = require('../package.json').config.mnm

const resetUserAgent = () => {
  console.log('am i running')
	session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders['User-Agent'] = OPTIONS.viewOptions.userAgent
    callback({ cancel: false, requestHeaders: details.requestHeaders });
	});
}



function createWindow () {
  resetUserAgent()
  // Create the browser window.
  mainWindow = new BrowserWindow(
    {width: 800, height: 600,
  })

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  ipcMain.on('move-to-tab', (evt, idx) => viewManager.moveToView(idx))
  ipcMain.on('init-services', (evt, services) => {
    console.log('services to init', services)
    viewManager = new ViewManager(mainWindow, services)
  })
 

  //   let view = new BrowserView({
  //   webPreferences: {
  //     nodeIntegration: false,
  //   },
  // })

  // view.setBounds({ x: 0, y: 0, 
  //   width: 800,
  //   height: 550,
  // })

  // view.setAutoResize({ width: true, height: true })

  // // mainWindow.setBrowserView(view)

  // view.webContents.loadURL('http://localhost:3000/not')

  // view.webContents.executeJavaScript(`
	// 	var base = document.createElement('base');
	// 	base.href = "http://localhost:3000/not";
	// 	document.getElementsByTagName('head')[0].appendChild(base);
  //   const OldNotification = window.Notification
  //   class Notification extends OldNotification {
  //     constructor(...args) {
  //       console.log(args)
  //       super(...args)
  //     }
  //   }

  //   window.Notification = Notification

  // setTimeout(function(){
  //   console.log("hello world")
  // }, 3000)`, function(){console.log ('finish')})
  // view.webContents.openDevTools()

  // view.webContents.on('console-message', console.log)

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
