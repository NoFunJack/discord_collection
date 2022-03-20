console.log('update Bulk data from scryfall')

const request = require('request')
const fs = require('fs')

request('https://api.scryfall.com/bulk-data/oracle-cards', { json: true }, (err, res, body) => {
  if (err) { return console.log(err) }
  console.log(body)
  request(body.download_uri, { json: true }, (err, res, body) => {
    if (err) { return console.log(err) }
    const data = JSON.stringify(body)
    fs.writeFileSync('./data/all-cards.json', data)
  })
})
