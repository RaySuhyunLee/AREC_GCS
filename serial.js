const SerialPort = require('serialport');
const PacketParser = require('./parser.js');

var port = null;

$('#port-sync-button').on('click', (v) => {
  SerialPort.list((err, ports) => {
    $('#port-selector').empty();
    ports.forEach((port) => {
      $('#port-selector').append("<option>" + port.comName + "</option>");
    });
  });
});

$('#connect-button').on('click', (v) => {
  var portName = $('#port-selector').val();
  var baudRate = parseInt($('#baudrate-selector').val());
  port = new SerialPort(portName, {
    parser: SerialPort.parsers.readline('c'),
    baudRate: baudRate,
  }, (err) => {
    if (err) {
      console.log("Error: " + err.message);
    }

    console.log('open serial');
    
  });
  
  port.on('data', function (buf) {
    console.log(buf);
    var data = PacketParser.parse(buf);
    console.log(data);
  });
});

function sendCommand(command, callback) {
  port.write(command, () => {
    console.log("send> " + command);
    // TODO write log
    if (callback) callback();
  });
}
