const moment = require('moment');

const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

const tools = {

  log: function(str) {
    var verbose = bru.getEnvVar('testLogVerbose')
    if (verbose == 'true') {
      let now = moment().format('YYYY-MM-DDTHH:mm:ss.SSS');
      console.log(now + ' ' + str);
    }
  },

  // Set the token to the Authorization header as a Bearer token
  setBearerAuth: function(tokenKey = 'mapperToken') {
    req.setHeader('Authorization', 'Bearer ' + bru.getVar(tokenKey));
    tools.log("set Bearer Token to Authheader");
  },

   // Set the token to the Authorization header as a Basic token
   setBasicAuth: function(tokenKey = 'mapperToken') {
    req.setHeader('Authorization', 'Basic ' + bru.getVar(tokenKey));
    tools.log("set Basic Token to Authheader");
  },
  
  // Generates a random sequence of numbers for the 'jti' portion of the JWT (Used in Remote Access and SWS Auth flows)
  randSeq: function(n) {
    let result = '';
    for (let i = 0; i < n; i++) {
        result += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    return result;
  },

  // Checks if the Tenant ID is valid (Used in Remote Access and SWS Auth flows)
  checkTenant: function(tenantId) {
    const regex = /^([a-z0-9]{32})$/;
    if (!regex.test(tenantId.toLowerCase())) {
        console.error(`Invalid Tenant ID provided: ${tenantId}`);
        throw error;
    }
    return 'Valid Tenant Id';
  },

    // Checks if the region is valid and returns the corresponding audience (Used in Remote Access and SWS Auth flows)
    checkRegion: function(region) {
      const audurl = {
          'us': 'https://auth.alero.io/auth/realms/serviceaccounts',
          'eu': 'https://auth.alero.eu/auth/realms/serviceaccounts',
          'canada': 'https://auth.ca.alero.io/auth/realms/serviceaccounts',
          'australia': 'https://auth.au.alero.io/auth/realms/serviceaccounts',
          'london': 'https://auth.uk.alero.io/auth/realms/serviceaccounts',
          'india': 'https://auth.in.alero.io/auth/realms/serviceaccounts',
          'singapore': 'https://auth.sg.alero.io/auth/realms/serviceaccounts'
      };
      const audience = audurl[region.toLowerCase()];
      if (!audience) {
        console.error(`Invalid region provided: ${region}. Valid regions are: US, EU, Canada, Australia, London, India, and Singapore`);
        throw error;
      }
      return audience;
    },

    // Checks if the JWT is expired (Used in Remote Access and SWS Auth flow)
    isJwtExpired: function(token) {
      if (typeof(token) !== 'string' || !token || !token.includes(".")) {
        console.error('Invalid token provided'); 
        throw error;
      }
  
      const payload = new Buffer(token.split('.')[1], 'base64').toString('ascii');
      const {exp} = JSON.parse(payload);
  
      const currentTime = new Date().getTime() / 1000;
      if (currentTime > exp) {
        tools.log('The JWT is expired')
        return true;
      }
      return false;
    },
}

module.exports = tools;