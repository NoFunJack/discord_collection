import should from 'should'
import fs from 'fs'
import path from 'path'

import { initDb, Collection } from '../modules/colmgr.js'

describe('Collection Manager', function () {
  const STARTING_BOOSTER_POINTS = 15

  let db: Collection;
  const filename = path.join('data', 'unit_test.db')
  beforeEach(async function () {
    db = await initDb(filename)
  })

  afterEach(async function () {
    await db.delete()
  })

  before(function () {
    if (fs.existsSync(filename)) {
      fs.rmSync(filename)
      console.log('removed ' + filename)
    }
  })

  it('add single card', async function () {
    db.getCards('user123').should.be.empty()

    await db.add_cards('user123', ['Lord of Mock'])

    const cards = db.getCards('user123')
    cards.should.be.size(1)
    cards[0].owner.should.be.equal('user123')
    cards[0].card.should.be.equal('Lord of Mock')
  })

  it('add multiple cards', async function () {
    db.getCards('user123').should.be.empty()

    await db.add_cards('user123', ['Lord of Mock', 'Mockering'])

    const cards = db.getCards('user123')
    cards.should.be.size(2)
    cards[0].owner.should.be.equal('user123')
    cards[0].card.should.be.equal('Lord of Mock')
    cards[1].card.should.be.equal('Mockering')
  })

  it('throw error when user not found', function () {
    should.throws(() => db.getUserProfile('user123'), 'User not found')
  })

  it('New user should have starting collection', function () {
    db.createUserProfile('user123')
    const up = db.getUserProfile('user123')
    up.should.not.be.null
    up.boosterPoints.should.be.equal(STARTING_BOOSTER_POINTS)
    const startCol = db.getCards(up.userId)
    startCol.should.not.be.empty()
  })

  it('creates user readable list of collection', async function () {
    await db.add_cards('user123', ['foo', 'bar', 'bernd', 'foo'])
    db.getCardsTxt('user123').should.be.equal(
      '1 bar\n1 bernd\n2 foo'
    )
  })

  it('add Booster cards', async function () {
    db.createUserProfile('user123')
    await db.tryAddBoosterCards('user123', ['the one mock'])
    db.getCards('user123').map(c => c.card).should.containEql('the one mock')
    const up = db.getUserProfile('user123')
    up.boosterPoints.should.be.equal(STARTING_BOOSTER_POINTS - 1)
  })

  it('add booster cards with no booster points', async function () {
    db.createUserProfile('user123')
    for (let i = 1; i < STARTING_BOOSTER_POINTS; i++) {
      // use up all booster points
      await db.tryAddBoosterCards('user123', ['the one mock'])
      const up = db.getUserProfile('user123')
      up.boosterPoints.should.be.equal(STARTING_BOOSTER_POINTS - i)
    }

    db.tryAddBoosterCards('user123', ['the one mock']).should.finally.throw('no booster points')
  })

  it('add boosterpoints to all players', async function () {
    db.createUserProfile('user1')
    db.createUserProfile('user2')
    await db.addBoosterPointsToAll(2)
    db.getUserProfile('user1').boosterPoints.should.be.equal(STARTING_BOOSTER_POINTS + 2)
    db.getUserProfile('user2').boosterPoints.should.be.equal(STARTING_BOOSTER_POINTS + 2)
  })
})
