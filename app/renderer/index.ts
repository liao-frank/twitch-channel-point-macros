const {ipcRenderer} = require('electron')

for (const button of document.querySelectorAll('button')) {
  button.addEventListener('click', () => {
    ipcRenderer.invoke(button.id)
  })
}
