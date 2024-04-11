const axios = require('axios');
const moment = require('moment');

const tools = {

  log: function(str) {
    let now = moment().format('YYYY-MM-DDTHH:mm:ss.SSS');
    console.log(now + ' ' + str);
  }
  
}

module.exports = tools;