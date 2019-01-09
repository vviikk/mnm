const { app, BrowserView, BrowserWindow, Notification, session } = require('electron');


const OPTIONS = {
  size: {
    width: 800,
    height: 600,
  },
  viewOptions: {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36'
  }
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

const MODEL_ID = 'C:\\Users\\piggy\\play\\mnm\\node_modules\\electron\\dist\\electron.exe'

app.setAppUserModelId(process.execPath)

console.log(MODEL_ID)

// const notifier = require('node-notifier');
// // String
// notifier.notify('Message');

// // Object
// notifier.notify({
//   title: 'My notification',
//   message: 'Hello, there!'
// });
// console.log('not')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

const resetUserAgent = () => {
console.log('am i running')
	session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
				details.requestHeaders['User-Agent'] = OPTIONS.viewOptions.userAgent
				callback({ cancel: false, requestHeaders: details.requestHeaders });
	});
}

const createWindow = () => {
  resetUserAgent()
  // Create the browser window.
  mainWindow = new BrowserWindow(OPTIONS.size);

  // and load the index.html of the app.

  // const gitkraken = '/mnt/c/Users/piggy/AppData/Local/gitkraken/app-4.1.1/resources/mmm/static/loading.html'
  // mainWindow.loadURL(`${gitkraken}`, OPTIONS.viewOptions);
  // mainWindow.loadURL(`file://${__dirname}/index.html`, OPTIONS.viewOptions);

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  let view = new BrowserView({
    webPreferences: {
      nodeIntegration: false,
    },
  })

  view.setBounds({ x: 0, y: 0, 
    width: 800,
    height: 550,
  })

  view.setAutoResize({ width: true, height: true })

  mainWindow.setBrowserView(view)

  view.webContents.loadURL('http://localhost:3000/not')

  view.webContents.executeJavaScript(`
		var base = document.createElement('base');
		base.href = "http://localhost:3000/not";
		document.getElementsByTagName('head')[0].appendChild(base);
    const OldNotification = window.Notification
    class Notification extends OldNotification {
      constructor(...args) {
        console.log(args)
        super(args)
      }
    }

    window.Notification = Notification

  setTimeout(function(){
    console.log("hello world")
  }, 3000)`, function(){console.log ('finish')})
  view.webContents.openDevTools()
  const n = new Notification({ title: 'From Main Thread!' })
  n.show()

};


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

var http = require('http')
var connect = require('connect')
var proxy = require('http-proxy-middleware')
var morgan = require('morgan')
var fs = require('fs')
var path = require('path')
// create a write stream (in append mode)
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })


const domainRewrite = (path, req) => {
  console.log(path)
  return path
}

var apiProxy = proxy('/not', {
	// target: 'https://web.whatsapp.com',
	target: 'http://www.bennish.net/web-notifications.html',
	changeOrigin: true, // for vhosted sites,
  pathRewrite: domainRewrite,
	onProxyReq: function(proxyReq, req, res) {
		// add new header to request
		proxyReq.setHeader(
      "User-Agent", 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36')
      proxyReq.setHeader('x-added', 'foobar')
    console.log(req.headers)
	},
})


var appProxy = connect()
// setup the logger
appProxy.use(morgan('combined', { stream: accessLogStream }))

appProxy.use(apiProxy)

http.createServer(appProxy).listen(3000)

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
