

let portList = [];

exports.syncPortList = function() {
  SerialPort.list((err, ports) => {
    portList = [];
    ports.forEach((port) => {
      portList.push(port.comName);
    });
  });
}

exports.getPortList = function() {
  return portList;
}
