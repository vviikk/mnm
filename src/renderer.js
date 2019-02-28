const { ipcRenderer } = require('electron')

const windowIsFullscreen = false

const viewMargins = [0, 0, 0, 50] // top, right, bottom, left

const OPTIONS = require('../package.json').config.mnm

const { options, services } = require('./config/defaultConfig')

const getViewBounds = () => {
  if (windowIsFullscreen) {
    return {
      x: 0,
      y: 0,
      width: window.innerWidth,
      height: window.innerHeight,
    }
  }

  const navbarHeight = 0
  // window.platformType === 'windows' && !windowIsMaximised ? 46 : 36

  return {
    x: 0 + viewMargins[3],
    y: 0 + viewMargins[0] + navbarHeight,
    width: window.innerWidth - (viewMargins[1] + viewMargins[3]),
    height:
      window.innerHeight - (viewMargins[0] + viewMargins[2]) - navbarHeight,
  }
}

module.exports = (html, render) => {
  // This file is required by the index.html file and will
  // be executed in the renderer process for that window.

  // All of the Node.js APIs are available in this process.
  // const services = [
  //   'https://web.whatsapp.com',
  //   'https://messenger.com',
  //   'https://www.html5rocks.com/en/tutorials/notifications/quick/',
  //   'https://feedly.com',
  //   'https://outlook.com',
  //   'https://www.daftlogic.com/sandbox-using-html5-notifications.htm',
  //   'https://mail.zoho.com',
  //   'https://lazada.com',
  //   'https://gmail.com',
  //   'https://instagram.com',
  //   'https://facebook.com',
  //   'https://wechat.com',
  // ]

  const fetchIcon = async url => {
    const resp = await fetch(`${OPTIONS.faviconService}?url=${url}`)

    const { faviconUrl } = await resp.json()
    return faviconUrl
  }

  ipcRenderer.send('init')
  services.forEach(service => ipcRenderer.send('add-service', service))

  const moveToTab = idx => () => {
    ipcRenderer.send('move-to-tab', idx)
  }

  const btnTemplate = (img, idx) => html`
    <button @click=${moveToTab(idx)}><img src="${img}" /></button>
  `

  const servicesList = images =>
    images.map(
      (image, index) =>
        html`
          <li>${btnTemplate(image, index)}</li>
        `,
    )

  // Define a template
  const tabs = images => html`
    <ul class="tabbar">
      ${servicesList(images)}
    </ul>
  `

  const bootstrap = () => {
    const iconsUnresolved = services.map(({ url }) => fetchIcon(url))
    Promise.all(iconsUnresolved).then(icons => {
      console.log(icons)
      render(tabs(icons), document.body)
    })
  }

  bootstrap()
  // Render the template to the document

  window.addEventListener('resize', () => {
    clearTimeout(window.resizedFinished)
    window.resizedFinished = setTimeout(() => {
      console.log('Resized finished.')
      ipcRenderer.send('size', getViewBounds())
    }, 250)
  })
}
