var assert = require('assert');

var sinon = require('sinon')

var net = require("net")
var Mitm = require("mitm")
var mitm = Mitm()

var Graphite = require('../index');

describe('Graphite', function () {
  describe('write', function () {

    var metrics = {
      'pre1' : {
        'pre2' : {
          'key1' : 'value1',
          'key2' : 'value2',
        },
      },
      'key3' : 'value3'};
  
    var metricsLines = 'pre1.pre2.key1 value1 1234567890\npre1.pre2.key2 value2 1234567890\nkey3 value3 1234567890\n';

    it('should send object as lines to server', function (done) {

      var mock = {};
      mock.write = function(data) {
        assert.equal(data, metricsLines, 'object to lines mapping is broken');
        done();
      }

      var graphite = new Graphite();
      graphite.socket = mock;
  
      graphite.write(metrics, 1234567890000);
    });

    it('should add time if not provided', function (done) {

      var mock = {};
      var metricsLinesWithTimeZero = 'pre1.pre2.key1 value1 0\npre1.pre2.key2 value2 0\nkey3 value3 0\n';
      mock.write = function(data) {
        var pattern = new RegExp('1234567890', "g");
        assert.equal(data, metricsLines.replace(pattern, '0'), 'object to lines mapping is broken');
        clock.restore();
        done();
      }

      var graphite = new Graphite();
      graphite.socket = mock;
  
      var clock = sinon.useFakeTimers();
      graphite.write(metrics);
    });

    it('should throw error if callback was not provided', function () {
  
      var graphite = new Graphite();

      assert.throws(
        function() {
          graphite.write(metrics);
        },
        Error
      );
    });

    it('should not throw error if callback was provideds', function () {
  
      var graphite = new Graphite();

      assert.doesNotThrow(
        function() {
          graphite.write(metrics, 1, function() {});
        }
      );
    });
  })

  describe('connect', function () {
    it('should connect to the server and call the callback method', function (done) {
      mitm.on("connection", function(socket) { socket.write('connect')  });
    
      var graphite = new Graphite('someHostAddress', 2003, 'UTF-8', 1, null);
      graphite.connect(function() {
        graphite.end();
        done();
      });
    });

    it('should call the timeout callback on timeout', function (done) {
  
      mitm.on("connection", function(socket) { socket.write('connect')  });

      var done_called = false;

      var graphite = new Graphite('someHostAddress', 2003, 'UTF-8', 1, function() {
        graphite.end();
        if (!done_called) {
          done();
          done_called = true;
        }
      });
      graphite.connect(null);
    });

    it('should connect if timeout is not provided', function (done) {
  
      mitm.on("connection", function(socket) {
        if (!done_called) {
          done();
          done_called = true;
        }  
      });

      var done_called = false;
      var graphite = new Graphite('someHostAddress', 2003, 'UTF-8');
      graphite.connect(null);
    });
  })

  describe('on(error)', function () {
    it('before connect() should call the error callback', function (done) {
      var graphite = new Graphite('someHostAddress', 2003, 'UTF-8', 1000000);

      graphite.on('error', function() {
        graphite.end();
        done();
      });
      graphite.connect(null);
      graphite.end();
      graphite.write('sdfsd');
    
    });

    it('after connect() should call the error callback', function (done) {
      var graphite = new Graphite('someHostAddress', 2003, 'UTF-8', 1000000);

      graphite.connect(null);

      graphite.on('error', function() {
        graphite.end();
        done();
      });
      
      graphite.end();
      graphite.write('sdfsd');
    
    });
  });

})