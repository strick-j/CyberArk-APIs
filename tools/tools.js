const axios = require('axios');
const moment = require('moment');

const tools = {

  log: function(str) {
    var verbose = bru.getEnvVar('testLogVerbose')
    if (verbose == 'true') {
      let now = moment().format('YYYY-MM-DDTHH:mm:ss.SSS');
      console.log(now + ' ' + str);
    }
  }
  
}

module.exports = tools;