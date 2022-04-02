console.log('update Bulk data from scryfall')

import request from 'request'
import fs from 'fs'

request('https://api.scryfall.com/bulk-data/oracle-cards', { json: true }, (err, res, body) => {
  if (err) { return console.log(err) }
  console.log(body)
  request(body.download_uri, { json: true }, (err, res, body) => {
    if (err) { return console.log(err) }
    const data = JSON.stringify(body.filter(c => ['neo','vow','mid'].includes(c.set)))
    fs.writeFileSync('./data/all-cards.json', data)
  })
})
