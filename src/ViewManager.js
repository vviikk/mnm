const electron = require('electron')

const { BrowserView, shell } = electron
const path = require('path')

class ViewManager {
  constructor(browserWindow, size) {
    this._mainWindow = browserWindow
    this._views = []
    this._size = size
    this.decorateURL = _ => _
    this._selectedView = null

    this.bootstrapWindow()
  }

  bootstrapWindow() {
    this._mainWindow.setAutoHideMenuBar(true)
  }

  set size(size) {
    if (this._selectedView) {
      this._selectedView.setBounds(size)
    }
    this._size = size
  }

  get size() {
    return this._size
  }

  clearup() {
    this._views = []
    this._selectedView = null
  }

  moveToView(idx) {
    // if (!this._selectedView) return
    console.log('Moving to' + idx, this._views, 'size', this.size)
    this._selectedView = this._views[idx]
    if (this.size) {
      this._selectedView.setBounds(this.size)
    }
    this._mainWindow.setBrowserView(this._selectedView)
  }

  addViewAsync(service, opts) {
    return new Promise((resolve, reject) =>
      this.addView(service.url, opts, resolve, reject),
    )
  }

  addView({ url }, options, cbsuccess = () => {}, cbfail = () => {}) {
    const view = new BrowserView({
      webPreferences: {
        nodeIntegration: false,
        scrollBounce: true,
        preload: path.join(__dirname, 'preload', 'index.js'),
        allowPopups: false,
      },
    })

    view.webContents.loadURL(url)

    view.setBounds({ x: 50, y: 0, width: 750, height: 550 })

    view.setAutoResize({ width: true, height: true })

    // Open all links in user's browser
    view.webContents.on('new-window', (e, urlToOpen) => {
      e.preventDefault()
      shell.openExternal(urlToOpen)
    })

    // Fix for Facebook Messenger
    view.webContents.on(
      'new-window',
      (e, newUrl, frameName, disposition, newOptions) => {
        e.preventDefault()
        if (newUrl === 'about:blank') {
          if (frameName === 'Video Call') {
            // Voice/video call popup
            newOptions.show = true
            newOptions.titleBarStyle = 'default'
            e.newGuest = new electron.BrowserWindow(newOptions)
          }
        } else {
          electron.shell.openExternal(newUrl)
        }
      },
    )

    this._views.push(view)
    this.moveToView(this._views.length - 1)

    // view.webContents.on('did-finish-load', cbsuccess())
    // view.webContents.on('did-fail-load', cbfail())

    return true

    // view.webContents.openDevTools()
  }
}

module.exports = ViewManager
