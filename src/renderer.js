const { ipcRenderer } = require('electron')
const gicon = require("gicon");

const OPTIONS = require('../package.json').config.mnm

module.exports = function (html, render) {
  // This file is required by the index.html file and will
  // be executed in the renderer process for that window.

  // All of the Node.js APIs are available in this process.
  const services = [
    'https://web.whatsapp.com',
    'https://messenger.com',
    // 'https://www.html5rocks.com/en/tutorials/notifications/quick/',
    'https://feedly.com',
    'https://outlook.com'
  ]

  // get favicon url
  const getIcon = url => `${OPTIONS.faviconService}?url=${url}`

  const fetchIcon = async (url) => {
    const resp = await fetch(`${OPTIONS.faviconService}?url=${url}`)

    const faviconUrl = (await resp.json()).faviconUrl
    return faviconUrl
  }


  ipcRenderer.send('init-services', services)

  const moveToTab = idx => () => {
    console.log(idx)
    ipcRenderer.send('move-to-tab', idx)
  }


  const btnTemplate = ( img, idx ) => html`
    <button @click=${moveToTab(idx)}><img src='${img}'/></button>`
  // Define a template
  const tabs = (images) => html`
        <ul class='tabbar'>
            ${images.map((image, index) => html`<li>${btnTemplate(image, index)}</li>`)}
        </ul>`;

  const bootstrap = () => {
    const iconsUnresolved = services.map(service => fetchIcon(service))
    Promise.all(iconsUnresolved).then(icons => {
      console.log(icons)
      render(tabs(icons), document.body)
    })
  }


  bootstrap()
  // Render the template to the document

  let myNotification = new Notification('Title', {
    body: 'Lorem Ipsum Dolor Sit Amet'
  })

  myNotification.onclick = () => {
    console.log('Notification clicked')
  }
}
