var net = require('net');

module.exports = Graphite;

function Graphite(host, port, encoding, timeout, timeoutListener) {
  this.host = host;
  this.port = port;
  this.encoding = encoding;
  this.timeout = timeout;
  this.timeoutListener = timeoutListener;
  this.eventsCallbacks = [];
}

Graphite.prototype.connect = function(connectListener) {
  this.socket = net.connect({host: this.host, port: this.port}, connectListener);
  if (this.encoding) {
    this.socket.setEncoding(this.encoding);
  }
  
  if (this.timeout) {
    var self = this;
    this.socket.setTimeout(this.timeout, function(){

      self.timeoutListener();
      self.end();
      self.connect(connectListener);
    });
  }

  this.eventsCallbacks.forEach(function (eventCallback) {
    this.socket.on(eventCallback.event, eventCallback.callback);
  }, this);
}

Graphite.prototype.on = function(event, callback) {
  var eventCallback = {};
  eventCallback.event = event;
  eventCallback.callback = callback;
  this.eventsCallbacks.push(eventCallback);

  if (this.socket) {
    this.socket.on(event, callback);
  }
}

Graphite.prototype.end = function() {
  if (this.socket) {
    this.socket.end();
  }
};

Graphite.prototype.write = function(metrics, timestamp, callback) {
  timestamp = timestamp || Date.now();
  timestamp = Math.floor(timestamp / 1000);

  var flatt = this.flatten(metrics);
  var lines = '';
  for (var key in flatt) {
    var value = flatt[key];
    lines += [key, value, timestamp].join(' ') + '\n';
  }

  try {
    this.socket.write(lines);
  } catch (err) {
    if (callback) {
      callback(err);
    } else {
      throw err;
    }
  }
};

Graphite.prototype.flatten = function(obj, flat, prefix) {
  flat   = flat || {};
  prefix = prefix || '';

  for (var key in obj) {
    var value = obj[key];
    if (typeof value === 'object') {
      this.flatten(value, flat, prefix + key + '.');
    } else {
      flat[prefix + key] = value;
    }
  }

  return flat;
};