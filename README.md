# graphite-client

Node.js client for Graphite      [![Build Status](https://travis-ci.org/Shimi/graphite-client.svg?branch=master)](https://travis-ci.org/Shimi/graphite-client) 

##Install
[![NPM](https://nodei.co/npm/graphite-client.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/graphite-client/)
```
$ npm install graphite-client
```

## Usage
###Create instance
```js
var Graphite = require('graphite-client');

var graphite = new Graphite(serverHost, 2003, 'UTF-8');
```
The client tries to reconnect on connection timeout

###Listen for the underline socket events
```js
graphite.on('end', function() {
  log.info('Graphite client disconnected');
});

graphite.on('error', function(error) {
  log.info('Graphite connection failure. ' + error);
});
```

###Connect to the graphite server
```js
graphite.connect(function() { //'connect' listener
  log.info('Connected to Graphite server');
});
```

###Write to the server
```js
var metrics = {
  'pre1' : {
    'pre2' : {
      'key1' : 'value1',
      'key2' : 'value2',
    },
  },
  'key3' : 'value3'
};
    
graphite.write(metrics, Date.now(), function(err) {
  log.warn("Failed to write metrics to metrics server. err: " + err)
});
```
Assuming the current time is Jul 13 2015 00:00:00 UTC (1436745600 in sec Unix Epoch Time) The folliwng data will be send to the server
```
pre1.pre2.key1 value1 1436745600
pre1.pre2.key2 value2 1436745600
key3 value3 1436745600
```
