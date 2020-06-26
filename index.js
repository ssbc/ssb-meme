const FlumeView = require('flumeview-search')
const pull = require('pull-stream')
const Validator = require('is-my-json-valid')

const isBlobMention = Validator(require('./schema/mention'))

const INDEX_VERSION = 3
const SEARCH_TERM_MIN = 3

const imgExtRegEx = /\.(jpg|jpeg|png|gif|bmp|svg)$/i
const spaceCharRegex = /(-|\.|_|\/|~|\s)/g

module.exports = {
  name: 'meme',
  version: require('./package.json').version,
  manifest: {
    query: 'source',
    search: 'async'
  },
  init: (sbot) => {
    const view = sbot._flumeUse('meme', FlumeView(INDEX_VERSION, SEARCH_TERM_MIN, map))

    return {
      query: view.query,
      search
    }

    function search (opts, cb) {
      if (typeof opts === 'string') opts = { query: opts }
      opts.query = opts.query.toLowerCase()

      const validTerms = opts.query
        .split(spaceCharRegex)
        .filter(s => s.length >= SEARCH_TERM_MIN)

      pull(
        view.query(opts),
        pull.collect((err, data) => {
          if (err) return cb(err)

          const result = data.reduce((soFar, msg) => {
            getMentions(msg)
              .filter(isBlobMention)
              .filter(containsSearchTerms)
              .forEach(({ link, name }) => {
                if (!soFar[link]) soFar[link] = []

                soFar[link].push({ name, author: getAuthor(msg), msg: msg.key })
              })

            return soFar
          }, {})

          cb(null, result)
        })
      )

      function containsSearchTerms (mention) {
        const name = mention.name.toLowerCase()
        return validTerms.every(term => name.indexOf(term) > -1)
      }
    }
  }
}

function map (msg) {
  return getMentions(msg)
    .filter(isBlobMention)
    .map(m => m.name)
    .map(n => n.replace(imgExtRegEx, '').replace(spaceCharRegex, ' '))
    .join(' ')
}

function getMentions (msg) {
  if (!msg.value.content.mentions) return []
  else if (!Array.isArray(msg.value.content.mentions)) return [msg.value.content.mentions]
  else return msg.value.content.mentions
}

function getAuthor (msg) {
  return msg.value.author
}
