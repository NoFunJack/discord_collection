import allcards from '../data/all-cards.json' // assert {type: 'json'}

export const getScryFallBuilder = () => new Boosterbuilder(allcards)

export class Boosterbuilder {

  private allcards: any

  constructor(cardData: any){
    this.allcards = cardData
  }

  getSetBooster(setId: string) {
    const sig: any = { common: 0, uncommon: 0, rare: 0, mythic: 0 }
    sig.add = function (type: string, num: number) {
      this[type] += num
    }
    sig.addWeighted = function (spec: any) {
      let sum = 0; const r = Math.random()
      for (const s of spec) {
        sum += s.weight
        if (r <= sum) {
          s.change(this)
          return
        }
      }
    }

    // Connected
    sig.addWeighted([
      {
        weight: 0.35,
        change: () => {
          sig.add('common', 5)
          sig.add('uncommon', 1)
        }
      },
      {
        weight: 0.40,
        change: () => {
          sig.add('common', 4)
          sig.add('uncommon', 2)
        }
      },
      {
        weight: 0.125,
        change: () => {
          sig.add('common', 3)
          sig.add('uncommon', 3)
        }
      },
      {
        weight: 0.07,
        change: () => {
          sig.add('common', 2)
          sig.add('uncommon', 4)
        }
      },
      {
        weight: 0.035,
        change: () => {
          sig.add('common', 1)
          sig.add('uncommon', 5)
        }
      },
      {
        weight: 0.02,
        change: () => {
          sig.add('uncommon', 6)
        }
      }
    ])

    // Fireworks - Head Turning
    sig.addWeighted([
      {
        weight: 0.75,
        change: () => sig.add('common', 1)
      },
      {
        weight: 0.25,
        change: () => sig.add('uncommon', 1)
      }
    ])

    // Fireworks Wildcards
    sig.addWeighted([
      {
        weight: 0.49,
        change: () => sig.add('common', 2)
      },
      {
        weight: 0.245,
        change: () => {
          sig.add('common', 1)
          sig.add('uncommon', 1)
        }
      },
      {
        weight: 0.151375,
        change: () => {
          sig.add('common', 1)
          sig.add('rare', 1)
        }
      },
      {
        weight: 0.023625,
        change: () => {
          sig.add('common', 1)
          sig.add('mythic', 1)
        }
      },
      {
        weight: 0.0031,
        change: () => sig.add('uncommon', 2)
      },
      {
        weight: 0.037195,
        change: () => {
          sig.add('uncommon', 1)
          sig.add('rare', 1)
        }
      },
      {
        weight: 0.005805,
        change: () => {
          sig.add('uncommon', 1)
          sig.add('mythic', 1)
        }
      },
      {
        weight: 0.0119716,
        change: () => sig.add('rare', 2)
      },
      {
        weight: 0.0002916,
        change: () => sig.add('mythic', 2)
      },
      {
        weight: 0.0040237344,
        change: () => {
          sig.add('rare', 1)
          sig.add('mythic', 1)
        }
      }
    ])
    // Rare slot
    sig.addWeighted([
      {
        weight: 0.865,
        change: () => sig.add('rare', 1)
      },
      {
        weight: 0.135,
        change: () => sig.add('mythic', 1)
      }
    ])
    // Foil slot
    sig.addWeighted([
      {
        weight: 0.714,
        change: () => sig.add('common', 1)
      },
      {
        weight: 0.214,
        change: () => sig.add('uncommon', 1)
      },
      {
        weight: 0.062,
        change: () => sig.add('rare', 1)
      },
      {
        weight: 0.01,
        change: () => sig.add('mythic', 1)
      }
    ])

    const booster = []
    const setCards = this.allcards.filter((c: any) => c.set === setId)

    for (const r of ['common', 'uncommon', 'rare', 'mythic']) {
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
