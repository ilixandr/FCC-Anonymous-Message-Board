/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

const expect = require('chai').expect;

const HandleReply = require('../utils/handleReply.js');
const HandleThread = require('../utils/handleThread.js');

module.exports = (app) => {
  
  const handleReply = new HandleReply();
  const handleThread = new HandleThread();
  
  app.route('/api/threads/:board')
    .get(handleThread.threadList)
    .post(handleThread.newThread)
    .put(handleThread.reportThread)
    .delete(handleThread.deleteThread);
    
  app.route('/api/replies/:board')
    .get(handleReply.replyList)
    .post(handleReply.newReply)
    .put(handleReply.reportReply)
    .delete(handleReply.deleteReply);

};
