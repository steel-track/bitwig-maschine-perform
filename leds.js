/**
 * Maschine led related functionality.
 */

var leds = {};
leds.setAll = function(state) {
  for (var i = 0; i < 128; i++) {
    this.setSingle(i, state);
  }
};
leds.setGroup = function(groupMin, groupMax, state) {
  for (var i = groupMin; i <= groupMax; i++) {
    this.setSingle(i, state);
  }
};
leds.setSingle = function(note, state) {
  sendNoteOn('0', note, this.stateToMidi(state));
};
leds.stateToMidi = function(state) {
  var midi = '0';
  switch (state) {
    case 'off':
      midi = '0';
      break;
    case 'dim':
      midi = '10';
      break;
    case 'on':
      midi = '127';
      break;
    default:
      midi = '127';
  }
  return midi;
};
