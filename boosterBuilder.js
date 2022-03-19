
let allcards = require('./data/all-cards.json');


module.exports.getSetBooster = function(setId){
  let sig = {common: 0, uncommon: 0, rare: 0, mythic: 0}
  sig.add = function(type, num){
    this[type] += num;
  }
  sig.addWeighted = function(spec){
    var  sum=0, r=Math.random();
    for (s of spec) {
      sum += s.weight;
      if (r <= sum) {
        s.change(this);
        return;
      }
    }
  }

  // Connected
  sig.addWeighted([
    {
      weight: 0.35,
      change: s => {
        sig.add('common',5);
        sig.add('uncommon',1);
      }
    },
    {
      weight: 0.40,
      change: s => {
        sig.add('common',4);
        sig.add('uncommon',2);
      }
    },
    {
      weight: 0.125,
      change: s => {
        sig.add('common',3);
        sig.add('uncommon',3);
      }
    },
    {
      weight: 0.07,
      change: s => {
        sig.add('common',2);
        sig.add('uncommon',4);
      }
    },
    {
      weight: 0.035,
      change: s => {
        sig.add('common',1);
        sig.add('uncommon',5);
      }
    },
    {
      weight: 0.02,
      change: s => {
        sig.add('uncommon',6);
      }
    },
  ]);

  // Fireworks - Head Turning
  sig.addWeighted([
    {
      weight: 0.75,
      change: s => sig.add('common', 1),
    },
    {
      weight: 0.25,
      change: s => sig.add('uncommon', 1),
    },
  ]);

  // Fireworks Wildcards
  sig.addWeighted([
    {
      weight: 0.49,
      change: s => sig.add('common',2),
    },
    {
      weight: 0.245,
      change: s => {
        sig.add('common',1);
        sig.add('uncommon',1);
      }
    },
    {
      weight: 0.151375,
      change: s => {
        sig.add('common',1);
        sig.add('rare',1);
      }
    },
    {
      weight: 0.023625,
      change: s => {
        sig.add('common',1);
        sig.add('mythic',1);
      }
    },
    {
      weight: 0.0031,
      change: s => sig.add('uncommon',2),
    },
    {
      weight: 0.037195,
      change: s => {
        sig.add('uncommon',1);
        sig.add('rare',1);
      }
    },
    {
      weight: 0.005805,
      change: s => {
        sig.add('uncommon',1);
        sig.add('mythic',1);
      }
    },
    {
      weight: 0.0119716,
      change: s => sig.add('rare',2),
    },
    {
      weight: 0.0002916,
      change: s => sig.add('mythic',2),
    },
    {
      weight: 0.0040237344,
      change: s => {
        sig.add('rare',1);
        sig.add('mythic',1);
      }
    },
  ]);
  // Rare slot
  sig.addWeighted([
    {
      weight: 0.865,
      change: s => sig.add('rare',1),
    },
    {
      weight: 0.135,
      change: s => sig.add('mythic',1),
    },
  ]);
  // Foil slot
  sig.addWeighted([
    {
      weight: 0.714,
      change: s => sig.add('common',1),
    },
    {
      weight: 0.214,
      change: s => sig.add('uncommon',1),
    },
    {
      weight: 0.062,
      change: s => sig.add('rare',1),
    },
    {
      weight: 0.01,
      change: s => sig.add('mythic',1),
    },
  ]);

  let booster = [];
  let setCards = allcards.filter(c => c.set == setId);

  for (r of ['common','uncommon','rare','mythic']){
    let rarityCards = setCards.filter(c => c.rarity == r);
    for(let i = 0;i<sig[r];i++){
      booster.push(getRandomFromList(rarityCards));
    }
  }

  return booster;
}

module.exports.setExists = function(setId){
  return allcards.filter(c => c.set == setId).length > 0;
}

function getCardList(){
  return allcards
    .filter(c => c.set == 'neo')
    .filter(c => c.rarity == 'mythic')
}

function getRandomFromList(array ){
  return array[Math.floor(Math.random() * array.length)];
}