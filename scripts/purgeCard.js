import loki from 'lokijs'

const myArgs = process.argv.slice(2)
const dbFile = myArgs[0]
const card = myArgs[1]
console.log(dbFile)
const db = new loki(dbFile, { verbose: true })

db.loadDatabase({}, function (err) {
  if (err) {
    console.log(err)
  } else {
    const cards = db.getCollection('cards')
    console.log(db.listCollections())
    const query = { card: card }
    const stdin = process.stdin
    const stdout = process.stdout

    stdin.resume()
    stdout.write(`found ${cards.find(query).length} cards. delete?(y/n)`)

    stdin.once('data', function (ans) {
      console.log(ans.toString())
      if (ans.toString().trim() == 'y') {
        cards.findAndRemove(query)
        db.saveDatabase(function(err){
          if(err){
            console.log(err)
          } else{
            console.log("all gone!")
            process.exit()
          }
        })
      } else {
        console.log('quitting!')
        process.exit()
      }
    })
  }
})
