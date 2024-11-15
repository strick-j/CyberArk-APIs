const axios = require('axios');
const moment = require('moment');
const tools = require('./tools');

const epmAuth = {

  login: async function(dispatcherKey = 'epmDispatcher', unameKey = 'epmUserName', pwordKey = 'epmUserPassword', tokenKey = 'epmToken') {

    let now = moment();
    let collectionVarnameForExpiryTime = 'tokenExpiry_ForToken_EpmToken';
    let expiryTime = !!bru.getVar(collectionVarnameForExpiryTime) ? moment(bru.getVar(collectionVarnameForExpiryTime)) : now;
    let difference = expiryTime.diff(now, 'milliseconds');
    tools.log('EPM Token expires in milliseconds: ' + difference);

    let tokenUrl = 'https://' + bru.getEnvVar(dispatcherKey) + '.epm.cyberark.com/EPM/API/Auth/EPM/Logon';
    let uname = bru.getEnvVar(unameKey);
    let pword = bru.getEnvVar(pwordKey);

    // if expiring within 10 seconds
    if (difference < 10000 || !bru.getVar(collectionVarnameForExpiryTime) || !bru.getVar('activeEpmToken') || bru.getVar('activeEpmToken') != (uname + '_' + tokenUrl) ) {
      tools.log('Old token belongs to different environment or old token expired, requesting new one...');
      try {

        let resp = await axios({
          method: 'POST',
          url: tokenUrl,
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
          },
          data: {
            "username": uname,
            "password": pword,
            "ApplicationId": "Bruno"
          }
        });
        bru.setVar(tokenKey, resp.data.EPMAuthenticationResult);
        bru.setVar(collectionVarnameForExpiryTime, moment().add(900, 'seconds').format());
        bru.setVar('activeEpmToken', uname + '_' + tokenUrl);
        tools.log('new EPM token set.');

      } catch (error) {
        tools.log('login error: ' + error.message);
        console.error(error);
        throw error;
      }
    }
    tools.setBasicAuth(tokenKey);
  }
}

module.exports = epmAuth;