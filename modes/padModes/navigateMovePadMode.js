var navigateMovePadMode = new Mode();

navigateMovePadMode.id = function() {
  return 'navigateMove';
};

navigateMovePadMode.init = function() {
  if (m.modes.pad.id() != 'navigateMove') {
    m.modes.pad = navigateMovePadMode;
  }
};

navigateMovePadMode.processMidi = function(status, data1, data2) {
  // Use note data.
  if (status == status_id_notes) {
    // Ignore if velocity is 0 because it's probably a lift-off.
    if (data2 === 0) {
      return;
    }

    if (data1 >= mapping.pads.min && data1 <= mapping.pads.max) {
      if (data1 == mapping.pads.min + 1 || data1 == mapping.pads.min + 2) {
        m.banks.tracks.four.control.scrollScenesPageDown();
      }
      else
      if (data1 == mapping.pads.min + 4 || data1 == mapping.pads.min + 8) {
        m.banks.tracks.four.control.scrollChannelsPageUp();
      }
      else
      if (data1 == mapping.pads.min + 7 || data1 == mapping.pads.min + 11) {
        m.banks.tracks.four.control.scrollChannelsPageDown();
      }
      else
      if (data1 == mapping.pads.min + 13 || data1 == mapping.pads.min + 14) {
        m.banks.tracks.four.control.scrollScenesPageUp();
      }
    }
  }
};

navigateMovePadMode.flush = function() {
  // Set pad mode leds.
  for (var key in mapping.padModes) {
    if (mapping.padModes.hasOwnProperty(key)) {
      if (mapping.padModes[key] != mapping.padModes.navigate) {
        leds.setSingle(mapping.padModes[key], 'off');
      }
    }
  }
  leds.setSingle(mapping.padModes.navigate, 'on');

  leds.setSingle(mapping.pads.min + 0, 'off');
  leds.setSingle(mapping.pads.min + 3, 'off');
  leds.setSingle(mapping.pads.min + 5, 'off');
  leds.setSingle(mapping.pads.min + 6, 'off');
  leds.setSingle(mapping.pads.min + 9, 'off');
  leds.setSingle(mapping.pads.min + 10, 'off');
  leds.setSingle(mapping.pads.min + 12, 'off');
  leds.setSingle(mapping.pads.min + 15, 'off');

  leds.setSingle(mapping.pads.min + 1, m.banks.tracks.four.canScrollScenesDown ? 'on' : 'off');
  leds.setSingle(mapping.pads.min + 2, m.banks.tracks.four.canScrollScenesDown ? 'on' : 'off');

  leds.setSingle(mapping.pads.min + 4, m.banks.tracks.four.canScrollChannelsUp ? 'on' : 'off');
  leds.setSingle(mapping.pads.min + 8, m.banks.tracks.four.canScrollChannelsUp ? 'on' : 'off');

  leds.setSingle(mapping.pads.min + 7, m.banks.tracks.four.canScrollChannelsDown ? 'on' : 'off');
  leds.setSingle(mapping.pads.min + 11, m.banks.tracks.four.canScrollChannelsDown ? 'on' : 'off');

  leds.setSingle(mapping.pads.min + 13, m.banks.tracks.four.canScrollScenesUp ? 'on' : 'off');
  leds.setSingle(mapping.pads.min + 14, m.banks.tracks.four.canScrollScenesUp ? 'on' : 'off');
};
