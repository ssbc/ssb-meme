const { blobIdRegex } = require('ssb-ref')

const mentionSchema = {
  $schema: 'http://json-schema.org/schema#',
  type: 'object',
  required: ['link', 'name'],
  properties: {
    link: { type: 'string', pattern: blobIdRegex },
    name: { type: 'string', minLength: 3 }
  }
}

module.exports = mentionSchema

// const mentionsSchema = {
//   type: 'array',
//   items: {
//     anyOf: [
//       { $ref: '#/definitions/mention' }
//     ]
//   },
//   definitions: {
//     mention: mentionSchema
//   }
// }
