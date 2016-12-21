var keyboardSettingsPadMode = new Mode();

keyboardSettingsPadMode.id = function() {
  return 'keyboardsettings';
};

keyboardSettingsPadMode.init = function() {
  m.modes.pad = keyboardSettingsPadMode;
};

keyboardSettingsPadMode.processMidi = function(status, data1, data2) {
  // Use note data.
  if (status == status_id_notes) {
    // Ignore if velocity is 0 because it's probably a lift-off.
    if (data2 === 0) {
      return;
    }

    if (data1 >= mapping.pads.min && data1 <= mapping.pads.max) {
      var index = data1 - mapping.pads.min;

      // Set Root note
      if (index < 12) {
        m.keyboard.rootNote = index;
      }

      // Switch scales
      if (index == 12) {
        if (m.keyboard.scaleType != 'minor') {
          m.keyboard.scaleType = 'minor';
        }
        else {
          m.keyboard.scaleType = 'chromatic';
        }
      }

      if (index == 13) {
        if (m.keyboard.scaleType != 'major') {
          m.keyboard.scaleType = 'major';
        }
        else {
          m.keyboard.scaleType = 'chromatic';
        }
      }

      // Increment / Decrement Octaves
      if (index == 14) {
        if (m.keyboard.octave > 0) {
          m.keyboard.octave--;
        }
      }

      if (index == 15) {
        if (m.keyboard.octave < 8) {
          m.keyboard.octave++;
        }
      }
    }
  }
};

keyboardSettingsPadMode.flush = function() {
  // Set pad mode leds.
  for (var key in mapping.padModes) {
    if (mapping.padModes.hasOwnProperty(key)) {
      if (mapping.padModes[key] != mapping.padModes.keyboard) {
        leds.setSingle(mapping.padModes[key], 'off');
      }
    }
  }
  leds.setSingle(mapping.padModes.keyboard, 'on');

  var state = 'off';

  leds.setGroup(mapping.pads.min, mapping.pads.max - 4, 'off');
  leds.setSingle(mapping.pads.min + m.keyboard.rootNote, 'on');

  state = (m.keyboard.scaleType == 'minor') ? 'on' : 'off';
  leds.setSingle(mapping.pads.min + 12, state);

  state = (m.keyboard.scaleType == 'major') ? 'on' : 'off';
  leds.setSingle(mapping.pads.min + 13, state);

  state = (m.keyboard.octave > 0) ? 'on' : 'off';
  leds.setSingle(mapping.pads.min + 14, state);

  state = (m.keyboard.octave < 8) ? 'on' : 'off';
  leds.setSingle(mapping.pads.min + 15, state);
};
