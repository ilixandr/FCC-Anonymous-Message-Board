const mongodb = require('mongodb');
const mongoclient = mongodb.MongoClient;
const ObjectId = mongodb.ObjectID;
const CONNECTION_STRING = process.env.DB;

function HandleThread() {

  this.threadList = (req, res) => {
    let board = req.params.board;
    mongoclient.connect(CONNECTION_STRING, {useNewUrlParser: true}, (err,client) => {
      let db = client.db("test");
      let collection = db.collection(board);
      collection.find(
        {},
        {
          reported: 0,
          delete_password: 0,
          "replies.delete_password": 0,
          "replies.reported": 0
        })
      .sort({bumped_on: -1})
      .limit(10)
      .toArray((err,doc) => {
        doc.forEach((document) => {
          document.replycount = document.replies.length;
          if(document.replies.length > 3) {
            document.replies = document.replies.slice(-3);
          }
        });
        res.json(doc);
      });
    });
  };
  
  this.newThread = (req, res) => {
    let board = req.params.board;
    let thread = {
      text: req.body.text,
      created_on: new Date(),
      bumped_on: new Date(),
      reported: false,
      delete_password: req.body.delete_password,
      replies: []
    };
    mongoclient.connect(CONNECTION_STRING, {useNewUrlParser: true}, (err,client) => {
      let db = client.db("test");
      let collection = db.collection(board);
      collection.insert(thread, () => {
        res.redirect('/b/'+board+'/');
      });
    });
  };
  
  //reported_id name
  this.reportThread = (req, res) => {
    let board = req.params.board;
    mongoclient.connect(CONNECTION_STRING, {useNewUrlParser: true}, (err,client) => {
      let db = client.db("test");
      let collection = db.collection(board);
      collection.findAndModify(
        {_id: new ObjectId(req.body.report_id)},
        [],
        {$set: {reported: true}}
        //(err, doc) => {}
      );
    });
    res.send('reported');
  };
  
  //check doc return to return right res
  this.deleteThread = (req, res) => {
    let board = req.params.board;
    mongoclient.connect(CONNECTION_STRING, {useNewUrlParser: true}, (err,client) => {
      let db = client.db("test");
      let collection = db.collection(board);
      collection.findAndModify(
        {
          _id: new ObjectId(req.body.thread_id),
          delete_password: req.body.delete_password
        },
        [],
        {},
        {remove: true, new: false},
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

module.exports = HandleThread;