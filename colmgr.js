var loki = require('lokijs')
const fs = require('fs-extra')

function ColMgr(db_file){

  fs.ensureFile(db_file, err => {
    if(err){
      console.log(err)
    }
  });

  this.db = new loki(db_file);
  this.db.loadDatabase({}, function(err) {
  if (err) {
    console.log("db loading error : " + err);
  }
  else {
    console.log("database loaded.");
  }
  });

  this.cards = init_collection(this.db,'cards');

  this.get_cards = function(user){
    return this.cards.find({owner: user});
  }

  this.add_cards = function(user,cards){
    for (c of cards){
      this.cards.insert({
        owner: user,
        card: c
      })
    }
    this.db.saveDatabase();
  }

  this.delete = function() {
    this.db.deleteDatabase(function(err){
      if(err){
        console.error(err);
      } else {
        console.log("deleted database");
      }
    })
  }

  function init_collection(db,col_name){
    console.log(db.listCollections());
    let re = db.getCollection(col_name);
    console.log(re)
    if(!re){
      console.log("INIT " + col_name )
      re = db.addCollection(col_name);
    }
    return re;
  }
}


exports.ColMgr = ColMgr;
