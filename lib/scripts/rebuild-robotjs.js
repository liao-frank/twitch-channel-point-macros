const nodeAbi = require('node-abi')
const cmd = require('node-cmd')

const abi = nodeAbi.getAbi(process.version.replace('v', ''), 'node')

const output = cmd.runSync(`npm rebuild --runtime=electron --target=12.0.0 --disturl=https://atom.io/download/atom-shell --abi=${abi}`)
console.log(output)
