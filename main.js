const SerialPort = require('serialport');
const PacketParser = require('./parser.js');
var fs = require('fs');
var packetList = JSON.parse(fs.readFileSync('packet.json', 'utf8'));
var express = require('express');

initSerial();

// serial port communication
var port = null;
var satData = [];
var lastUpdate = null;

function initSatData() {
  satData = [];
  for(var i=0; i<packetList.length; i++)
    satData.push("-");
}

function initSerial() {
  initSatData();
}

function connect(port, baud, response) {
  var portName = port;
  var baudRate = baud;
  port = new SerialPort(portName, {
    parser: SerialPort.parsers.readline('c'),
    baudRate: baudRate,
  }, (err) => {
    if (err) {
      console.log("Error: " + err.message);
      response.end('Error: ' + err.message);
    }

    console.log('open serial');
    response.end('open serial');
  });
  
  port.on('data', function (buf) {
    satData = PacketParser.parse(buf);
    lastUpdate = new Date();
    console.log("recv> " + satData);
  });
}

function sendCommand(command, callback) {
  port.write(command, () => {
    console.log("send> " + command);
    // TODO write log
    if (callback) callback();
  });
}

initSerial();

var app = express();
app.listen(3000, () => {
  console.log('Server start');
});

app.use(express.static(__dirname));

app.get('/', (req, res) => {
  fs.readFile('index.html', (error, data) => {
    if (error) {
      console.log(error);
    } else {
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end(data);
    }
  });
});

app.get('/connect', (req, res) => {
  var portName = req.query.portname;
  var baudRate = req.query.baudrate;
  
  res.writeHead(200, {'Context-Type': 'text/plain'});
  connect(portName, parseInt(baudRate), res);
});

app.get('/port', (req, res) => {
  SerialPort.list((err, ports) => {
    res.writeHead(200, {'Context-Type': 'text/json'});
    res.end(JSON.stringify(ports));
  });
});

app.get('/sync', (req, res) => {
  var data = {
    satData: satData,
    lastUpdate: lastUpdate
  };
  res.writeHead(200, {'Context-Type': 'text/json'});
  res.end(JSON.stringify(data));
});
