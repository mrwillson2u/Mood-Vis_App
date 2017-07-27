
var noble = require('noble');
var firebase = require("firebase");
// var express = require('express');
// var app = require('express')();
// var Server = require('socket.io');
// var io = new Server(3000);
// var fs = require('fs');
var opn = require('opn');
var net = require('net');

var server = net.createServer();

var connection;
var express = require('express');
var path = require('path');
var app = express();

// Define the port to run on
app.set('port', 3000);

app.use(express.static(path.join(__dirname, 'public')));

// Listen for requests
var server = app.listen(app.get('port'), function() {
  var port = server.address().port;
  console.log('Magic happens on port ' + port);
});
opn('http://localhost:3000/');

// Initialize Firebase
// TODO: Replace with your project's customized code snippet
var config = {
  // apiKey: "<API_KEY>",
  // authDomain: "<PROJECT_ID>.firebaseapp.com",
  databaseURL: "https://moodmonitor-9970c.firebaseio.com/",
  // storageBucket: "gs://moodmonitor-9970c.appspot.com/",
};
firebase.initializeApp(config);

var moodRef = firebase.database().ref('/test');


noble.on('stateChange', function(state) {

  if (state === 'poweredOn') {
    noble.startScanning();
    console.log('Scanning...');
  }
  else {
    noble.stopScanning();
    console.log('Stopped scanning.');
  }
})



noble.on('discover', function(peripheral) {

  // If it is the right bluetooth device, lets connect to it
  if(peripheral.advertisement.localName === 'MoodSwTest') {
    console.log('Found device with local name: ' + peripheral.advertisement.localName)
    console.log('UUID: ' + peripheral.uuid);
    console.log('advertising the following service uuid\'s: ' + peripheral.advertisement.serviceUuids)
    console.log();



    peripheral.connect(function(error) {
      console.log('connected to peripheral: ' + peripheral.advertisement.localName);
      peripheral.discoverServices(null,function(error, services) {

        console.log('discovering the following services: ')

        for(var i in services) {
          console.log(' ' + i + ' uuid: ' + services[i].uuid);
          console.log('characteristics: ');

          services[i].discoverCharacteristics(['2221'], function(error ,characteristic) {

            var moodValueCharact = characteristic[0];
            moodRef.set('');
            moodValueCharact.on('read', function(data, isNotification) {
              var datetime = new Date();
              console.log('moodValue: ', data.toString());
              //io.emit('mood data', data.readUInt16LE(0));
              var timeStamp = datetime.getTime();

              moodRef.child(timeStamp).set(data.toString());
              if(connection) {
                connection.write(data);
                connection.write('\n');
              }
              // fs.appendFile('save_' + datetime.getMonth() + '-' + datetime.getDay() + '-' + datetime.getYear() + '_' + datetime.getHours() + ':' + datetime.getMinutes() + ':' + datetime.getSeconds() + '.txt', data.readUInt16LE(0) + ',' + datetime + '\n');
              // console.log(datetime.getMonth() + '-' + datetime.getDay() + '-' + datetime.getYear() + '_' + datetime.getHours() + ':' + datetime.getMinutes() + ':' + datetime.getSeconds());
            })

            moodValueCharact.notify(true, function() {
              console.log('mood notification on!');
            })

            // moodValueCharact.read(function(error, data) {
            //     if(error) {
            //       console.log('error: ' + error)
            //     }
            //     else {
            //       console.log(' uuid: ' + characteristic[0].uuid + ' with value: ' + data);
            //     }
            //   });
            });
          }
        });
    });
  }
});


server.on('connection', handleConnection);

server.listen(9000, function() {
  console.log('server listening to %j', server.address());
});

function handleConnection(conn) {
  var remoteAddress = conn.remoteAddress + ':' + conn.remotePort;
  console.log('new client connection from %s', remoteAddress);

  connection = conn;
  conn.on('data', onConnData);
  conn.once('close', onConnClose);
  conn.on('error', onConnError);

  function onConnData(d) {
    console.log('connection data from %s: %j', remoteAddress, d);
    //conn.write(d);
  }

  function onConnClose() {
    console.log('connection from %s closed', remoteAddress);
    connection = null;
  }

  function onConnError(err) {
    console.log('Connection %s error: %s', remoteAddress, err.message);
  }
}
