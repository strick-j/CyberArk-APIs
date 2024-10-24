const jwt = require('jsonwebtoken');
const axios = require('axios');
const moment = require('moment');
const tools = require('./tools');

const remoteAccessAuth = {
  
  // Generates Remote Access JWT using claims
  generateJWT: function(tenantId, audience) {
    let serviceAccountId = bru.getEnvVar('remoteAccessServiceAccountId')
    let privateKey = bru.getEnvVar('remoteAccessPrivateKey').toString('utf8');
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
      tools.log(`Error generating Remote Access JWT: ${error.message}`);
      throw new Error(`Error generating Remote Access JWT: ${error.message}`);
    }
  },

  // Main function used to generate the Remote Access JWT that will be used in the intial login process
  loginJWT: async function(raRegion = 'remoteAccessRegion', raTenantId = 'remoteAccessTenantId', jwtKey = 'remoteAccessJWT') {
    tools.log('Validating Remote Access JWT...');
    let now = moment();
    let collectionVarnameForExpiryTime = 'tokenExpiry_ForToken_remoteAccessJWT';
    let expiryTime = !!bru.getVar(collectionVarnameForExpiryTime) ? moment(bru.getVar(collectionVarnameForExpiryTime)) : now;
    let difference = expiryTime.diff(now, 'milliseconds');
    tools.log('Remote Access JWT expires in milliseconds: ' + difference);

    let tenantId = bru.getEnvVar(raTenantId);
    let region = bru.getEnvVar(raRegion);

    // Verify tenantId and region are set
    if (!tenantId || !region) {
        console.error('Missing Tenant ID or Region. Set tenantId and region in environment variables.');
        throw new Error(`Missing Tenant ID or Region. Set tenantId and region in environment variables.`);
    }

    // if expiring within 10 seconds
    if (difference < 10000 || !bru.getVar(collectionVarnameForExpiryTime) || !bru.getVar('activeRemoteAccessJWT') || bru.getVar('activeRemoteAccessJWT') != (tenantId + '_' + region) ) {
      tools.log('Old token belongs to different environment or old token expired, requesting new one...');
      try {
        tools.log(`Attempting to generate JWT using Tenant ID: ${tenantId} and Region: ${region}`);

        // Validate provided Region and Tenant ID
        const validTenant = tools.checkTenant(tenantId);
        tools.log('validTenant: ' + validTenant);
        const audience = tools.checkRegion(region);
        tools.log(`Valid region provided. Audience: ${audience}`);

        // Generate JWT
        const token = this.generateJWT(tenantId, audience);
        tools.log('Remote Access JWT generated successfully. Setting variables...');
        bru.setVar(jwtKey, token);
        bru.setVar(collectionVarnameForExpiryTime, moment().add(300, 'seconds').format());
        bru.setVar('activeRemoteAccessJWT', tenantId + '_' + region);
        tools.log('New Remote Access JWT generated and set.');
      } catch (error) {
          tools.log('login error: ' + error.message);
          console.error(error);
          throw error;
        }
    }   
  },

  login: async function(raTenantId = 'remoteAccessTenantId', jwtKey = 'remoteAccessJWT', tokenKey = 'remoteAccessToken') {
    tools.log('Starting Remote Access Login Process...');
    // Similar to the generateJWT function, but for remote access login
    let now = moment();
    let collectionVarnameForExpiryTime = 'tokenExpiry_ForToken_remoteAccessToken';
    let expiryTime = !!bru.getVar(collectionVarnameForExpiryTime) ? moment(bru.getVar(collectionVarnameForExpiryTime)) : now;
    let difference = expiryTime.diff(now, 'milliseconds');
    tools.log('Remote Access Token expires in milliseconds: ' + difference);

    // Get tenantId from environment variable
    let tenantId = bru.getEnvVar(raTenantId);
    if (!tenantId) {
      console.error('Missing Tenant ID. Set tenantId in environment variables.');
      console.error(error);
      throw error;
    }
    
    // Check to see if jwt is set, valid, expired, etc...
    let jwt = bru.getVar(jwtKey)
    if (!jwt) {
      tools.log('No JWT found. Generating new JWT...');
      await this.loginJWT();
    } else if (tools.isJwtExpired(jwt)) {
      tools.log('Remote Access JWT is expired. Generating new JWT')
      await this.loginJWT();
    }

    let remoteAccessJWT = bru.getVar(jwtKey);
    let tokenUrlRemoteAccess = 'https://auth.alero.io/auth/realms/serviceaccounts/protocol/openid-connect/token';

    // if expiring within 10 seconds
    if (difference < 10000 || !bru.getVar(collectionVarnameForExpiryTime) || !bru.getVar('activeRemoteAccessToken') || bru.getVar('activeRemoteAccessToken') != (tenantId + '_' + tokenUrlRemoteAccess) ) {
      tools.log('Old Remote Access Token belongs to different environment or old token expired, requesting new one...');
      try {
        let resp = await axios({
          method: 'POST',
          url: tokenUrlRemoteAccess,
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded"
          },
          data: {
            "grant_type": "client_credentials",
            "client_assertion_type": encodeURI(`urn:ietf:params:oauth:client-assertion-type:jwt-bearer`),
            "client_assertion": encodeURIComponent(remoteAccessJWT),
          }
        });
        tools.log(resp.data.access_token);
        bru.setVar(tokenKey, resp.data.access_token);
        bru.setVar(collectionVarnameForExpiryTime, moment().add(resp.data.expires_in, 'seconds').format());
        bru.setVar('activeRemotAccessToken', tenantId + '_' + tokenUrlRemoteAccess);
        tools.log('new Remote Access Token set. Token expires in: ' + resp.data.expires_in + ' seconds');

      } catch (error) {
        tools.log('login error: ' + error.message);
        console.error(error);
        throw error;
      }
    }
    tools.setBearerAuth(tokenKey);  
  }
}

module.exports = remoteAccessAuth;