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
  port = new SerialPort($('#port-selector').val(), {
    parser: SerialPort.parsers.readline('c')
  }, (err) => {
    if (err) {
      console.log("Error: " + err.message);
    }
  });

  port.on('data', (buf) => {
    var data = PacketParser.parse(buf);
  });
});

function sendCommand(command, callback) {
  port.write(command, () => {
    // TODO write log
    if (callback) callback();
  });
}
