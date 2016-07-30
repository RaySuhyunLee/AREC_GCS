const Chart = require('./node_modules/chart.js/dist/Chart.bundle.min.js');
const SerialPort = require('serialport');
const PacketParser = require('./parser.js');

// init freewall
var wall = new Freewall("#panel-container");
wall.reset({
  fixSize: true,
  draggable: true,
  cellW: 400,
  cellH: "auto",
  onResize: function() {
    this.fitWidth();
  }
});
wall.fitWidth();

// serial port communication
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
    var satData = PacketParser.parse(buf);
    var lastUpdate = new Date();
    console.log("recv> " + data);

  });
});

function sendCommand(command, callback) {
  port.write(command, () => {
    console.log("send> " + command);
    // TODO write log
    if (callback) callback();
  });
}

// draw charts

var chartData = [12, 19, 3, 5, 2, 3];

const chartIds = [
  "#battery-voltage-chart",
  "#solar-voltage-chart",
  "#current-dissapation-chart",
  "#solar-current-chart",
  "#radioactive-chart"
];

charts = []

chartIds.forEach((chartId) => {
  charts.push(new Chart($(chartId), {
    type: 'line',
    data: {
      labels: ["", "", "", "", "", ""],
      datasets: [{
          data: chartData,
          borderWidth: 1
      }]
    },
    options: {
      legend: {
        display: false
      }
    }
  }));
});
