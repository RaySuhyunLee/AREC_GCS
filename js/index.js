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

// angularjs setting
var panelAppScope = null;
function initAngular() {
  var panelApp = angular.module('panelApp', []);

  panelApp.controller('panelController', ($scope) => {
    panelAppScope = $scope;
    $scope.data = satData;
    $scope.values = packetList;
  });
}

// packet set for satellite data visualization 
var packetList;
$.getJSON("packet.json", (json) => {
  packetList = json;

  initSerial();
  initAngular();
  initChart();
});

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
    satData = PacketParser.parse(buf);
    lastUpdate = new Date();
    console.log("recv> " + satData);
    if (panelAppScope) {
      panelAppScope.data = satData;
      panelAppScope.$apply();
    }

    charts.forEach((chart, i) => {
      var newData = satData[chartPacketIndexs[i]];
      var chartData = chart.data.datasets[0].data;
      if (chartData.length > 10) {
        chartData.shift();
        chart.data.labels.shift();
      }
      chartData.push(newData);
      chart.data.labels.push(lastUpdate.getUTCMilliseconds());
      chart.update();
    });
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

const chartIds = [
  "#battery-voltage-chart",
  "#solar-voltage-chart",
  "#current-dissapation-chart",
  "#solar-current-chart",
  "#radioactive-chart-1min",
  "#radioactive-chart-10min",
];

// index of packet which chart refers to
const chartPacketIndexs = [15, 14, 13, 12, 11, 10];

var charts = []

function initChart() {
  chartIds.forEach((chartId, idx) => {
    charts.push(new Chart($(chartId), {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
            data: [],
            borderWidth: 1
        }]
      },
      options: {
        title: {
          display: true,
          text: packetList[chartPacketIndexs[idx]].name
        },
        legend: {
          display: false
        }
      }
    }));
  });
}
