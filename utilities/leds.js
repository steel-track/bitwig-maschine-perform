/**
 * Maschine led related functionality.
 */

var leds = {

  /**
   * Set all leds to a state.
   */
  setAll: function(state) {
    for (var i = 0; i < 128; i++) {
      this.setSingle(i, state);
    }
  },

  /**
   * Set a group of leds to a state between a min and max note value.
   */
  setGroup: function(groupMin, groupMax, state) {
    for (var i = groupMin; i <= groupMax; i++) {
      this.setSingle(i, state);
    }
  },

  /**
   * Set a single led to a state.
   */
  setSingle: function(note, state) {
    if (this.stateChange(note, state)) {
      this.state[note] = state;
      sendNoteOn('0', note, this.stateToMidi(state));
    }
  },

  /**
   * Convert a string to a velocity value for the leds.
   * @param state
   *   'on' or 'off'.
   */
  stateToMidi: function(state) {
    var midi = '0';
    switch (state) {
      case 'off':
        midi = '0';
        break;
      case 'on':
        midi = '127';
        break;
      default:
        midi = '127';
    }
    return midi;
  },

  /**
   * To prevent sending states we've already set, store them here temporarily.
   */
  stateChange: function(note, state) {
    return !(this.state[note] == state);
  },

  state: {}
};
