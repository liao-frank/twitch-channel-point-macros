const nodeAbi = require('node-abi')
const nodeCmd = require('node-cmd')

const abi = nodeAbi.getAbi(process.version.replace('v', ''), 'node')

const output = nodeCmd.runSync(`npm rebuild --runtime=electron --target=12.0.0 --disturl=https://atom.io/download/atom-shell --abi=${abi}`)
console.log(output)
