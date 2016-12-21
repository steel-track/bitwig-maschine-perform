var keyboardPadMode = new Mode();

keyboardPadMode.id = function() {
  return 'keyboard';
};

keyboardPadMode.init = function() {
  if (m.modes.pad.id() != 'keyboard') {
    m.modes.pad = keyboardPadMode;
  }
  else {
    keyboardSettingsPadMode.init();
  }
  leds.setGroup(mapping.pads.min, mapping.pads.max, 'off');
};

keyboardPadMode.processMidi = function(status, data1, data2) {
  // Send calculated note with velocity.
  if (status == status_id_notes) {
    if (data1 >= mapping.pads.min && data1 <= mapping.pads.max) {
      if (data2 === 0) {
        leds.setSingle(data1, 'off');
      }
      else {
        leds.setSingle(data1, 'on');
      }
      m.midi.control.sendRawMidiEvent(status, this.calculateNote(data1), data2);
    }
  }
};

keyboardPadMode.flush = function() {
  // Set pad mode leds.
  for (var key in mapping.padModes) {
    if (mapping.padModes.hasOwnProperty(key)) {
      if (mapping.padModes[key] != mapping.padModes.keyboard) {
        leds.setSingle(mapping.padModes[key], 'off');
      }
    }
  }
  leds.setSingle(mapping.padModes.keyboard, 'on');
};

keyboardPadMode.calculateNote = function(data1) {
  // Return octave times 12 adjusted by root note and the index of which pad was pressed.
  return (m.keyboard.octave * 12) + m.keyboard.rootNote + this.scales[m.keyboard.scaleType][data1 - mapping.pads.min];
};

keyboardPadMode.scales = {
  chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
  major: [0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 17, 19, 21, 23, 24, 26],
  minor: [0, 2, 3, 5, 7, 8, 10, 12, 14, 15, 17, 19, 20, 22, 24, 26]
};
