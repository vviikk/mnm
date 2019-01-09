const { ipcRenderer } = require('electron')
module.exports = function (html, render) {
    // This file is required by the index.html file and will
    // be executed in the renderer process for that window.

    // All of the Node.js APIs are available in this process.
    const services = [
        'https://web.whatsapp.com',
        'https://messenger.com'
    ]

    ipcRenderer.send('init-services', services)

    const moveToTab = idx => () => {
        console.log(idx)
        ipcRenderer.send('move-to-tab', idx)
    }

    const getIcon = url => url.split('https://')[1].split()[0]

    const btnTemplate = idx => html`<button @click=${moveToTab(idx)}>${idx}</button>`
    // Define a template
    const tabs = (tabs) => html`
        <ul class='tabbar'>
            ${services.map((service, index) => html`<li>${btnTemplate(index)}</li>`)}
        </ul>`;

    // Render the template to the document
    render(tabs(services), document.body);

    let myNotification = new Notification('Title', {
    body: 'Lorem Ipsum Dolor Sit Amet'
    })

    myNotification.onclick = () => {
    console.log('Notification clicked')
    }
}
