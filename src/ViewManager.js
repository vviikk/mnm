const { BrowserView, shell } = require('electron')
const path = require('path')

class ViewManager {
  constructor(browserWindow, services = []) {
    this.mainWindow = browserWindow
    this.views = []
    this.decorateURL = _ => _
    services.forEach(service =>
      this.addView.bind(this)(service, {
        webPreferences: {
          nodeIntegration: false,
          scrollBounce: true,
          preload: path.join(__dirname, 'preload', 'index.js'),
          allowPopups: false,
        },
      }),
    )
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

  moveToView(idx) {
    this.selectedView = this.views[idx]
    this.selectedView.setBounds(this.size)
    this.mainWindow.setBrowserView(this.selectedView)
  }

  get view() {
    return this._view
  }

  set view(view) {
    this._view = view
    this.mainWindow.setBrowserView(view)
  }

  addView(url, options) {
    const view = new BrowserView(options)

    view.setBounds({ x: 50, y: 0, width: 750, height: 550 })
    view.setAutoResize({ width: true, height: true })

    this.views.push(view)

    this.view = view

    view.webContents.loadURL(this.decorateURL(url))

    // Open all links in user's browser
    view.webContents.on('new-window', (e, urlToOpen) => {
      e.preventDefault()
      shell.openExternal(urlToOpen)
    })

    // view.webContents.openDevTools()
  }
}

module.exports = ViewManager
