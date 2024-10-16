const axios = require('axios');
const moment = require('moment');

const conjurTokenAuth = {

  log: function(str) {
    var verbose = bru.getEnvVar('testLogVerbose')
    if (verbose == 'true') {
      let now = moment().format('YYYY-MM-DDTHH:mm:ss.SSS');
      console.log(now + ' ' + str);
    }
  },

  // Sets the Conjur Token to the Authorization Header (Authorization: Token token="...")
  setAuth: function(tokenKeyConjur = 'mapperToken') {
    req.setHeader('Authorization', 'Token token="' + bru.getVar(tokenKeyConjur) + '"');
    this.log("set Conjur Token to Authheader");
  },

  // Updates Platform Token if expired or not set
  login: async function(identityTenantIdKey = 'identityTenantId', clientIdKey = 'platformTokenClientId', secretKey = 'platformTokenClientSecret', tokenKey = 'platformTokenBearerToken') {

    let now = moment();
    let collectionVarnameForExpiryTime = 'tokenExpiry_ForToken_PlatformToken';
    let expiryTime = !!bru.getVar(collectionVarnameForExpiryTime) ? moment(bru.getVar(collectionVarnameForExpiryTime)) : now;
    let difference = expiryTime.diff(now, 'milliseconds');
    this.log('Platform Token expires in milliseconds: ' + difference);

    let tokenUrl = 'https://' + bru.getEnvVar(identityTenantIdKey) + '.id.cyberark.cloud/oauth2/platformtoken';
    let clientId = bru.getEnvVar(clientIdKey);
    let clientSecret = bru.getEnvVar(secretKey);

    // if expiring within 10 seconds
    if (difference < 10000 || !bru.getVar(collectionVarnameForExpiryTime) || !bru.getVar('activePlatformToken') || bru.getVar('activePlatformToken') != (clientId + '_' + tokenUrl) ) {
      this.log('Platform token belongs to different environment or platform token expired, requesting new one...');
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
  },

  // Updates Conjur Token if expired or not set
  conjurLogin: async function(identityTenantName = 'identityTenantName', clientIdKey = 'platformTokenClientId', tokenKey = 'platformTokenBearerToken', tokenKeyConjur = 'conjurTokenBearerToken') {

    let now = moment();
    let collectionVarnameForExpiryTimeConjur = 'tokenExpiry_ForToken_ConjurToken';
    let expiryTime = !!bru.getVar(collectionVarnameForExpiryTimeConjur) ? moment(bru.getVar(collectionVarnameForExpiryTimeConjur)) : now;
    let difference = expiryTime.diff(now, 'milliseconds');
    this.log('Conjur Token expires in milliseconds: ' + difference);

    let tokenUrlConjur = 'https://' + bru.getEnvVar(identityTenantName) + '.secretsmgr.cyberark.cloud/api/authn-oidc/cyberark/conjur/authenticate';
    let clientId = bru.getEnvVar(clientIdKey);

    // Check to see if platform token is set, expired, etc...
    this.log('Checking platformToken...')
    await this.login();
    let platformToken = bru.getVar(tokenKey);
    
    // if Conjur Token is expiring within 10 seconds request new token
    if (difference < 10000 || !bru.getVar(collectionVarnameForExpiryTimeConjur) || !bru.getVar('activeConjurToken') || bru.getVar('activeConjurToken') != (clientId + '_' + tokenUrlConjur) ) {
      this.log('Conjur token belongs to different environment or Conjr token expired, requesting new one...');
    
      try {

        let resp = await axios({
          method: 'POST',
          url: tokenUrlConjur,
          headers: {
            "Accept-Encoding": "base64",
            "Content-Type": "application/x-www-form-urlencoded"
          },
          data: {
            "id_token": platformToken,
          }
        });
        bru.setVar(tokenKeyConjur, resp.data);
        bru.setVar(collectionVarnameForExpiryTimeConjur, moment().add(3600, 'seconds').format());
        bru.setVar('activeConjurToken', clientId + '_' + tokenUrlConjur);
        this.log('Conjur token set.');

      } catch (error) {
        this.log('login error: ' + error.message);
        console.error(error);
        throw error;
      }
    }
    this.setAuth(tokenKeyConjur); 
  }
}

module.exports = conjurTokenAuth;