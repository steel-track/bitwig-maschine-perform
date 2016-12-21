var duplicatePadMode = new Mode();

duplicatePadMode.id = function() {
  return 'duplicate';
};

duplicatePadMode.init = function() {
  if (m.modes.pad.id() != 'duplicate') {
    m.modes.pad = duplicatePadMode;
  }
};

duplicatePadMode.processMidi = function(status, data1, data2) {
  // Use note data.
  if (status == status_id_notes) {
    // Ignore if velocity is 0 because it's probably a lift-off.
    if (data2 === 0) {
      return;
    }

    if (data1 >= mapping.pads.min && data1 <= mapping.pads.max) {
      var scene = Math.floor((data1 - mapping.pads.min) / 4);
      var track = (data1 - mapping.pads.min) % 4;
      if (m.banks.tracks.four[track].clipHasContent[scene]) {
        m.banks.tracks.control.getChannel(track).getClipLauncherSlots().select(scene);
        m.application.control.copy();
      }
      else {
        m.banks.tracks.control.getChannel(track).getClipLauncherSlots().select(scene);
        m.application.control.paste();
      }
    }
  }
};

duplicatePadMode.flush = function() {
  // Set pad mode leds.
  for (var key in mapping.padModes) {
    if (mapping.padModes.hasOwnProperty(key)) {
      if (mapping.padModes[key] != mapping.padModes.duplicate) {
        leds.setSingle(mapping.padModes[key], 'off');
      }
    }
  }
  leds.setSingle(mapping.padModes.duplicate, 'on');

  for (var i = 0; i < 4; i++) {
    for (var j = 0; i < 4; j++) {
      if (m.banks.tracks.four[i].clipHasContent[j]) {
        leds.setSingle(mapping.pads.max - (j * 4) + (i - 3), 'on');
      }
      else {
        leds.setSingle(mapping.pads.max - (j * 4) + (i - 3), 'off');
      }
    }
  }
};
