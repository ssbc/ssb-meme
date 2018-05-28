const FlumeView = require('flumeview-search')
const pull = require('pull-stream')
const Validator = require('is-my-json-valid')

const isBlobMention = Validator(require('./schema/mention'))

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
      search
    }

    function search (opts, cb) {
      if (typeof opts === 'string') opts = { query: opts }

      pull(
        view.query(opts),
        pull.collect((err, data) => {
          if (err) return cb(err)

          const result = data.reduce((soFar, msg) => {
            getMentions(msg)
              .filter(isBlobMention)
              .filter(m => m.name.indexOf(opts.query) > -1) // only mentions relevant to the query
              .forEach(({ link, name }) => {
                if (!soFar[link]) soFar[link] = []

                soFar[link].push({ name, author: getAuthor(msg), msg: msg.key })
              })

            return soFar
          }, {})

          cb(null, result)
        })
      )
    }
  }
}

const imgExtRegEx = /\.(jpg|jpeg|png|gif|bmp|svg)$/i
const spaceCharRegex = /(-|\.|_|\/|~)/g

function map (msg) {
  return getMentions(msg)
    .filter(isBlobMention)
    .filter(blobHasName)
    .map(m => m.name)
    .map(n => n.replace(imgExtRegEx, '').replace(spaceCharRegex, ' '))
    .join(' ')
}

function blobHasName(mention) {
  return typeof(mention.name) === "string"
}

function getMentions (msg) {
  if (!msg.value.content.mentions) return []
  else if (!Array.isArray(msg.value.content.mentions)) return [msg.value.content.mentions]
  else return msg.value.content.mentions
}

function getAuthor (msg) {
  return msg.value.author
}
