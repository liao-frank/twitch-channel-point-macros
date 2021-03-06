const { ipcRenderer } = require('electron')

for (const button of document.querySelectorAll('button')) {
  button.addEventListener('click', async () => {
    let result

    try {
      result = await ipcRenderer.invoke(button.id)
    } catch (e) {
      result = e
    }

    console.log(button.id, result)
  })
}
