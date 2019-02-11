const electron = require('electron')

const { BrowserView, shell } = electron
const path = require('path')

class ViewManager {
  constructor(browserWindow, size) {
    this.mainWindow = browserWindow
    this.views = []
    this.size = size
    this.decorateURL = _ => _
    // services.forEach(service =>
    //   this.addView.bind(this)(service,
  }

  set size(size) {
    if (this.selectedView) {
      this.selectedView.setBounds(size)
    }
    this._size = size
  }

  get size() {
    return this._size
  }

  clearup() {
    this.views = []
    this.selectedView = null
  }

  moveToView(idx) {
    if (!this.selectedView) return
    this.selectedView = this.views[idx]
    this.selectedView.setBounds(this.size)
    this.mainWindow.setBrowserView(this.selectedView)
  }

  get view() {
    return this._view
  }

  set view(view) {
    this._view = view
    console.log('setting view')
    this.mainWindow.setBrowserView(view)
  }

  addViewAsync(service) {
    return new Promise((resolve, reject) =>
      addView(service.url, opts, resolve, reject),
    )
  }

  addView({ url }, options, cbsuccess = () => {}, cbfail = () => {}) {
    console.log(url)
    const view = new BrowserView({
      webPreferences: {
        nodeIntegration: false,
        scrollBounce: true,
        preload: path.join(__dirname, 'preload', 'index.js'),
        allowPopups: false,
      },
    })
    console.log(view, 'asd')

    view.setBounds({ x: 50, y: 0, width: 750, height: 550 })
    view.setAutoResize({ width: true, height: true })

    this.mainWindow.setBrowserView(view)

    this.view = view
    console.log('view set', url)

    // Open all links in user's browser
    view.webContents.on('new-window', (e, urlToOpen) => {
      e.preventDefault()
      shell.openExternal(urlToOpen)
    })

    // view.webContents.on('did-finish-load', cbsuccess())
    // view.webContents.on('did-fail-load', cbfail())

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

    return this.view.length - 1

    // view.webContents.openDevTools()
  }
}

module.exports = ViewManager
