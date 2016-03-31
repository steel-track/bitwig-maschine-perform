/**
 * React to all midi input.
 */
function onMidi(status, data1, data2) {
  // println('status: ' + status);
  // println('data1: ' + data1);
  // println('data2: ' + data2);

  // Use note data.
  if (status == status_id_notes) {
    // Ignore if velocity is 0 because it's probably a lift-off.
    if (data2 === 0) {
      return;
    }

    // Check if start / stop.
    if (data1 == mapping.nav.start) {
      transport.togglePlay();
    }

    // Record.
    if (data1 == mapping.nav.rec) {
      transport.record();
    }

    // Tap tempo.
    if (data1 == mapping.tapTempo) {
      transport.tapTempo();
    }

    // Move transport back to beginning.
    if (data1 == mapping.nav.restart) {
      transport.setPosition(0);
    }

    // Set recording length to 8 bars.
    if (data1 == mapping.nav.setClipLength) {
      m.setClipLength = (m.setClipLength) ? false : true;
      var state = (m.setClipLength) ? 'on' : 'off';
      leds.setSingle(mapping.nav.setClipLength, state);
    }

    // Set recording clip length
    if (mapping.clipLength.min <= data1 && mapping.clipLength.max >= data1) {
      m.clipLength = mapping.clipLength.values[data1];
      leds.setGroup(mapping.clipLength.min, mapping.clipLength.max, 'off');
      leds.setSingle(mapping.clipLength.triggers[m.clipLength], 'on');
    }
    
    // Page scene bank up.
    if (data1 == mapping.nav.left) {
      if (m.scenePage > 0) {
        m.scenePage--;
      }
      tracks.scrollScenesPageUp();
    }

    // Page scene bank down.
    if (data1 == mapping.nav.right) {
      if (!m.sceneCanScroll) {
        m.scenePage++;
      }
      tracks.scrollScenesPageDown();
    }

    // Launch scenes if group is hit.
    if (data1 >= mapping.group.min && data1 <= mapping.group.max) {
      // Set the scene index based on the value.
      m.sceneBankIndex = data1 - mapping.group.min;
      leds.setGroup(mapping.group.min, mapping.group.max, 'off');
      leds.setSingle(data1);
      tracks.launchScene(m.sceneBankIndex);
    }

    // Erase a clip.
    if (data1 == mapping.nav.erase) {
      tracks.getChannel(m.trackArmedIndex).getClipLauncherSlots().deleteClip(m.sceneIndex);
    }

    // Switch and enable projects.
    if (data1 == mapping.nav.nextProject && m.stopped) {
      application.nextProject();
      application.activateEngine();
    }

    if (data1 == mapping.nav.prevProject && m.stopped) {
      application.previousProject();
      application.activateEngine();
    }

    // Check if note falls within track arm range.
    if (data1 >= mapping.trackArm.min && data1 <= mapping.trackArm.max) {
      m.trackArmedIndex = data1 - mapping.trackArm.min;
      // If you want multiple tracks enabled at a time, this will do it, but for now let's have one.
      for (var i = 0; i < 8; i++) {
        tracks.getChannel(i).getArm().set(false);
      }
      tracks.getChannel(m.trackArmedIndex).getArm().set(true);
    }

    // Check if note falls within track record range.
    if (data1 >= mapping.trackRecord.min && data1 <= mapping.trackRecord.max) {
      // Trigger a clip to begin recording given the current scene.
      m.trackArmedIndex = data1 - mapping.trackRecord.min;

      // Iterate over current tracks, stop recording if recording, and disable arm.
      for (var i = 0; i < 8; i++) {
        if (m.trackRecording[i]) {
          m.trackRecording[i] = false;
          tracks.getChannel(i).getClipLauncherSlots().launch(m.sceneIndex);
        }
        tracks.getChannel(i).getArm().set(false);
      }
      // Arm new track.
      tracks.getChannel(m.trackArmedIndex).getArm().set(true);
      // If set clip length is enabled, create a new set length clip then record. Otherwise,
      // just create clip and record.
      if (m.setClipLength) {
        transport.setLauncherOverdub(false);
        tracks.getChannel(m.trackArmedIndex).getClipLauncherSlots().createEmptyClip(m.sceneIndex, m.clipLength);
      }
      else {
        transport.setLauncherOverdub(true);
      }
      tracks.getChannel(m.trackArmedIndex).getClipLauncherSlots().launch(m.sceneIndex);
    }

    // Check if note falls within secondary range.
    if (data1 >= mapping.secondary.min && data1 <= mapping.secondary.max) {
      m.trackSelectedIndex = data1 - mapping.secondary.min;
      tracks.getChannel(m.trackSelectedIndex).selectInMixer();
    }

    // Page tracks up and down.
    if (data1 == mapping.secondary.pageDown) {
      tracks.scrollChannelsPageDown();
    }

    if (data1 == mapping.secondary.pageUp) {
      tracks.scrollChannelsPageUp();
    }
  }

  // Set track mode.
  if (data1 == mapping.modes.track) {
    leds.setSingle(m.mode, 'off');
    m.mode = mapping.modes.track;
    leds.setSingle(m.mode, 'on');
    // Initialize all labels and values.
    for (var i = 0; i < 8; i++) {
      messages.writeSingle(m.trackName[i], messages.position.bottom[i]);
      messages.sendVpotLinear(i, m.trackValue[i]);
    }
  }

  // Set macro mode.
  if (data1 == mapping.modes.macro) {
    leds.setSingle(m.mode, 'off');
    m.mode = mapping.modes.macro;
    leds.setSingle(m.mode, 'on');
    // Initialize all labels and values.
    for (var i = 0; i < 8; i++) {
      messages.writeSingle(m.macroName[i], messages.position.bottom[i]);
      messages.sendVpotLinear(i, m.macroValue[i]);
    }
  }

  // Use cc data.
  if (status == status_id_cc) {
    if (data1 == mapping.knobs.master) {
      masterTrack.getVolume().inc(mapping.convertRelative(data2), 128);
    }
    else if (data1 == mapping.knobs.tempo) {
      transport.getTempo().inc(mapping.convertRelative(data2), 647);
    }
    else if (data1 == mapping.knobs.swing) {
      groove.getShuffleAmount().inc(mapping.convertRelative(data2), 101);
    }
    else {
      encoderModes(data1, data2);
    }
  }
}

/**
 * React to all sysex input.
 */
function onSysex(data) {
  printSysex(data);
}
