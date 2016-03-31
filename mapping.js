/**
 * Map template values to variables.
 */

/**
 * Map template values.
 */
var mapping = {
  group: {
    min: 60,
    max: 67
  },

  trackArm: {
    min: 12,
    max: 19
  },

  trackRecord: {
    min: 20,
    max: 27
  },

  nav: {
    left: 52,
    right: 53,
    erase: 51,
    start: 54,
    rec: 55,
    restart: 56,
    setClipLength: 57,
    prevProject: 76,
    nextProject: 77
  },

  secondary: {
    min: 68,
    max: 75,
    pageUp: 81,
    pageDown: 82
  },

  knobs: {
    main: [16, 17, 18, 19, 20, 21, 22, 23],
    master: 24,
    tempo: 25,
    swing: 26
  },

  modes: {
    track: 78,
    macro: 79
  },

  tapTempo: 80,

  clipLength: {
    min: 84,
    max: 87,
    triggers: {
      8: 84,
      16: 85,
      32: 86,
      64: 87
    },
    values: {
      84: 8,
      85: 16,
      86: 32,
      87: 64
    }
  },
  
  /**
   * VPots send data based on acceleration, so convert to linear CC.
   */
  convertVPot: function(value) {
    var converted = value;
    // Positive values are low integers.
    if (value < 30) {
      converted = value;
    }
    // Negative values are above sixty.
    else {
      converted = -(value - 64);
    }
    return converted;
  },

  convertRelative: function(value) {
    return value - 64;
  }
};


