var soloPadMode = new Mode();

soloPadMode.id = function() {
  return 'solo';
};

soloPadMode.init = function() {
  if (m.modes.pad.id() != 'solo') {
    m.modes.pad = soloPadMode;
  }
  else {
    if (m.banks.tracks.sixteen.canScrollDown) {
      m.banks.tracks.sixteen.pageIndex++;
      m.banks.tracks.sixteen.control.scrollChannelsPageDown();
    }
    else {
      for (var i = 0; i < m.banks.tracks.sixteen.pageIndex; i++) {
        m.banks.tracks.sixteen.control.scrollChannelsPageUp();
      }
      m.banks.tracks.sixteen.pageIndex = 0;
    }
  }
};

soloPadMode.processMidi = function(status, data1, data2) {
  // Use note data.
  if (status == status_id_notes) {
    // Ignore if velocity is 0 because it's probably a lift-off.
    if (data2 === 0) {
      return;
    }

    if (data1 >= mapping.pads.min && data1 <= mapping.pads.max) {
      m.banks.tracks.sixteen.control.getChannel(data1 - mapping.pads.min).getSolo().toggle(false);
    }
  }
};

soloPadMode.flush = function() {
  // Set pad mode leds.
  for (var key in mapping.padModes) {
    if (mapping.padModes.hasOwnProperty(key)) {
      if (mapping.padModes[key] != mapping.padModes.solo) {
        leds.setSingle(mapping.padModes[key], 'off');
      }
    }
  }
  leds.setSingle(mapping.padModes.solo, 'on');

  for (var i = 0; i < 16; i++) {
    var state = m.banks.tracks.sixteen[i].isSoloed ? 'on' : 'off';
    leds.setSingle(mapping.pads.min + i, state);
  }
};
