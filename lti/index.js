'use strict';

const lti = require('ims-lti');
const https = require('https');

const dotenv = require("dotenv")
dotenv.config()

// LTI shared secret
const secrets = {
  [process.env.LTI_CONSUMER_KEY]: process.env.LTI_CONSUMER_SHARED_SECRET
};

const getSecret = (consumerKey, callback) => {
  const secret = secrets[consumerKey];
  if (secret) {
    return callback(null, secret);
  }

  let err = new Error(`Unknown consumer ${consumerKey}`);
  err.status = 403;

  return callback(err);
};

// Testing
const getUniversitiesOptions = {
  hostname: 'localhost',
  rejectUnauthorized: false,
  method: 'GET',
  path: '/api/universities',
};

// Testing
const getTestSignInOptions = {
  hostname: 'localhost',
  rejectUnauthorized: false,
  method: 'GET',
  path: '/api/account/testsignin',
};

// Testing
const createAccountOptions = {
  hostname: 'localhost',
  rejectUnauthorized: false,
  method: 'POST'
};

const getLTISignInOptions = {
  hostname: process.env.NODE_ENV == "production" ? "ct-dev.ncsa.illinois.edu" : 'localhost',
  rejectUnauthorized: process.env.NODE_ENV == "production" ? true : false,
  method: 'POST',
  path: '/api/account/ltisignin',
};

// Handle ClassTranscribe WebAPI request
async function webAPIRequest(requestOptions) {
  return new Promise((resolve, reject) => {
    const request = https.request(requestOptions);
    request.on('response', response => {

      var body = '';
      console.log(response.statusCode);
      response.on('data', chunk => {
        // console.log(chunk.toString());
        body += chunk;
      });

      response.on('end', function () {
        // console.log(body);
        resolve(body);
      });

      response.on('error', error => {
        console.error(error);
        reject(error);
      });
    });
    request.on('error', error => {
      console.error(error);
      reject(error);
    });
    request.end();
  });
}

exports.handleLaunch = (req, res, next) => {
  if (!req.query.videosrc) {
    let err = new Error('Expected video source');
    err.status = 400;
    return next(err);
  }

  if (!req.body) {
    let err = new Error('Expected a body');
    err.status = 400;
    return next(err);
  }

  const consumerKey = req.body.oauth_consumer_key;
  if (!consumerKey) {
    let err = new Error('Expected a consumer');
    err.status = 422;
    return next(err);
  }

  getSecret(consumerKey, (err, consumerSecret) => {
    if (err) {
      return next(err);
    }

    // const provider = new lti.Provider(consumerKey, consumerSecret, nonceStore, lti.HMAC_SHA1);
    const provider = new lti.Provider(consumerKey, consumerSecret, lti.HMAC_SHA1);

    provider.valid_request(req, (err, isValid) => {
      if (err) {
        return next(err);
      }
      if (isValid) {
        console.log(provider);

        const userImage = provider.body.user_image;
        const fullName = provider.body.lis_person_name_full;
        const lastName = provider.body.lis_person_name_family;
        const firstName = provider.body.lis_person_name_given;
        const email = provider.body.lis_person_contact_email_primary;
        const netId = provider.body.custom_canvas_user_login_id;
        const isInstructor = provider.instructor === true;
        const course = provider.context_label;
        const resourceTitle = provider.body.resource_link_title;
        const instanceName = provider.body.tool_consumer_instance_name;

        // Test sign in with test account
        // const authResponse = await webAPIRequest(getTestSignInOptions).catch(err => { console.log(err) });          
        // console.log(authResponse);
        // const authToken = JSON.parse(authResponse).authToken
        // console.log(`JWT token: ${authToken}`)
        // createAccountOptions.headers = { 'Authorization': `Bearer ${authToken}` };
        // createAccountOptions.path = `/api/account/createuser?emailId=${email}`;

        console.log(lastName);

        // LTI sign in
        getLTISignInOptions.path += `?sharedsecret=${process.env.LTI_SHARED_SECRET}&email=${email}&first=${firstName}&last=${lastName}`;

        // webAPIRequest(createAccountOptions).then((response) => { // use with test sign in
        webAPIRequest(getLTISignInOptions).then((response) => { // use with lti sign in
          console.log(response);
          // console.log(JSON.parse(response).authToken);
          // res.cookie('Authorization', `Bearer ${JSON.parse(response).authToken}`, { httpOnly: true, secure: true, maxAge: 3600000 });
          // res.header('Authorization', `Bearer ${JSON.parse(response).authToken}`);
          res.writeHead(301, {
            // Location: `https://classtranscribe.github.io/?videosrc=${req.query.videosrc}`
            Location: req.query.videosrc
            // Location: 'https://ct-dev.ncsa.illinois.edu/api/Playlists/4455cd84-db6e-4b61-befc-f2d44f4d286e'
          });
          res.write("LTI test");
          res.end();
        }).catch(err => { console.log(err) });

      } else {
        return next(err);
      }
    });
  });
};
