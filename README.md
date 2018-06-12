# ssb-meme

Uses [flumeview-search](https://github.com/flumedb/flumeview-search) to build an index of all images names.

## Example Usage

```js
var Scuttlebot = require('scuttlebot')

Scuttlebot
  .use(require('scuttlebot/plugins/master'))
  .use(require('ssb-meme'))

var sbot = Scuttlebot(config) // see test/index.js for details

sbot.meme.search('hermes', (err, results) => {
  // ...
})
```


## API

### `sbot.meme.search(query, callback)`

- `query` must be a string at least 3 characters long
- `callback` recieves results as an object of form: 

```js
{
  '&234x234lass...': [
    { name: 'hermes-spade', author:'@ye+4...', msg: '%q24dad323...' }
    { name: 'hermes-wacka', author:'@mox5...', msg: '%asdasd696...' }
    //...
  ]
  //...
}
```

msg is the message where this mention occured

### `sbot.meme.query`

this is the raw method provided by flumeview-search. Not recommended for general use

