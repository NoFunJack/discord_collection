var loki = require('lokijs')
const fs = require('fs-extra')

exports.init_db = async function(db_file){
  re = {}
  fs.ensureFileSync(db_file, err => {
    if(err){
      console.log(err)
    }
  });
  re.db = new loki(db_file,{verbose: true});
  await load_db_promise(re.db);


  re.cards = init_collection(re.db,'cards');
  re.users = init_collection(re.db,'users');

  re.getCards = function(user){
    return this.cards.find({owner: user});
  }

  re.tryAddBoosterCards = async function(userId,cards){
    let user = re.users.findOne({userId: userId});
    if(user.boosterPoints>0){
      re.add_cards(userId,cards);
      user.boosterPoints -= 1;
      re.users.update(user);
      await saveDb(this.db);
    } else {
      throw new Error("no booster points")
    }
  }

  re.add_cards = async function(user,cards){
    for (c of cards){
      this.cards.insert({
        owner: user,
        card: c
      })
    }
    await saveDb(this.db);
  }

  re.delete = function() {
    return new Promise((resolve) =>{

      this.db.deleteDatabase(function(err){
        if(err){
          console.error(err);
          throw new Error(err);
        } else {
          console.log("deleted database");
          resolve();
        }
      })
    });
  }

  re.createUserProfile = function(userId){
    re.users.insert({
      userId: userId,
      boosterPoints: 15
    });

    addStartingCollection(re,userId);
  }

  re.getUserProfile = function(userId){
    dbUser =  re.users.findOne({userId: userId})

    if(!dbUser){
      throw new Error("User not found")
  }

    return {
      userId: dbUser.userId,
      boosterPoints: dbUser.boosterPoints,
    }
  }

  re.getCardsTxt = function(userId){
    let accOb =  re.getCards(userId)
             .map(entry => entry.card)
             .sort()
             .reduce((sum,next)=> {
               if (next in sum){
                 sum[next] += 1;
               } else {
                 sum[next] = 1;
               }
               return sum;
             }
            , {});

      lines = [];
      for(line in accOb){
        lines.push(`${accOb[line]} ${line}`)
      }
      return lines.join("\n")
  }

  re.addBoosterPointsToAll = async function(count){
    re.users.find().forEach(async function(u) {
        u.boosterPoints += count;
        re.users.update(u);
        await saveDb(re.db);
      });
  }

  function saveDb(db){
    return new Promise((resolve,reject)=>
      db.saveDatabase(function(err){
        if(err){
          console.error(err);
          reject();
        }else{
          resolve();
        }
      }
    ))};

  async function addStartingCollection(re,userId){
    let numLands = 50;
    let baseLands = ["Plains", "Island", "Swamp", "Mountain", "Forest"];

    cards = []
    for (l of baseLands){
      cards = cards.concat(Array(numLands).fill(l));
    }
    await re.add_cards(userId,cards);
  }

  function init_collection(db,col_name){
    let re = db.getCollection(col_name);
    if(!re){
      console.log("INIT " + col_name )
      re = db.addCollection(col_name);
    }
    return re;
  }

  return re;
}

function load_db_promise(db) {
  return new Promise(resolve => {
    db.loadDatabase({}, function(err) {
      if (err) {
        console.error("db loading error : " + err);
      }
      else {
        console.log("database loaded")
        resolve();
      }
    });

  });
}



