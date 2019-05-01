const mongodb = require('mongodb');
const mongoclient = mongodb.MongoClient;
const ObjectId = mongodb.ObjectID;
const CONNECTION_STRING = process.env.DB;

function HandleReply() {
  
  this.replyList = (req, res) => {
    let board = req.params.board;
    mongoclient.connect(CONNECTION_STRING, {useNewUrlParser: true}, (err, client) => {
      let db = client.db("test");
      let collection = db.collection(board);
      collection.find({_id: new ObjectId(req.query.thread_id)},
      {
        reported: 0,
        delete_password: 0,
        "replies.delete_password": 0,
        "replies.reported": 0
      })
      .toArray((err,doc) => {
        res.json(doc[0]);
      });
    });
  };
  
  this.newReply = (req, res) => {
    let board = req.params.board;
    let reply = {
      _id: new ObjectId(),
      text: req.body.text,
      created_on: new Date(),
      reported: false,
      delete_password: req.body.delete_password,
    };
    mongoclient.connect(CONNECTION_STRING, {useNewUrlParser: true}, (err, client) => {
      let db = client.db("test");
      let collection = db.collection(board);
      collection.findAndModify(
        {_id: new ObjectId(req.body.thread_id)},
        [],
        {
          $set: {bumped_on: new Date()},
          $push: {replies: reply}
        }); //there was an empty function here
    });
    res.redirect('/b/'+board+'/'+req.body.thread_id);
  };
  
  this.reportReply = (req, res) => {
    let board = req.params.board;
    mongoclient.connect(CONNECTION_STRING, {useNewUrlParser: true}, (err, client) => {
      let db = client.db("test");
      let collection = db.collection(board);
      collection.findAndModify(
        {
          _id: new ObjectId(req.body.thread_id),
          "replies._id": new ObjectId(req.body.reply_id)
        },
        [],
        { $set: { "replies.$.reported": true } }
        //function(err, doc) {
        //}
      );
    });
    res.send('reported');
  };
  
  this.deleteReply = (req, res) => {
    let board = req.params.board;
    mongoclient.connect(CONNECTION_STRING, {useNewUrlParser: true}, (err, client) => {
      let db = client.db("test");
      let collection = db.collection(board);
      collection.findAndModify(
        {
          _id: new ObjectId(req.body.thread_id),
          replies: { $elemMatch: { _id: new ObjectId(req.body.reply_id), delete_password: req.body.delete_password } },
        },
        [],
        { $set: { "replies.$.text": "[deleted]" } },
        (err, doc) => {
          if (doc.value === null) {
            res.send('incorrect password');
          } else {
            res.send('success');
          }
        });
    });
  };
  
}

module.exports = HandleReply;