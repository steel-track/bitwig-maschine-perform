/**
 * Map template values to variables.
 */

/**
 * Map template values.
 */
var mapping = {};
mapping.group = {};
mapping.group.min = 60;
mapping.group.max = 67;
mapping.trackArm = {};
mapping.trackArm.min = 12;
mapping.trackArm.max = 19;
mapping.trackRecord = {};
mapping.trackRecord.min = 20;
mapping.trackRecord.max = 27;
mapping.nav = {};
mapping.nav.left = 52;
mapping.nav.right = 53;
mapping.nav.erase = 51;
mapping.nav.start = 54;
mapping.nav.rec = 55;
mapping.nav.restart = 56;
mapping.nav.prevProject = 76;
mapping.nav.nextProject = 77;
mapping.secondary = {};
mapping.secondary.min = 68;
mapping.secondary.max = 75;
mapping.knobs = {};
mapping.knobs.main = [];
mapping.knobs.main[0] = 16;
mapping.knobs.main[1] = 17;
mapping.knobs.main[2] = 18;
mapping.knobs.main[3] = 19;
mapping.knobs.main[4] = 20;
mapping.knobs.main[5] = 21;
mapping.knobs.main[6] = 22;
mapping.knobs.main[7] = 23;

/**
 * VPots send data based on acceleration, so convert to linear CC.
 */
mapping.convertVPot = function(value) {
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
};
