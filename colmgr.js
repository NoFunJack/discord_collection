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

  re.add_cards = function(user,cards){
    for (c of cards){
      this.cards.insert({
        owner: user,
        card: c
      })
    }
    this.db.saveDatabase();
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
      boosterPoints: 10
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

  function addStartingCollection(re,userId){
    let numLands = 50;
    let baseLands = ["Plains", "Island", "Swamp", "Mountain", "Forest"];

    cards = []
    for (l of baseLands){
      cards = cards.concat(Array(numLands).fill(l));
    }
    re.add_cards(userId,cards);
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



