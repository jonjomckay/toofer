var dotenv = require('dotenv');
var express = require('express');
var proxy = require('./proxy');

dotenv.load();

var app = express();

app.use(express.static(process.cwd() + '/app'));
app.use(proxy(process.env.COREOS_FLEET_HOST, process.env.COREOS_FLEET_PORT));

app.listen(3000);