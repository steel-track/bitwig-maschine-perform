var patternPadMode = new Mode();

patternPadMode.id = function() {
  return 'pattern';
};

patternPadMode.init = function() {
  if (m.modes.pad.id() != 'pattern') {
    m.modes.pad = patternPadMode;
  }
  else {
    if (m.banks.tracks.sixteen.canScrollScenesDown) {
      m.banks.tracks.sixteen.pageSceneIndex++;
      m.banks.tracks.sixteen.control.scrollScenesPageDown();
    }
    else {
      for (var i = 0; i < m.banks.tracks.sixteen.pageSceneIndex; i++) {
        m.banks.tracks.sixteen.control.scrollScenesPageUp();
      }
      m.banks.tracks.sixteen.pageSceneIndex = 0;
    }
  }

  // Pattern made is determined by the last armed track. Since on load we don't know the last armed, we just get the
  // first armed track that we can find.
  if (m.banks.tracks.lastArmed.control == null) {
    for (var i = 0; i < 16; i++) {
      if (m.banks.tracks.sixteen[i].isArmed) {
        m.banks.tracks.lastArmed.control = m.banks.tracks.sixteen.control.getChannel(i);
        break;
      }
    }
  }

  // If no track is armed, arm the first one.
  if (m.banks.tracks.lastArmed.control == null) {
    m.banks.tracks.lastArmed.control = m.banks.tracks.sixteen.control.getChannel(0);
  }
};

patternPadMode.processMidi = function(status, data1, data2) {
  // Use note data.
  if (status == status_id_notes) {
    // Ignore if velocity is 0 because it's probably a lift-off.
    if (data2 === 0) {
      return;
    }

    if (data1 >= mapping.pads.min && data1 <= mapping.pads.max) {
      // Arm new track.
      m.banks.tracks.lastArmed.control.getArm().set(true);
      if (m.setClipLength.isEnabled) {
        m.banks.tracks.lastArmed.control.getClipLauncherSlots().createEmptyClip(data1 - mapping.pads.min, m.setClipLength.length * m.transport.beatsPerBar);
      }
      m.banks.tracks.lastArmed.control.getClipLauncherSlots().launch(data1 - mapping.pads.min);
    }
  }
};

patternPadMode.flush = function() {
  // Set pad mode leds.
  for (var key in mapping.padModes) {
    if (mapping.padModes.hasOwnProperty(key)) {
      if (mapping.padModes[key] != mapping.padModes.pattern) {
        leds.setSingle(mapping.padModes[key], 'off');
      }
    }
  }
  leds.setSingle(mapping.padModes.pattern, 'on');
};

patternPadMode.forceFlush = function() {
  var subDivision = m.transport.position.substr(4, 5);
  var state = 'off';

  for (var i = 0; i < 16; i++) {
    if (m.banks.tracks.sixteen[i].isSelected) {
      m.banks.tracks.sixteen.channelIndex = i;
    }
  }

  // Set leds to flash or be stable depending on status.
  for (var i = 0; i < 16; i++) {
    if (m.banks.tracks.sixteen[m.banks.tracks.sixteen.channelIndex].clipIsPlaying[i] || m.banks.tracks.sixteen[m.banks.tracks.sixteen.channelIndex].clipHasContent[i]) {
      leds.setSingle(mapping.pads.min + i, 'on');
    }
    else if (m.banks.tracks.sixteen[m.banks.tracks.sixteen.channelIndex].clipIsRecording[i]) {
      state = (subDivision < 3) ? 'on' : 'off';
      leds.setSingle(mapping.pads.min + i, state);
    }
    else if (m.banks.tracks.sixteen[m.banks.tracks.sixteen.channelIndex].clipIsRecordingQueued[i]) {
      state = (subDivision % 2 == 1) ? 'on' : 'off';
      leds.setSingle(mapping.pads.min + i, state);
    }
    else {
      leds.setSingle(mapping.pads.min + i, 'off');
    }
  }
};
