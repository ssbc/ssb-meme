const Config = require('ssb-config/inject')
// const Config = require('ssb-config')
const ssbKeys = require('ssb-keys')
const Path = require('path')

const appName = 'ssb' // <<< NOTE THIS IS YOUR DEFAULT IDENTITY
const opts = null // can set things in here

const config = Config(appName, opts)
Object.assign(config, {
  appName,
  keys: ssbKeys.loadOrCreateSync(Path.join(config.path, 'secret'))
})

module.exports = config
