/**
 * Sending messages to the maschine.
 */

/**
 * Properties for messages like positions.
 */
var messages = {
  start: 'F0 00 00 66 17 12',
  end: 'F7',
  position: {
    lineTop: '00',
    lineBottom: '38',
    top: ['00', '07', '0E', '15', '1C', '23', '2A', '31'],
    bottom: ['38', '3F', '46', '4D', '54', '5B', '62', '69']
  },

  /**
   * Send a message to the maschine display.
   */
  writeMessage: function(text, position) {
    //println(text);
    sendSysex(this.start + position + messages.toHex(text) + messages.end);
  },

  writeSingle: function(text, position) {
    var message = (text == '' || text == 'none') ? '______' : text;
    this.writeMessage(messages.fixLength(message, 7), position);
  },

  /**
   * Fix the length of the message to a desired value.
   */
  fixLength: function(string, length) {
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
  },

  /**
   * Convert message to hex.
   */
  toHex: function(string) {
    var hex = '';
    for (var i = 0; i < string.length; i++) {
      hex += string.charCodeAt(i).toString(16);
    }
    return hex;
  },

  /**
   * Update the linear vpot with the amount.
   */
  sendVpotLinear: function(index, value) {
    // vpot display for linear starts at 48.
    var channel = 48 + index;
    sendChannelController(0, channel, value);
  }

};

