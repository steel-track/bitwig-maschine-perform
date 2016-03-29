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
mapping.nav.setClipLength = 57;
mapping.nav.prevProject = 76;
mapping.nav.nextProject = 77;
mapping.secondary = {};
mapping.secondary.min = 68;
mapping.secondary.max = 75;
mapping.secondary.pageUp = 81;
mapping.secondary.pageDown = 82;
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
mapping.knobs.master = 24;
mapping.knobs.tempo = 25;
mapping.knobs.swing = 26;
mapping.modes = {};
mapping.modes.track = 78;
mapping.modes.macro = 79;
mapping.tapTempo = 80;
mapping.clipLength = {};
mapping.clipLength.min = 84;
mapping.clipLength.max = 87;
mapping.clipLength.triggers = [];
mapping.clipLength.triggers[8] = 84;
mapping.clipLength.triggers[16] = 85;
mapping.clipLength.triggers[32] = 86;
mapping.clipLength.triggers[64] = 87;
mapping.clipLength.values = [];
mapping.clipLength.values[84] = 8;
mapping.clipLength.values[85] = 16;
mapping.clipLength.values[86] = 32;
mapping.clipLength.values[87] = 64;

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

mapping.convertRelative = function(value) {
  return value - 64;
};