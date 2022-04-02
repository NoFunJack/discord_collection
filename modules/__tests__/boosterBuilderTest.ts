import {Boosterbuilder} from '../boosterBuilder'

const MOCK_SET='mc1'

class MockCard{
  public rarity: Rarity
  public set= MOCK_SET

  constructor(rarity: Rarity){
    this.rarity = rarity
  }

}

enum Rarity{
  common='common',
  uncommon='uncommon',
  rare='rare',
  mythic='mythic',
}

describe('SetBooster Properties', function(){


  let cards: any

  beforeAll(function() {
    // mock collection
    const boosterbuilder = new Boosterbuilder(
      [
        new MockCard( Rarity.common),
        new MockCard( Rarity.uncommon),
        new MockCard( Rarity.rare),
        new MockCard( Rarity.mythic),
      ]
    )

    cards = boosterbuilder.getSetBooster(MOCK_SET)
  });

  test('mock set should be used', function(){
    cards.forEach((c: MockCard) => expect(c.set).toBe(MOCK_SET))
  })

  it('should contain 11 cards',function(){
    expect(cards).toHaveLength(11)
  })

  it('should contain between 1 and 4 rare/mystic cards', function(){
    const len = cards.filter((c:any) => ['rare','mystic'].indexOf(c.rarity)> -1).length
    expect(len).toBeLessThanOrEqual(4)
    expect(len).toBeGreaterThanOrEqual(1)
  })

});
