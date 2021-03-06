import {Boosterbuilder, Rarity, CardData} from '../boosterBuilder'

const MOCK_SET='mc1'

class MockCard{
  public name= "mock card"
  public rarity: Rarity
  public set= MOCK_SET
  public type_line= "mock type"
  public scryfall_uri = "mock://uri"
  public prices = {
    eur: null
  }

  constructor(rarity: Rarity,typeLine?: string){
    this.rarity = rarity
    if(typeLine){
      this.type_line=typeLine
    }
  }

}


// mock collection
const boosterbuilder = new Boosterbuilder(
  [
    //new MockCard(Rarity.common,"Basic Land — Plains"),
    new MockCard(Rarity.common),
    new MockCard(Rarity.uncommon),
    new MockCard(Rarity.rare),
    new MockCard(Rarity.mythic),
    new MockCard(Rarity.common,"Basic Land — Plains"),
    new MockCard(Rarity.mythic,"Basic Land — Swamp"),
  ]
)

const boosters = []

for(let i=0;i<1000;i++){
  let c= boosterbuilder.getSetBooster(MOCK_SET)
  boosters.push([c])
}


describe.each(boosters)('SetBooster Properties of %j', function(cards){

  test('mock set should be used', function(){
    cards.forEach(c => expect(c.set).toBe(MOCK_SET))
  })

  it('should contain 11 cards',function(){
    expect(cards).toHaveLength(11)
  })

  it('should contain between 1 and 4 rare/mystic cards', function(){
    const len = cards.filter((c:any) => ['rare','mythic'].indexOf(c.rarity)> -1).length
    expect(len).toBeLessThanOrEqual(4)
    expect(len).toBeGreaterThanOrEqual(1)
  })

  it('should not contain basic lands', function() {
    cards.forEach(c => expect(c.type_line).not.toMatch(/^Basic Land.*/))
  })

})
