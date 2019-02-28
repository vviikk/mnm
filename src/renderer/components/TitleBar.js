const { remote } = require('electron')

const handleMinimize = () => {
  remote.BrowserWindow.getFocusedWindow().minimize()
}

const handleMaximize = win => {
  if (remote.BrowserWindow.getFocusedWindow().isMaximized()) {
    remote.BrowserWindow.getFocusedWindow().unmaximize()
  } else {
    remote.BrowserWindow.getFocusedWindow().maximize()
  }
}

const handleClose = win => {
  remote.BrowserWindow.getFocusedWindow().close()
}

module.exports = html => html`
  <div class="title-bar">
    <div class="title-bar-dragger"></div>
    <ul class="window-actions">
      <li @click=${handleMinimize}><span>🗕</span></li>
      <li @click=${handleMaximize}><span>🗖</span></li>
      <li @click=${handleClose}><span>✖️</span></li>
    </ul>
  </div>
`
