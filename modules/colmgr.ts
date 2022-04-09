import loki from 'lokijs'
import fs from 'fs-extra'

export class Collection {
  db: loki
  cards: globalThis.Collection<any>
  users: globalThis.Collection<any>

  constructor(db: loki){
    this.db = db;
    this.cards = this.initCollection('cards')
    this.users = this.initCollection('users')
  }

  getCards(user: string) {
    return this.cards.find({ owner: user })
  }

  async tryAddBoosterCards(userId: string, cards: string[]) {
    const user = this.users.findOne({ userId: userId })
    if (user.boosterPoints > 0) {
      this.add_cards(userId, cards)
      user.boosterPoints -= 1
      this.users.update(user)
      await this.saveDb()
      return true;
    } else {
      return false;
    }
  }

  async add_cards(user: string, cards: string[]) {
    for (const c of cards) {
      this.cards.insert({
        owner: user,
        card: c
      })
    }
    await this.saveDb()
  }

  delete() {
    return new Promise<void>((resolve,reject) => {
      this.db.deleteDatabase(function (err) {
        if (err) {
          console.error(err)
          reject(err)
        } else {
          console.log('deleted database')
          resolve()
        }
      })
    })
  }

  createUserProfile(userId: string) {
    this.users.insert({
      userId: userId,
      boosterPoints: 15
    })
  }

  getUserProfile(userId: string) {
    const dbUser = this.users.findOne({ userId: userId })

    if (!dbUser) {
      throw new Error('User not found')
    }

    return {
      userId: dbUser.userId,
      boosterPoints: dbUser.boosterPoints
    }
  }

  getCardsTxt(userId: string) {
    const accOb = this.getCards(userId)
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

  async addBoosterPointsToAll(count: number) {
    this.users.find().forEach(async u =>  {
      u.boosterPoints += count
      this.users.update(u)
      await this.saveDb()
    })
  }
  private initCollection (colName: string) {
    let re = this.db.getCollection(colName)
    if (!re) {
      console.log('INIT ' + colName)
      re = this.db.addCollection(colName)
    }
    return re
  }

  private saveDb() {
    return new Promise<void>((resolve, reject) =>
      this.db.saveDatabase(function (err) {
        if (err) {
          console.error(err)
          reject(err)
        } else {
          resolve()
        }
      }
      ))
  };
}

export async function initDb (dbFile: string) {
  fs.ensureFileSync(dbFile)
  const db = new loki(dbFile, { verbose: true })
  await loadDbPromise(db)
  return new Collection(db)
}

function loadDbPromise (db: loki) {
  return new Promise((resolve, reject) => {
    db.loadDatabase({}, function (err) {
      if (err) {
        console.error('db loading error : ' + err)
        reject(err)
      } else {
        console.log('database loaded')
        resolve(db)
      }
    })
  })
}
