'use strict';

const bodyParser = require('body-parser');
const express = require('express');
const lti = require('./lti');

const port = process.env.PORT || 4000;

const app = express();

// app.set('view engine', 'pug');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));

app.set('json spaces', 2);

app.enable('trust proxy');

app.get('/', (req, res, next) => {
  return res.send({status: 'Up'});
});

app.post('/launch_lti', lti.handleLaunch);

app.listen(port, () => console.log(`LTI app listening on port ${port}!`));
