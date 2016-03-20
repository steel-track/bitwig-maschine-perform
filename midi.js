/**
 * React to all midi input.
 */
function onMidi(status, data1, data2) {
  //println('status: ' + status);
  //println('data1: ' + data1);
  //println('data2: ' + data2);

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

    // Move transport back to beginning.
    if (data1 == mapping.nav.restart) {
      transport.setPosition(0);
    }

    // Page scene bank up.
    if (data1 == mapping.nav.left) {
      scenes.scrollPageUp();
    }

    // Page scene bank down.
    if (data1 == mapping.nav.right) {
      scenes.scrollPageDown();
    }

    // Erase a clip.
    if (data1 == mapping.nav.erase) {
      tracks.getChannel(m.trackIndex).getClipLauncherSlots().deleteClip(m.sceneIndex);
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

    // Check if the note falls into our Group mapping range.
    if (data1 >= mapping.group.min && data1 <= mapping.group.max) {
      // Set the scene index based on the value.
      m.sceneIndex = data1 - mapping.group.min;
      leds.setGroup(mapping.group.min, mapping.group.max, 'off');
      leds.setSingle(data1);
      scenes.getScene(m.sceneIndex).selectInEditor();
      scenes.launchScene(m.sceneIndex);
    }

    // Check if note falls within track arm range.
    if (data1 >= mapping.trackArm.min && data1 <= mapping.trackArm.max) {
      m.trackIndex = data1 - mapping.trackArm.min;
      // If you want multiple tracks enabled at a time, this will do it, but for now let's have one.
      for (var i = 0; i < 8; i++) {
        tracks.getChannel(i).getArm().set(false);
      }
      tracks.getChannel(m.trackIndex).getArm().set(true);
    }

    // Check if note falls within track record range.
    if (data1 >= mapping.trackRecord.min && data1 <= mapping.trackRecord.max) {
      // Trigger a clip to begin recording given the current scene.
      m.trackIndex = data1 - mapping.trackRecord.min;

      for (var i = 0; i < 8; i++) {
        if (m.trackRecording[i]) {
          m.trackRecording[i] = false;
          tracks.getChannel(i).getClipLauncherSlots().launch(m.sceneIndex);
        }
        tracks.getChannel(i).getArm().set(false);
      }
      tracks.getChannel(m.trackIndex).getArm().set(true);
      tracks.getChannel(m.trackIndex).getClipLauncherSlots().launch(m.sceneIndex);
    }

    // Check if note falls within secondary range.
    if (data1 >= mapping.secondary.min && data1 <= mapping.secondary.max) {
      var newTrack = data1 - mapping.secondary.min;
      tracks.getChannel(newTrack).selectInMixer();
    }
  }

  // Use cc data.
  if (status == status_id_cc) {
    // Check if our main knob bank was used.
    var main_knob = mapping.knobs.main.indexOf(data1);
    if (main_knob > -1) {
      // Change value of macro based on knob index.
      cDevice.getMacro(main_knob).getAmount().inc(mapping.convertVPot(data2), 128);
    }
  }
}

/**
 * React to all sysex input.
 */
function onSysex(data) {
  printSysex(data);
}
