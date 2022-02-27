var assert = require('assert');
var should = require('should');

var {ColMgr} = require('./../colmgr')

describe('Collection Manager', function () {
  var db;
  before(function() {
    db = new ColMgr('unit_test.db');
  });

  after(function() {
    //db.delete();
  });

  describe.only('atomic actions', function() {
    it('add single card', function() {

      db.get_cards("user123").should.be.empty();

      //db.add_cards("user123", ["Lord of Mock"]);

      var cards = db.get_cards("user123");
      cards.should.be.size(1);
      cards[0].owner.should.be.equal("user123");
      cards[0].card.should.be.equal("Lord of Mock");

      assert.fail('todo');
    });
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
