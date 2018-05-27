const FlumeView = require('flumeview-search')
const pull = require('pull-stream')
const { isBlobId } = require('ssb-ref')
const Validator = require('is-my-json-valid')

const hasBlobMention = Validator(require('../schema/mentions'))

const INDEX_VERSION = 2

module.exports = {
  name: 'meme',
  version: require('./package.json').version,
  manifest: {
    query: 'source',
    search: 'async'
  },
  init: (sbot) => {
    const view = sbot._flumeUse('meme', FlumeView(INDEX_VERSION, 3, map))

    return {
      query: view.query,
      search: (opts, cb) => {
        if (typeof opts === 'string') opts = { query: opts }

        pull(
          view.query(opts),
          pull.map(m => m.value.content.mentions),
          pull.collect((err, data) => {
            if (err) return cb(err)

            const result = data.reduce((soFar, mentions) => {
              mentions
                .filter(m => isBlobId(m.link))
                .filter(m => m.name.indexOf(opts.query) > -1)
                .forEach(({ link, name }) => {
                  if (!soFar[link]) soFar[link] = [name]
                  else soFar[link].push(name)
                })

              return soFar
            }, {})

            cb(null, result)
          })
        )
      }
    }
  }
}

const imgExtRegEx = /\.(jpg|jpeg|png|gif|bmp|svg)$/i
const spaceCharRegex = /(-|\.|_|\/|~|\s)/g

function map (msg) {
  var mentions = msg.value.content.mentions || []
  if (!Array.isArray(mentions)) mentions = [mentions]
  
  // if (!hasBlobMention(mentions)) return

  return mentions
    // .filter(m => typeof m === 'object' && m.type)
    // .filter(m => m.type.indexOf('image') === 0) // some mentions don't have a file type!
    .filter(m => isBlobId(m.link))
    .map(m => m.name)
    .filter(Boolean)
    .map(m => m.replace(imgExtRegEx, '').replace(spaceCharRegex, ' '))
    .join(' ')
}
