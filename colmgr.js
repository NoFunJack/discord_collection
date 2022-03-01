var loki = require('lokijs')
const fs = require('fs-extra')

exports.init_db = async function(db_file){
  re = {}
  fs.ensureFileSync(db_file, err => {
    if(err){
      console.log(err)
    }
  });
  re.db = new loki(db_file);
  await load_db_promise(re.db);


  re.cards = init_collection(re.db,'cards');

  re.get_cards = function(user){
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
    return new Promise((resolve, reject) =>{

      this.db.deleteDatabase(function(err){
        if(err){
          console.error(err);
          reject();
        } else {
          console.log("deleted database");
          resolve();
        }
      })
    });
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



