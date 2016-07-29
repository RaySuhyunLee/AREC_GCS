const SerialPort = require('serialport');

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
});
