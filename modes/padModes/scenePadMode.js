var scenePadMode = new Mode();

scenePadMode.id = function() {
  return 'scene';
};

scenePadMode.init = function() {
  if (m.modes.pad.id() != 'scene') {
    m.modes.pad = scenePadMode;
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

scenePadMode.processMidi = function(status, data1, data2) {
  // Use note data.
  if (status == status_id_notes) {
    // Ignore if velocity is 0 because it's probably a lift-off.
    if (data2 === 0) {
      return;
    }

    if (data1 >= mapping.pads.min && data1 <= mapping.pads.max) {
      // Arm new track.
      m.banks.tracks.lastArmed.control = m.banks.tracks.sixteen.control.getChannel(data1 - mapping.pads.min);
      m.banks.tracks.lastArmed.control.getArm().set(true);
      if (m.banks.tracks.sixteen[i].clipIsPlaying[data1 - mapping.pads.min]) {
        m.banks.tracks.lastArmed.control.getClipLauncherSlots().stop();
      }
      else {
        if (m.setClipLength.isEnabled) {
          m.banks.tracks.lastArmed.control.getClipLauncherSlots().createEmptyClip(m.banks.tracks.sixteen.sceneIndex, m.setClipLength.length * m.transport.beatsPerBar);
        }
        m.banks.tracks.lastArmed.control.getClipLauncherSlots().launch(m.banks.tracks.sixteen.sceneIndex);
      }
    }
  }
};

scenePadMode.flush = function() {
  // Set pad mode leds.
  for (var key in mapping.padModes) {
    if (mapping.padModes.hasOwnProperty(key)) {
      if (mapping.padModes[key] != mapping.padModes.scene) {
        leds.setSingle(mapping.padModes[key], 'off');
      }
    }
  }
  leds.setSingle(mapping.padModes.scene, 'on');
};

scenePadMode.forceFlush = function() {
  var subDivision = m.transport.position.substr(4, 5);
  var state = 'off';

  // Set leds to flash or be stable depending on status.
  for (var i = 0; i < 16; i++) {
    if (m.banks.tracks.sixteen[i].clipIsPlaying[m.banks.tracks.sixteen.sceneIndex]) {
      leds.setSingle(mapping.pads.min + i, 'on');
    }
    else if (m.banks.tracks.sixteen[i].clipIsRecording[m.banks.tracks.sixteen.sceneIndex]) {
      state = (subDivision < 3) ? 'on' : 'off';
      leds.setSingle(mapping.pads.min + i, state);
    }
    else if (m.banks.tracks.sixteen[i].clipIsRecordingQueued[m.banks.tracks.sixteen.sceneIndex]) {
      state = (subDivision % 2 == 1) ? 'on' : 'off';
      leds.setSingle(mapping.pads.min + i, state);
    }
    else {
      leds.setSingle(mapping.pads.min + i, 'off');
    }
  }
};
