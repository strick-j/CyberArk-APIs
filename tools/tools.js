const axios = require('axios');
const moment = require('moment');

const tools = {

  log: function(str) {
    let now = moment().format('YYYY-MM-DDTHH:mm:ss.SSS');
    console.log(now + ' ' + str);
  },

  setAuth: function(tokenKey = 'mapperToken') {
    req.setHeader('Authorization', 'Bearer ' + bru.getVar(tokenKey));
    this.log("set Token to Authheader");
  },

  login: async function(tokenUrlKey = 'tokenUrl', clientIdKey = 'clientId', clientSecretKey = 'clientSecret', tokenKey = 'token') {

    let now = moment();
    let collectionVarnameForExpiryTime = 'tokenExpiry_ForToken_' + tokenKey + '_FromURL_' + bru.getEnvVar(tokenUrlKey);
    let expiryTime = !!bru.getVar(collectionVarnameForExpiryTime) ? moment(bru.getVar(collectionVarnameForExpiryTime)) : now;
    let difference = expiryTime.diff(now, 'milliseconds');
    this.log('Token expires in milliseconds: ' + difference);

    let tokenUrl = bru.getEnvVar(tokenUrlKey);
    let clientId = bru.getEnvVar(clientIdKey);
    let clientSecret = bru.getEnvVar(clientSecretKey);

    // if expiring within 10 seconds
    if (difference < 10000 || !bru.getVar(collectionVarnameForExpiryTime) || !bru.getVar('activeToken') || bru.getVar('activeToken') != (clientId + '_' + tokenUrl) ) {
      this.log('Old token belongs to different environment or old token expired, requesting new one...');
      try {

        let resp = await axios({
          method: 'POST',
          url: tokenUrl,
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded"
          },
          data: {
            "grant_type": "client_credentials",
            "client_id": encodeURIComponent(clientId),
            "client_secret": encodeURIComponent(clientSecret)
          }
        });
        bru.setVar(tokenKey, resp.data.access_token);
        bru.setVar(collectionVarnameForExpiryTime, moment().add(resp.data.expires_in, 'seconds').format());
        bru.setVar('activeToken', clientId + '_' + tokenUrl);
        this.log('new token set.');

      } catch (error) {
        this.log('login error: ' + error.message);
        console.error(error);
        throw error;
      }
    }
    this.setAuth(tokenKey);
  }
}

module.exports = tools;