/**
 * Sending messages to the maschine.
 */

/**
 * Properties for messages like positions.
 */
var messages = {};
messages.start = 'F0 00 00 66 17 12';
messages.position = {};
messages.position.lineTop = '00';
messages.position.lineBottom = '38';
messages.position.top = [];
messages.position.top[0] = '00';
messages.position.top[1] = '07';
messages.position.top[2] = '0E';
messages.position.top[3] = '15';
messages.position.top[4] = '1C';
messages.position.top[5] = '23';
messages.position.top[6] = '2A';
messages.position.top[7] = '31';
messages.position.bottom = [];
messages.position.bottom[0] = '38';
messages.position.bottom[1] = '3F';
messages.position.bottom[2] = '46';
messages.position.bottom[3] = '4D';
messages.position.bottom[4] = '54';
messages.position.bottom[5] = '5B';
messages.position.bottom[6] = '62';
messages.position.bottom[7] = '69';
messages.end = 'F7';

/**
 * Send a message to the maschine display.
 */
messages.writeMessage = function(text, position) {
  //println(text);
  sendSysex(this.start + position + messages.toHex(text) + messages.end);
};

/**
 * Fix the length of the message to a desired value.
 */
messages.fixLength = function(string, length) {
  // If string is null return underscores.
  if (string == null) {
    string = '______'
  }

  // If string length is too long truncate it.
  if (string.length > length) {
    string = string.substr(0, length);
  }
  else {
    // Append spaces until the string is the desired length.
    var left = length - string.length;
    for (var i = 0; i < left; i++) {
      string += ' ';
    }
  }
  return string;
};

/**
 * Convert message to hex.
 */
messages.toHex = function(string) {
  var hex = '';
  for (var i = 0; i < string.length; i++) {
    hex += string.charCodeAt(i).toString(16);
  }
  return hex;
};

/**
 * Update the vpot with the amount.
 */
messages.sendVpotLinear = function(index, value) {
  // vpot display for linear starts at 48.
  var channel = 48 + index;
  sendChannelController(0, channel, value);
};
