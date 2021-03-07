import { ipcRenderer } from 'electron'

for (const button of document.querySelectorAll('button')) {
  button.addEventListener('click', async () => {
    console.log(button.id, await ipcRenderer.invoke(button.id))
  })
}
