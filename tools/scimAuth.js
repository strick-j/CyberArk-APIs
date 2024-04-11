const axios = require('axios');
const moment = require('moment');

const scimAuth = {

  log: function(str) {
    var verbose = bru.getEnvVar('testLogVerbose')
    if (verbose == 'true') {
      let now = moment().format('YYYY-MM-DDTHH:mm:ss.SSS');
      console.log(now + ' ' + str);
    }
  },

  setAuth: function(scimBearerTokenKey = 'mapperToken') {
    req.setHeader('Authorization', 'Bearer ' + bru.getVar(scimBearerTokenKey));
    this.log("set Token to Authheader");
  },

  login: async function(identityTenantIdKey = 'identityTenantId', scimApplicationIdKey= 'scimApplicationId', scimScopeKey = 'scimScope', scimClientIdKey = 'scimClientId', scimClientSecretKey = 'scimClientSecret', scimBearerTokenKey = 'scimBearerToken') {

    let now = moment();
    let collectionVarnameForExpiryTime = 'tokenExpiry_ForToken_' + scimBearerTokenKey + '_FromURL_tokenUrl';
    let expiryTime = !!bru.getVar(collectionVarnameForExpiryTime) ? moment(bru.getVar(collectionVarnameForExpiryTime)) : now;
    let difference = expiryTime.diff(now, 'milliseconds');
    this.log('Token expires in milliseconds: ' + difference);

    let tokenUrl = 'https://' + bru.getEnvVar(identityTenantIdKey) + '.id.cyberark.cloud/oauth2/token/' + bru.getEnvVar(scimApplicationIdKey);
    let scimClientId = bru.getEnvVar(scimClientIdKey);
    let scimClientSecret = bru.getEnvVar(scimClientSecretKey);
    let scimScope = bru.getEnvVar(scimScopeKey);

    // if expiring within 10 seconds
    if (difference < 10000 || !bru.getVar(collectionVarnameForExpiryTime) || !bru.getVar('activeToken') || bru.getVar('activeToken') != (scimClientId + '_' + tokenUrl) ) {
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
            "client_id": scimClientId,
            "client_secret": scimClientSecret,
            "scope": scimScope
          }
        });
        bru.setVar(scimBearerTokenKey, resp.data.access_token);
        bru.setVar(collectionVarnameForExpiryTime, moment().add(resp.data.expires_in, 'seconds').format());
        bru.setVar('activeToken', scimClientId + '_' + tokenUrl);
        this.log('new token set.');

      } catch (error) {
        this.log('login error: ' + error.message);
        console.error(error);
        throw error;
      }
    }
    this.setAuth(scimBearerTokenKey);
  }
}

module.exports = scimAuth;