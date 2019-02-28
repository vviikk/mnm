const { ipcRenderer } = require('electron')

const windowIsFullscreen = false

const viewMargins = [0, 0, 0, 50] // top, right, bottom, left

const { options, services } = require('./config')

const TitleBar = require('./renderer/components/TitleBar.js')

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

  const fetchIcon = async url => {
    const resp = await fetch(`${options.faviconService}?url=${url}`)

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
    ${TitleBar(html)}
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

  window.addEventListener('resize', () => {
    clearTimeout(window.resizedFinished)
    window.resizedFinished = setTimeout(() => {
      console.log('Resized finished.')
      ipcRenderer.send('size', getViewBounds())
    }, 250)
  })
}
