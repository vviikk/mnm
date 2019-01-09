const { BrowserView } = require('electron')

class ViewManager {
  constructor(browserWindow, services = []) {
    this.mainWindow = browserWindow
    this.views = []
    this.decorateURL = _ => _
    services.forEach(this.addView.bind(this))
  }

  moveToView(idx) {
    this.mainWindow.setBrowserView(this.views[idx])
  }
  
  addView(url) {
    const view = new BrowserView({
      webPreferences: {
        nodeIntegration: false,
      },
    })

    view.setBounds({ x: 50, y: 0, 
      width: 750,
      height: 550,
    })

    view.setAutoResize({ width: true, height: true })

    this.views.push(view)

    mainWindow.setBrowserView(view)

    view.webContents.loadURL(this.decorateURL(url))

    view.webContents.executeJavaScript(`setTimeout(function(){
      console.log("hello world")
    }, 3000)`, function(){console.log ('finish')})
  }
}
