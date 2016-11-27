/**
 * Global that should always be called for all non-mode functionality.
 */

var global = new Mode();

global.id = function() {
  return 'global';
};

global.init = function () {
  // Set defaults for values that track states like pagination.
  m.scenes.page = 0;
  m.setClipLength = false;
};

global.processMidi = function (status, data1, data2) {
  // Use note data.
  if (status == status_id_notes) {
    // Ignore if velocity is 0 because it's probably a lift-off.
    if (data2 === 0) {
      return;
    }
  }

  // Use note data.
  if (status == status_id_notes) {
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

    // Treat erase as an undo control.
    if (data1 == mapping.nav.erase) {
      application.undo();
    }

    // Switch and enable projects if project is stopped.
    if (data1 == mapping.nav.nextProject && !m.transport.isPlaying) {
      application.nextProject();
      application.activateEngine();
    }

    if (data1 == mapping.nav.prevProject && !m.transport.isPlaying) {
      application.previousProject();
      application.activateEngine();
    }

    // Page scene bank up.
    if (data1 == mapping.nav.left) {
      if (m.scenes.canScrollUp) {
        m.scenes.page--;
        tracks.scrollScenesPageUp();
      }
    }

    // Page scene bank down.
    if (data1 == mapping.nav.right) {
      if (m.scenes.canScrollDown) {
        m.scenes.page++;
        tracks.scrollScenesPageDown();
      }
    }

    // Launch scenes if group is hit.
    if (data1 >= mapping.group.min && data1 <= mapping.group.max) {
      // Set the scene index based on the value.
      m.scenes.indexPrevious = m.scenes.index;
      m.scenes.index = data1 - mapping.group.min;
      m.scenes.pageActive = m.scenes.page;
      tracks.launchScene(m.scenes.index);
    }

    // Detect modes.
    switch (data1) {
      case mapping.padModes.scene:
        scenePadMode.init();
        break;
      case mapping.padModes.pattern:
        patternPadMode.init();
        break;
      case mapping.padModes.keyboard:
        keyboardPadMode.init();
        break;
      case mapping.padModes.navigate:
        navigatePadMode.init();
        break;
      case mapping.padModes.select:
        selectPadMode.init();
        break;
      case mapping.padModes.solo:
        soloPadMode.init();
        break;
      case mapping.padModes.mute:
        mutePadMode.init();
        break;
      case mapping.displayModes.track:
        trackDisplayMode.init();
        break;
      case mapping.displayModes.parameter:
        parameterDisplayMode.init();
        break;
      case mapping.displayModes.device:
        deviceDisplayMode.init();
    }
  }

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
  }
};

global.flush = function() {

  // Get subdivision value so we can key off it to blink leds.
  var subDivision = transport.position.substr(4, 5);

  // Blink tap tempo button.
  if (m.transport.isPlaying) {
    var state = (subDivision < 3) ? 'on' : 'off';
    leds.setSingle(mapping.tapTempo, state);
  }

  if (m.transport.isPlaying) {
    leds.setSingle(mapping.nav.start, 'on');
  }
  else {
    // Turn off all applicable lights if stopped.
    leds.setGroup(mapping.group.min, mapping.group.max, 'off');
    leds.setSingle(mapping.nav.start, 'off');
    leds.setSingle(mapping.tapTempo, 'off');
  }

  // Show if recording.
  var state = (m.transport.isRecording) ? 'on' : 'off';
  leds.setSingle(mapping.nav.rec, state);

  // Show if set clip length mode enabled.
  var state = (m.setClipLength) ? 'on' : 'off';
  leds.setSingle(mapping.nav.setClipLength, state);

  // Scene pagination states.
  var state = (m.scenes.canScrollDown) ? 'on' : 'off';
  leds.setSingle(mapping.nav.right, state);
  var state = (m.scenes.canScrollUp) ? 'on' : 'off';
  leds.setSingle(mapping.nav.left, state);

  // Set based on active scene and page containing an active scene, otherwise off because on a different page.
  if (m.scenes.pageActive == m.scenes.page) {
    leds.setSingle(mapping.group.min + m.scenes.indexPrevious, 'off');
    leds.setSingle(mapping.group.min + m.scenes.index, 'on');
  }
  else {
    leds.setGroup(mapping.group.min, mapping.group.max, 'off');
  }

};