
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

var satData = null;
var packetList
$.getJSON('packet.json', (data) => {
  packetList = data;

  initAngular();
  initChart();
});;

// attach ui event listeners
$('#port-sync-button').on('click', (v) => {
  $.get('/port', { }, (data) => {
    $('#port-selector').empty();
    ports = JSON.parse(data);
    ports.forEach((port) => {
      $('#port-selector').append("<option>" + port.comName + "</option>");
    });
  });
});
$('#connect-button').on('click', (v) => {
  var portName = $('#port-selector').val();
  var baudRate = $('#baudrate-selector').val();
  $.get('/connect', {
      'portname': portName,
      'baudrate': baudRate 
    },
    (data) => {
      console.log(data);

      panelAppScope.startSync();
    }
  );
});

// angularjs setting
var panelAppScope = null;
function initAngular() {
  var panelApp = angular.module('panel', []);

  panelApp.controller('panelController', ($scope, $http, $timeout, $interval) => {
    panelAppScope = $scope;
    $scope.data = satData;
    $scope.values = packetList;

    $scope.sync = function() {
      $http.get('/sync')
        .success((res) => {
          $scope.data = res.satData;

          updateChart(res.satData, res.lastUpdate);
        }
      );
    }

    $scope.startSync = function() {
      $scope.syncSchedule = $interval($scope.sync, 100);
    }

    $scope.stopSync = function() {
      $interval.calcel($scope.syncSchedule);
    }
  });
}

function updateChart(satData, lastUpdate) {
  charts.forEach((chart, i) => {
    var newData = satData[chartPacketIndexs[i]];
    var chartData = chart.data.datasets[0].data;
    if (chartData.length > 100) {
      chartData.shift();
      chart.data.labels.shift();
    }
    chartData.push(newData);
    chart.data.labels.push(lastUpdate);
    chart.update(0, true);
  });
};

function sendCommand(command, callback) {
  port.write(command, () => {
    console.log("send> " + command);
    // TODO write log
    if (callback) callback();
  });
}

// draw charts

var chartIds = [
  "#battery-voltage-chart",
  "#solar-voltage-chart",
  "#current-dissapation-chart",
  "#solar-current-chart",
  "#radioactive-chart-1min",
  "#radioactive-chart-10min",
];

// index of packet which chart refers to
var chartPacketIndexs = [15, 14, 13, 12, 11, 10];

var charts = [];

function initChart() {
  chartIds.forEach((chartId, idx) => {
    charts.push(new Chart($(chartId), {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
            data: [],
            borderWidth: 1,
            pointRadius: 0
        }]
      },
      options: {
        title: {
          display: true,
          text: packetList[chartPacketIndexs[idx]].name
        },
        legend: {
          display: false
        },
        tooltips: {
          enabled: false
        },
        scales: {
          xAxes: [{
            display: false
          }]
        }
      }
    }));
  });
}
