import fs from 'fs'
import path from 'path'

import { initDb, Collection } from '../colmgr'

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

  afterAll(function () {
    if (fs.existsSync(filename)) {
      fs.rmSync(filename)
      console.log('removed ' + filename)
    }
  })

  it('add single card', async function () {
    expect(db.getCards('user123')).toHaveLength(0)

    await db.add_cards('user123', ['Lord of Mock'])

    const cards = db.getCards('user123')
    expect(cards).toHaveLength(1)
    expect(cards[0].owner).toBe('user123')
    expect(cards[0].card).toBe('Lord of Mock')
  })

  it('add multiple cards', async function () {
    expect(db.getCards('user123')).toHaveLength(0)

    await db.add_cards('user123', ['Lord of Mock', 'Mockering'])

    const cards = db.getCards('user123')
    expect(cards).toHaveLength(2)
    expect(cards[0].owner).toBe('user123')
    expect(cards[0].card).toBe('Lord of Mock')
    expect(cards[1].owner).toBe('user123')
    expect(cards[1].card).toBe('Mockering')
  })

  it('throw error when user not found', function () {
    expect(() => db.getUserProfile('user123')).toThrow('User not found')
  })

  it('New user should not have starting collection only boosterpoints', function () {
    db.createUserProfile('user123')
    const up = db.getUserProfile('user123')
    expect(up).not.toBeNull()
    expect(up.boosterPoints).toBe(STARTING_BOOSTER_POINTS)
    const startCol = db.getCards(up.userId)
    expect(startCol).toHaveLength(0)
  })

  it('creates user readable list of collection', async function () {
    await db.add_cards('user123', ['foo', 'bar', 'bernd', 'foo'])
    expect(db.getCardsTxt('user123')).toBe(
      '1 bar\n1 bernd\n2 foo'
    )
  })

  it('add Booster cards', async function () {
    db.createUserProfile('user123')
    await db.tryAddBoosterCards('user123', ['the one mock'])
    expect(db.getCards('user123').map(c => c.card)).toContainEqual('the one mock')
    const up = db.getUserProfile('user123')
    expect(up.boosterPoints).toBe(STARTING_BOOSTER_POINTS - 1)
  })

  it('add booster cards with no booster points', async function () {
    db.createUserProfile('user123')
    for (let i = 0; i < STARTING_BOOSTER_POINTS; i++) {
      // use up all booster points
      await db.tryAddBoosterCards('user123', ['the one mock'])
      const up = db.getUserProfile('user123')
      expect(up.boosterPoints).toBe(STARTING_BOOSTER_POINTS - i - 1)
    }
    const up = db.getUserProfile('user123')
    expect(up.boosterPoints).toBe(0)
    expect(db.tryAddBoosterCards('user123', ['the one mock'])).resolves.toBeFalsy()
  })

  it('add boosterpoints to all players', async function () {
    db.createUserProfile('user1')
    db.createUserProfile('user2')
    await db.addBoosterPointsToAll(2)
    expect(db.getUserProfile('user1').boosterPoints).toBe(STARTING_BOOSTER_POINTS + 2)
    expect(db.getUserProfile('user2').boosterPoints).toBe(STARTING_BOOSTER_POINTS + 2)
  })
})
