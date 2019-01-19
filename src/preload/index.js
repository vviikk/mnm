const { ipcRenderer } = require('electron')
const uuidV1 = require('uuid/v1')

/**
 * Patches window.Notification to:
 * - set a callback on a new Notification
 * - set a callback for clicks on notifications
 * @param createCallback
 * @param clickCallback
 */
const setNotificationCallback = (createCallback, clickCallback) => {
  const OldNotify = window.Notification
  class NewNotify {
    constructor(title, opt) {
      this.instance = new OldNotify(title, opt)
      this.instance.notificationId = uuidV1()
      this.instance.addEventListener('show', createCallback)
      this.instance.addEventListener('click', clickCallback)
      return this.instance
    }

    get requestPermission() {
      return OldNotify.requestPermission.bind(this.instance)
    }

    static get permission() {
      return OldNotify.permission
    }
  }

  window.Notification = NewNotify
}

const notifyNotificationCreate = (...args) => {
  console.log('Notification:shown', args)
  ipcRenderer.send('notification', args)
}
const notifyNotificationClick = (...args) => {
  console.log(args)
  ipcRenderer.send('notification-click')
}

setNotificationCallback(notifyNotificationCreate, notifyNotificationClick)
