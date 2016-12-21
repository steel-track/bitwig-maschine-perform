var navigatePadMode = new Mode();

navigatePadMode.id = function() {
  return 'navigate';
};

navigatePadMode.init = function() {
  if (m.modes.pad.id() != 'navigate') {
    m.modes.pad = navigatePadMode;
  }
  else {
    m.modes.pad = navigateMovePadMode;
  }
};

navigatePadMode.processMidi = function(status, data1, data2) {
  // Use note data.
  if (status == status_id_notes) {
    // Ignore if velocity is 0 because it's probably a lift-off.
    if (data2 === 0) {
      return;
    }

    if (data1 >= mapping.pads.min && data1 <= mapping.pads.max) {
      var padIndex = data1 - mapping.pads.min;
      var scene = 0;
      if (padIndex >= 0 && padIndex < 4) {
        scene = 3;
      }
      else if (padIndex >= 4 && padIndex < 8) {
        scene = 2;
      }
      else if (padIndex >= 8 && padIndex < 12) {
        scene = 1;
      }
      var track = (data1 - mapping.pads.min) % 4;
      // Arm new track.
      m.banks.tracks.lastArmed.control = m.banks.tracks.four.control.getChannel(track);
      m.banks.tracks.lastArmed.control.getArm().set(true);
      if (m.setClipLength.isEnabled) {
        m.banks.tracks.lastArmed.control.getClipLauncherSlots().createEmptyClip(scene, m.setClipLength.length * m.transport.beatsPerBar);
      }
      m.banks.tracks.lastArmed.control.getClipLauncherSlots().launch(scene);
    }
  }
};

navigatePadMode.flush = function() {
  // Set pad mode leds.
  for (var key in mapping.padModes) {
    if (mapping.padModes.hasOwnProperty(key)) {
      if (mapping.padModes[key] != mapping.padModes.navigate) {
        leds.setSingle(mapping.padModes[key], 'off');
      }
    }
  }
  leds.setSingle(mapping.padModes.navigate, 'on');

  var subDivision = m.transport.position.substr(4, 5);
  var state = 'off';

  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 4; j++) {
      if (m.banks.tracks.four[i].clipIsPlaying[j]) {
        leds.setSingle(mapping.pads.max - (j * 4) + (i - 3), 'on');
      }
      else if (m.banks.tracks.four[i].clipIsRecording[j]) {
        state = (subDivision < 3) ? 'on' : 'off';
        leds.setSingle(mapping.pads.max - (j * 4) + (i - 3), state);
      }
      else if (m.banks.tracks.four[i].clipIsRecordingQueued[j]) {
        state = (subDivision % 2 == 1) ? 'on' : 'off';
        leds.setSingle(mapping.pads.max - (j * 4) + (i - 3), state);
      }
      else {
        leds.setSingle(mapping.pads.max - (j * 4) + (i - 3), 'off');
      }
    }
  }
};
