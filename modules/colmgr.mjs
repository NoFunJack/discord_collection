import loki from 'lokijs'
import fs from 'fs-extra'

export async function initDb (dbFile) {
  const re = {}
  fs.ensureFileSync(dbFile, err => {
    if (err) {
      console.log(err)
    }
  })
  re.db = new loki(dbFile, { verbose: true })
  await loadDbPromise(re.db)

  re.cards = initCollection(re.db, 'cards')
  re.users = initCollection(re.db, 'users')

  re.getCards = function (user) {
    return this.cards.find({ owner: user })
  }

  re.tryAddBoosterCards = async function (userId, cards) {
    const user = re.users.findOne({ userId: userId })
    if (user.boosterPoints > 0) {
      re.add_cards(userId, cards)
      user.boosterPoints -= 1
      re.users.update(user)
      await saveDb(this.db)
      return true;
    } else {
      return false;
    }
  }

  re.add_cards = async function (user, cards) {
    for (const c of cards) {
      this.cards.insert({
        owner: user,
        card: c
      })
    }
    await saveDb(this.db)
  }

  re.delete = function () {
    return new Promise((resolve) => {
      this.db.deleteDatabase(function (err) {
        if (err) {
          console.error(err)
          throw new Error(err)
        } else {
          console.log('deleted database')
          resolve()
        }
      })
    })
  }

  re.createUserProfile = function (userId) {
    re.users.insert({
      userId: userId,
      boosterPoints: 15
    })

    addStartingCollection(re, userId)
  }

  re.getUserProfile = function (userId) {
    const dbUser = re.users.findOne({ userId: userId })

    if (!dbUser) {
      throw new Error('User not found')
    }

    return {
      userId: dbUser.userId,
      boosterPoints: dbUser.boosterPoints
    }
  }

  re.getCardsTxt = function (userId) {
    const accOb = re.getCards(userId)
      .map(entry => entry.card)
      .sort()
      .reduce((sum, next) => {
        if (next in sum) {
          sum[next] += 1
        } else {
          sum[next] = 1
        }
        return sum
      }
      , {})

    const lines = []
    for (const line in accOb) {
      lines.push(`${accOb[line]} ${line}`)
    }
    return lines.join('\n')
  }

  re.addBoosterPointsToAll = async function (count) {
    re.users.find().forEach(async function (u) {
      u.boosterPoints += count
      re.users.update(u)
      await saveDb(re.db)
    })
  }

  function saveDb (db) {
    return new Promise((resolve, reject) =>
      db.saveDatabase(function (err) {
        if (err) {
          console.error(err)
          reject(err)
        } else {
          resolve()
        }
      }
      ))
  };

  async function addStartingCollection (re, userId) {
    const numLands = 50
    const baseLands = ['Plains', 'Island', 'Swamp', 'Mountain', 'Forest']

    let cards = []
    for (const l of baseLands) {
      cards = cards.concat(Array(numLands).fill(l))
    }
    await re.add_cards(userId, cards)
  }

  function initCollection (db, colName) {
    let re = db.getCollection(colName)
    if (!re) {
      console.log('INIT ' + colName)
      re = db.addCollection(colName)
    }
    return re
  }

  return re
}

function loadDbPromise (db) {
  return new Promise(resolve => {
    db.loadDatabase({}, function (err) {
      if (err) {
        console.error('db loading error : ' + err)
      } else {
        console.log('database loaded')
        resolve()
      }
    })
  })
}
