import allcards from '../all-cards.json' // assert {type: 'json'}
const cardData: CardData[] = allcards;
import boosterConfJson from './boosterBuilderConfig.json' // assert {type: 'json'}
const boosterConf: BoosterConfig = boosterConfJson

type BoosterConfig = {
  [key: string]: string[] | WeightedEntry[]
}

type WeightedEntry = {
  weight: number;
  cards: string[]
}

class Signature {
  common=0;
  uncommon=0;
  rare=0;
  mythic=0;

  public add(short: string) {
    switch(short) {
      case "C":
        this.common++
        break
      case "U":
        this.uncommon++
        break
      case "R":
        this.rare++
        break
      case "M":
        this.mythic++
        break
      default:
        throw `Unkown short type: ${short}`
    }
  }
}

export interface CardData {
  name: string;
  set: string;
  rarity: string;
  type_line: string;
  scryfall_uri: string;
  prices: PriceList;
}

export interface PriceList {
  eur: string | null;
}

function rollSignature(sig: Signature, boosterType: string){

  const conf = boosterConf[boosterType]
  const weighted: WeightedEntry[] = []

  if(!conf){
    throw `booster config error in entry: ${boosterType}`
  }

  for(const c of conf){
    if(typeof c === "string"){
      rollSignature(sig,c)
    }else {
      weighted.push(c)
    }
  }

  if(weighted){
    const norm = weighted
      .map(w => w.weight)
      .reduce((a,b) => a+b,0)

    let sum = 0; const r = Math.random()
    for (const w of weighted) {
      sum += w.weight/norm
      if (r <= sum) {
        w.cards.forEach(it => {
          if(it.length == 1){
            sig.add(it)
          } else {
            rollSignature(sig,it)
          }
        })
        return
      }
    }

  }

}

export const getScryFallBuilder = () => new Boosterbuilder(cardData)

export class Boosterbuilder {

  private allcards: CardData[]

  constructor(cardData: CardData[]){
    this.allcards = cardData
      .filter(c => !c.type_line.startsWith('Basic Land — '))
  }

  getSetBooster(setId: string): CardData[] {
    const sig = new Signature()
    rollSignature(sig,"setbooster")

    const booster = []
    const setCards = this.allcards.filter((c: any) => c.set === setId)

    for (const r of Object.values(Rarity)) {
      const rarityCards = setCards.filter((c: any) => c.rarity === r)
      for (let i = 0; i < sig[r]; i++) {
        booster.push(this.getRandomFromList(rarityCards))
      }
    }

    return booster
}

  setExists(setId: string) {
    return allcards.filter((c: any) => c.set === setId).length > 0
  }

  getRandomFromList (array: any[]) {
    return array[Math.floor(Math.random() * array.length)]
  }
}


export enum Rarity{
  common='common',
  uncommon='uncommon',
  rare='rare',
  mythic='mythic',
}
