const pull = require('pull-stream')
const Server = require('scuttlebot')
const { isBlobId } = require('ssb-ref')
const fileType = require('file-type')

const config = require('./config')
// console.log('config:', config)

console.log('*** installing ssb-server plugins ***')
Server
  .use(require('scuttlebot/plugins/master'))
  .use(require('ssb-blobs'))
  .use(require('../index.js'))

console.log('*** starting ssb-server ***')
const server = Server(config)

const opts = {
  query: 'herm',
  // limit: 10
}

pull(
  server.meme.query(opts),
  pull.map(m => m.value.content.mentions),
  pull.collect((err, data) => {
    var result = data.reduce((soFar, mentions) => {
      mentions
        .filter(m => isBlobId(m.link))
        .filter(m => m.name.indexOf(opts.query) > -1)
        .forEach(({ link, name }) => {
          if (!soFar[link]) soFar[link] = [name]
          else soFar[link].push(name)
        })

      return soFar
    }, {})

    console.log(result)

    pull(
      server.blobs.get('&pwDBdb1KWoLVtaYjIA8p1PUXYcgflIWhsig6ESIIz80=.sha256'),
      pull.drain((buff) => {
        console.log('buff', buff)
        console.log(fileType(buff))
      })
    )

    server.close()
  })
  // pull.drain(
  //   (m) => console.log('!', m),
  //   () => {
  //     console.log('done')
  //     server.close()
  //   }
  // )
)


