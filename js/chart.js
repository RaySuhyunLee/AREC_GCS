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
