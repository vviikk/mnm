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
        preload: './preload/index.js'
      },
    })

    view.setBounds({ x: 50, y: 0, 
      width: 750,
      height: 550,
    })

    view.setAutoResize({ width: true, height: true })

    view.webContents.insertCSS(`
    body { padding: 10px; border: 20px solid red; }
    @-moz-document domain(web.whatsapp.com)
{
@  media screen and (max-width: 500px)
  {
    .app-wrapper-main.app-wrapper {
        min-width: 100%;
  }

  .drawer-container-mid,.drawer-container-right,
    .pane-chat,.pane-intro
  {
    width: 100%;
  }

  .pane-list,
    .drawer-container-left
  {
    height: 60px;
    position: absolute;
    width: 100%;
  }

  .pane-list:hover,
    .drawer-container-left:hover
  {
    border: 1px solid rgba(0,0,0,.8);
    border-top: none;
    box-shadow: 0 8px 45px rgba(54,65,89,1);
    cursor: pointer;
    height: 80%;
  }

  .pane-chat-header
  {
    margin-top: 60px;
  }

  .pane-list-header
  {
    background: rgba(225,245,254,.92);
  }

  .pane-list:hover .pane-list-header
  {
    background: #009688;
  }

    /* Notification Badge */
  .app:after
  {
    background-color: #C00;
    border: 1px solid #900;
    border-radius: 25px;
    bottom: 0;
    color: #fff;
    content: counter(unread);
    font-size: 14px;
    height: 20px;
    left: 45px;
    line-height: 20px;
    position: absolute;
    text-align: center;
    top: 30px;
    width: 20px;
    z-index: 20;
  }
}

/* Counter */
.app
{
  counter-reset: unread;
}

.unread
{
  counter-increment: unread;
}
}`)


    this.views.push(view)

    this.mainWindow.setBrowserView(view)

    view.webContents.loadURL(this.decorateURL(url))

    view.webContents.openDevTools()

    view.webContents.executeJavaScript(`setTimeout(function(){
      console.log("hello world");
    }, 3000)

    const OldNotification = window.Notification

    class Notification extends OldNotification {
      constructor(...args) {
        super(...args)
        console.log(args[0], args.parseJSON())
      }
    } 

    window.Notification = Notification
    `, function(){console.log ('finish')})
  }
}

module.exports = ViewManager
