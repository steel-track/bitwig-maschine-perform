var volumeDisplayMode = new Mode();

volumeDisplayMode.id = function() {
  return 'volumeBank';
};

volumeDisplayMode.init = function() {
  if (m.modes.display.id() != 'volumeBank') {
    m.modes.display = volumeDisplayMode;
  }
  else {
    panDisplayMode.init();
  }
};

volumeDisplayMode.processMidi = function(status, data1, data2) {
  // Use note data.
  if (status == status_id_notes) {
    // Ignore if velocity is 0 because it's probably a lift-off.
    if (data2 === 0) {
      return;
    }

    // Switch tracks if notes fall within secondary range.
    if (data1 >= mapping.secondary.min && data1 <= mapping.secondary.max) {
      m.banks.tracks.eight.control.getChannel(data1 - mapping.secondary.min).selectInMixer();
    }

    if (data1 == mapping.secondary.pageUp) {
      m.banks.tracks.eight.control.scrollChannelsPageUp();
    }

    if (data1 == mapping.secondary.pageDown) {
      m.banks.tracks.eight.control.scrollChannelsPageDown();
    }
  }

  // Use cc data.
  if (status == status_id_cc) {
    // Check if our main knob bank was used.
    var knob = mapping.knobs.main.indexOf(data1);
    if (knob > -1) {
      m.banks.tracks.eight.control.getChannel(knob).getVolume().inc(mapping.convertVPot(data2), 128);
    }
  }
};

volumeDisplayMode.flush = function() {
  // Set display mode leds.
  for (var key in mapping.displayModes) {
    if (mapping.displayModes.hasOwnProperty(key)) {
      if (mapping.displayModes[key] != mapping.displayModes.trackBank) {
        leds.setSingle(mapping.displayModes[key], 'off');
      }
    }
  }
  leds.setSingle(mapping.displayModes.trackBank, 'on');

  for (var i = 0; i < 8; i++) {
    messages.writeSingle(m.banks.tracks.eight[i].name, messages.position.top[i]);
    messages.writeSingle(m.banks.tracks.eight[i].volumeRaw, messages.position.bottom[i]);

    var state = (m.banks.tracks.eight[i].isSelected) ? 'on' : 'off';
    leds.setSingle(mapping.secondary.min + i, state);

    // Send vpot status.
    messages.sendVpotLinear(i, m.banks.tracks.eight[i].volume);
  }

  // Set pagination.
  leds.setSingle(mapping.secondary.pageUp, (m.banks.tracks.eight.canScrollUp) ? 'on' : 'off');
  leds.setSingle(mapping.secondary.pageDown, (m.banks.tracks.eight.canScrollDown) ? 'on' : 'off');
};

