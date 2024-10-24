const jwt = require('jsonwebtoken');
const axios = require('axios');
const moment = require('moment');
const tools = require('./tools');

const swsAuth = {
  
  // Generates JWT using claims
  generateJWT: function(tenantId, audience) {
    let serviceAccountId = bru.getEnvVar('swsServiceAccountId')
    let privateKey = bru.getEnvVar('swsPrivateKey').toString('utf8');
    if (!serviceAccountId || !privateKey || !tenantId || !audience) {
        tools.log ('Required variables missing');
        throw new Error('Required variables missing');
    }

    const payload = {
        iss: `${tenantId}.${serviceAccountId}.ExternalServiceAccount`,
        sub: `${tenantId}.${serviceAccountId}.ExternalServiceAccount`,
        aud: audience,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 300, // 5 minutes expiration
        jti: tools.randSeq(20)
    };

    try {
      const token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });
      return token;
    }
    catch (error) {
      tools.log(`Error generating SWS JWT: ${error.message}`);
      throw new Error(`Error generating SWS JWT: ${error.message}`);
    }
  },

  // Main function
  loginJWT: async function(swsRegion = 'swsRegion', swsTenantId = 'swsTenantId', jwtKey = 'swsJWT') {
    tools.log('Validating Secure Web Sessions JWT...');
    let now = moment();
    let collectionVarnameForExpiryTimeJWT = 'tokenExpiry_ForToken_swsJWT';
    let expiryTimeJWT = !!bru.getVar(collectionVarnameForExpiryTimeJWT) ? moment(bru.getVar(collectionVarnameForExpiryTimeJWT)) : now;
    let differenceJWT = expiryTimeJWT.diff(now, 'milliseconds');
    tools.log('Secure Web Sessions Access JWT expires in milliseconds: ' + differenceJWT);

    let tenantId = bru.getEnvVar(swsTenantId);
    let region = bru.getEnvVar(swsRegion);

    // Verify tenantId and region are set
    if (!tenantId || !region) {
        console.error('Missing Tenant ID or Region. Set tenantId and region in environment variables.');
        throw new Error(`Missing Tenant ID or Region. Set tenantId and region in environment variables.`);
    }

    // if expiring within 10 seconds
    if (differenceJWT < 10000 || !bru.getVar(collectionVarnameForExpiryTimeJWT) || !bru.getVar('activeSwsJWT') || bru.getVar('activeSwsJWT') != (tenantId + '_' + region) ) {
      tools.log('Old Secure Web Sessions token belongs to different environment or old token expired, requesting new one...');
      try {
        tools.log(`Attempting to generate new SWS JWT using Tenant ID: ${tenantId} and Region: ${region}`);

        // Validate provided Region and Tenant ID
        const validTenant = tools.checkTenant(tenantId);
        tools.log('validTenant: ' + validTenant);
        const audience = tools.checkRegion(region);
        tools.log(`Valid region provided. Audience: ${audience}`);

        // Generate JWT
        const token = this.generateJWT(tenantId, audience);
        tools.log('SWS JWT generated successfully. Setting variables...');
        bru.setVar(jwtKey, token);
        bru.setVar(collectionVarnameForExpiryTimeJWT, moment().add(300, 'seconds').format());
        bru.setVar('activeSwsJWT', tenantId + '_' + region);
        tools.log('New SWS JWT generated and set.');
      } catch (error) {
        tools.log('login error: ' + error.message);
        console.error(error);
        throw error;
      }
    }   
  },

  login: async function(swsTenantId = 'swsTenantId', jwtKey = 'swsJWT', tokenKey = 'swsToken') {
    tools.log('Starting Secure Web Sessions Login Process...');
    // Similar to the generateJWT function, but for Secure Web Sessions login
    let now = moment();
    let collectionVarnameForExpiryTime = 'tokenExpiry_ForToken_swsAccessToken';
    let expiryTime = !!bru.getVar(collectionVarnameForExpiryTime) ? moment(bru.getVar(collectionVarnameForExpiryTime)) : now;
    let difference = expiryTime.diff(now, 'milliseconds');
    tools.log('Secure Web Sessions Token expires in milliseconds: ' + difference);

    // Get tenantId from environment variable
    let tenantId = bru.getEnvVar(swsTenantId);
    if (!tenantId) {
      console.error('Missing Tenant ID. Set Secure Web Sessions tenantId in environment variables.');
      console.error(error);
      throw error;
    }
    
    // Check to see if Secure Web Sessions jwt is set, valid, expired, etc...
    let jwt = bru.getVar(jwtKey)
    if (!jwt) {
      tools.log('No Secure Web Sessions JWT found. Generating new JWT...');
      await this.loginJWT();
    } else if (tools.isJwtExpired(jwt)) {
      tools.log('Secure Web Sessions JWT is expired. Generating new JWT')
      await this.loginJWT();
    }
    
    let swsJwt = bru.getVar(jwtKey);
    let tokenUrlSws = 'https://auth.alero.io/auth/realms/serviceaccounts/protocol/openid-connect/token';

    // if expiring within 10 seconds
    if (difference < 10000 || !bru.getVar(collectionVarnameForExpiryTime) || !bru.getVar('activeSwsToken') || bru.getVar('activeSwsToken') != (tenantId + '_' + tokenUrlSws) ) {
      tools.log('Old Secure Web Sessions Token belongs to different environment or old token expired, requesting new one...');
      try {
        let resp = await axios({
          method: 'POST',
          url: tokenUrlSws,
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded"
          },
          data: {
            "grant_type": "client_credentials",
            "client_assertion_type": encodeURI(`urn:ietf:params:oauth:client-assertion-type:jwt-bearer`),
            "client_assertion": encodeURIComponent(swsJwt),
          }
        });
        bru.setVar(tokenKey, resp.data.access_token);
        bru.setVar(collectionVarnameForExpiryTime, moment().add(resp.data.expires_in, 'seconds').format());
        bru.setVar('activeSwsToken', tenantId + '_' + tokenUrlSws);
        tools.log('New Secure Web Sessions Token set. Token expires in: ' + resp.data.expires_in + ' seconds');

      } catch (error) {
        tools.log('login error: ' + error.message);
        console.error(error);
        throw error;
      }
    }
    tools.setBearerAuth(tokenKey);  
  }
}

module.exports = swsAuth;