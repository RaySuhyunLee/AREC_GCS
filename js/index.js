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
var panelApp = angular.module('panelApp', []);
var panelAppScope = null;
panelApp.controller('panelController', ($scope) => {
  panelAppScope = $scope;
  $scope.values = values;
});

// value set for satellite data visualization 
var values = [
{
  name: "10분 평균 방사능",
  index: 10,
  unit: "msv/h"
},
{
  name: "1분 평균 방사능",
  index: 11,
  unit: "msv/h"
},
{
  name: "위도",
  index: 7,
  unit: "°"
},
{
  name: "경도",
  index: 8,
  unit: "°"
},
{
  name: "고도",
  index: 6,
  unit: "m"
},
{
  name: "Roll",
  index: 4,
  unit: "°"
},
{
  name: "Pitch",
  index: 3,
  unit: "°"
},
{
  name: "Yaw",
  index: 2,
  unit: "°"
},
{
  name: "배터리 보유 전압",
  index: 15,
  unit: "V"
},
{
  name: "태양전지 발전 전압",
  index: 14,
  unit: "V"
},
{
  name: "기기 소모 전류",
  index: 13,
  unit: "A"
},
{
  name: "태양 전지 발전 전류",
  index: 12,
  unit: "A"
}
];

// serial port communication
var port = null;
var satData = [];
var lastUpdate = null;

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
