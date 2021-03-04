import robot from 'robotjs'

setTimeout(() => {
  robot.keyToggle('p', 'down', 'control')
  setTimeout(() => {
    robot.keyToggle('p', 'up', 'control')
  }, 1000)
}, 3000)
