var assert = require('assert');
var should = require('should');

var {init_db} = require('./../colmgr')

describe('Collection Manager', function () {
  var db;
  beforeEach(async function() {
    db = await init_db('unit_test.db');
  });

  afterEach(async function() {
    await db.delete();
  });

  it('add single card', function() {

    db.get_cards("user123").should.be.empty();

    db.add_cards("user123", ["Lord of Mock"]);

    var cards = db.get_cards("user123");
    cards.should.be.size(1);
    cards[0].owner.should.be.equal("user123");
    cards[0].card.should.be.equal("Lord of Mock");
  });

  it('add multiple cards', function() {

    db.get_cards("user123").should.be.empty();

    db.add_cards("user123", ["Lord of Mock","Mockering"]);

    var cards = db.get_cards("user123");
    cards.should.be.size(2);
    cards[0].owner.should.be.equal("user123");
    cards[0].card.should.be.equal("Lord of Mock");
    cards[1].card.should.be.equal("Mockering");
  });

  describe('new user creation', function () {

    it('should have starting collection', function () {
      assert.fail("todo");
    });

    it('should have starting booster points', function () {
      assert.fail("todo");
    });
  });
});
