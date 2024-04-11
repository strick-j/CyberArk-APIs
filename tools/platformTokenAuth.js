const axios = require('axios');
const moment = require('moment');

const platformTokenAuth = {

  log: function(str) {
    var verbose = bru.getEnvVar('testLogVerbose')
    if (verbose == 'true') {
      let now = moment().format('YYYY-MM-DDTHH:mm:ss.SSS');
      console.log(now + ' ' + str);
    }
  },

  setAuth: function(tokenKey = 'mapperToken') {
    req.setHeader('Authorization', 'Bearer ' + bru.getVar(tokenKey));
    this.log("set Token to Authheader");
  },

  login: async function(identityTenantIdKey = 'identityTenantId', clientIdKey = 'platformTokenClientId', secretKey = 'platformTokenClientSecret', tokenKey = 'platformTokenBearerToken') {

    let now = moment();
    let collectionVarnameForExpiryTime = 'tokenExpiry_ForToken_PlatformToken';
    let expiryTime = !!bru.getVar(collectionVarnameForExpiryTime) ? moment(bru.getVar(collectionVarnameForExpiryTime)) : now;
    let difference = expiryTime.diff(now, 'milliseconds');
    this.log('Token expires in milliseconds: ' + difference);

    let tokenUrl = 'https://' + bru.getEnvVar(identityTenantIdKey) + '.id.cyberark.cloud/oauth2/platformtoken';
    let clientId = bru.getEnvVar(clientIdKey);
    let clientSecret = bru.getEnvVar(secretKey);

    // if expiring within 10 seconds
    if (difference < 10000 || !bru.getVar(collectionVarnameForExpiryTime) || !bru.getVar('activePlatformToken') || bru.getVar('activePlatformToken') != (clientId + '_' + tokenUrl) ) {
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
            "client_id": clientId,
            "client_secret": clientSecret,
          }
        });
        bru.setVar(tokenKey, resp.data.access_token);
        bru.setVar(collectionVarnameForExpiryTime, moment().add(resp.data.expires_in, 'seconds').format());
        bru.setVar('activePlatformToken', clientId + '_' + tokenUrl);
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

module.exports = platformTokenAuth;