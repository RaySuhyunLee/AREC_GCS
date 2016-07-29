/* 
 * parser.js
 * parses packet from the vehicle 
 *
 */
const size = 16;
const bits = 8;
var data = new Array(size);

function parseSigned(string) {
  var sign = (string[0] == '0' ? 1 : -1);
  return sign * parseInt(string.slice(1));
}

exports.parse = function(string) {
  var buf = [];
  for (var i=0; i<size; i++) {
    buf[i] = string.slice(i*bits, (i+1)*bits);
  }
  data[0] = parseSigned(buf[0]) / 100; // temperature
  data[1] = parseSigned(buf[1]) / 100; // humidity
  data[2] = parseSigned(buf[2]) / 100; // yaw
  data[3] = parseSigned(buf[3]) / 100; // pitch
  data[4] = parseSigned(buf[4]) / 100; // roll
  data[5] = parseSigned(buf[5]) / 100; // pressure
  data[6] = parseSigned(buf[6]) / 100; // altitude
  data[7] = parseInt(buf[7]) / 100000; // latitude
  data[8] = parseInt(buf[8]) / 100000; // longitude
  data[9] = parseInt(buf[9]); // time(second)
  data[10] = parseSigned(buf[10]) / 100; // radioactivity(10 min avg.)
  data[11] = parseSigned(buf[11]) / 100; // radioactivity(1 min avg.)
  data[12] = parseSigned(buf[12]) / 100; // solar panel current
  data[13] = parseSigned(buf[12]) / 100; // current dissipation
  data[14] = parseSigned(buf[13]) / 100; // solar panel voltage
  data[15] = parseSigned(buf[14]) / 100; // battery voltage

  return data;
}
