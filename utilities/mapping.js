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

  pads: {
    min: 12,
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
    nextProject: 78
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

  tapTempo: 80,

  displayModes: {
    track: 77,
    trackBank: 79,
    modules: 76
  },

  padModes: {
    mute: 84,
    solo: 85,
    select: 86,
    duplicate: 87,
    navigate: 88,
    keyboard: 89,
    pattern: 90,
    scene: 91
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


