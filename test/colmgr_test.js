var should = require('should');
var fs = require('fs');
var path = require('path')

var {init_db} = require('./../colmgr')

describe('Collection Manager', function () {
  var db;
  let filename = path.join(__dirname, "unit_test.db");
  beforeEach(async function() {
    db = await init_db(filename);
  });

  afterEach(async function() {
    return await db.delete();
  });

  before(function() {
    let p = path.resolve(filename);
    if (fs.existsSync(filename)) {
      fs.rmSync(filename);
      console.log("removed "+ filename);
    }
  });

  it('add single card', function() {

    db.getCards("user123").should.be.empty();

    db.add_cards("user123", ["Lord of Mock"]);

    var cards = db.getCards("user123");
    cards.should.be.size(1);
    cards[0].owner.should.be.equal("user123");
    cards[0].card.should.be.equal("Lord of Mock");
  });

  it('add multiple cards', function() {

    db.getCards("user123").should.be.empty();

    db.add_cards("user123", ["Lord of Mock","Mockering"]);

    var cards = db.getCards("user123");
    cards.should.be.size(2);
    cards[0].owner.should.be.equal("user123");
    cards[0].card.should.be.equal("Lord of Mock");
    cards[1].card.should.be.equal("Mockering");
  });


  it('throw error when user not found', function () {
    should.throws(() => db.getUserProfile("user123"),"User not found");
  });

  it('New user should have starting collection', function () {
    db.createUserProfile("user123");
    let up = db.getUserProfile("user123");
    up.should.not.be.null;
    up.boosterPoints.should.be.equal(10);
    let startCol = db.getCards(up.userId);
    startCol.should.not.be.empty();
  });

});
