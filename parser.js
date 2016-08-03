/* 
 * parser.js
 * parses packet from the vehicle 
 *
 */
var fs = require('fs');
var packetList = JSON.parse(fs.readFileSync('packet.json', 'utf8'));
var size = packetList.length;
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
  packetList.forEach((packet, i) => {
    if (packet.signed) {
      data[i] = parseSigned(buf[i]) / packet.divide;
    } else {
      data[i] = parseInt(buf[i]) / packet.divide;
    }
  });

  return data;
}
