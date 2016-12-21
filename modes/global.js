/**
 * Global that should always be called for all non-mode functionality.
 */

var global = new Mode();

global.id = function() {
  return 'global';
};

global.init = function () {};

global.processMidi = function (status, data1, data2) {
  // Use note data.
  if (status == status_id_notes) {
    // Enable set clip length.
    if (data1 == mapping.nav.setClipLength) {
      clipLengthPadMode.init(data2);
    }

    // Ignore if velocity is 0 because it's probably a lift-off.
    if (data2 === 0) {
      return;
    }
  }

  // Use note data.
  if (status == status_id_notes) {
    // Check if start / stop.
    if (data1 == mapping.nav.start) {
      m.transport.control.togglePlay();
    }

    // Record.
    if (data1 == mapping.nav.rec) {
      m.transport.control.record();
    }

    // Tap tempo.
    if (data1 == mapping.tapTempo) {
      m.transport.control.tapTempo();
    }

    // Move transport back to beginning.
    if (data1 == mapping.nav.restart) {
      m.transport.control.setPosition(0);
    }

    // Treat erase as an undo control.
    if (data1 == mapping.nav.erase) {
      m.application.control.undo();
    }

    // Switch and enable projects if project is stopped.
    if (data1 == mapping.nav.nextProject && !m.transport.isPlaying) {
      m.application.control.nextProject();
      m.application.control.activateEngine();
    }

    // Page scene bank up.
    if (data1 == mapping.nav.left) {
      if (m.banks.tracks.sixteen.pageSceneSubIndex == 1) {
        m.banks.tracks.sixteen.pageSceneSubIndex = 0;
      }
      else {
        if (m.banks.tracks.sixteen.canScrollScenesUp) {
          m.banks.tracks.sixteen.control.scrollScenesPageUp();
          m.banks.tracks.sixteen.pageSceneIndex--;
          m.banks.tracks.sixteen.pageSceneSubIndex = 1;
        }
      }
    }

    // Page scene bank down.
    if (data1 == mapping.nav.right) {
      if (m.banks.tracks.sixteen.pageSceneSubIndex == 0) {
        m.banks.tracks.sixteen.pageSceneSubIndex = 1;
      }
      else {
        if (m.banks.tracks.sixteen.canScrollScenesDown) {
          m.banks.tracks.sixteen.control.scrollScenesPageDown();
          m.banks.tracks.sixteen.pageSceneIndex++;
          m.banks.tracks.sixteen.pageSceneSubIndex = 0;
        }
      }
    }

    // Launch scenes if a group is hit.
    if (data1 >= mapping.group.min && data1 <= mapping.group.max) {
      m.banks.tracks.sixteen.sceneIndex = data1 - mapping.group.min + m.banks.tracks.sixteen.pageSceneSubIndex * 8;
      m.banks.tracks.sixteen.activeScenePageIndex = m.banks.tracks.sixteen.pageSceneIndex;
      m.banks.tracks.sixteen.control.launchScene(m.banks.tracks.sixteen.sceneIndex);
    }

    // Switch modes.
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
//      TODO: figure out how to copy and paste.
//      case mapping.padModes.duplicate:
//        duplicatePadMode.init();
//        break;
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
      case mapping.displayModes.modules:
        parameterDisplayMode.init();
        break;
      case mapping.displayModes.trackBank:
        volumeDisplayMode.init();
    }
  }

  if (status == status_id_cc) {
    if (data1 == mapping.knobs.master) {
      m.masterTrack.control.getVolume().inc(mapping.convertRelative(data2), 128);
    }
    else if (data1 == mapping.knobs.tempo) {
      m.transport.control.getTempo().inc(mapping.convertRelative(data2), 647);
    }
    else if (data1 == mapping.knobs.swing) {
      m.groove.control.getShuffleAmount().inc(mapping.convertRelative(data2), 101);
    }
  }
};

global.flush = function() {

  // Get subdivision value so we can key off it to blink leds.
  var subDivision = m.transport.position.substr(4, 5);

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
    leds.setSingle(mapping.nav.start, 'off');
    leds.setSingle(mapping.tapTempo, 'off');
  }

  // Show if recording.
  var state = (m.transport.isRecording) ? 'on' : 'off';
  leds.setSingle(mapping.nav.rec, state);

  // Show if set clip length mode enabled.
  var state = (m.setClipLength.isEnabled) ? 'on' : 'off';
  leds.setSingle(mapping.nav.setClipLength, state);

  // Scene pagination states.
  if (m.banks.tracks.sixteen.pageSceneSubIndex == 1 || m.banks.tracks.sixteen.canScrollScenesUp) {
    leds.setSingle(mapping.nav.left, 'on');
  }
  else {
    leds.setSingle(mapping.nav.left, 'off');
  }

  if (m.banks.tracks.sixteen.pageSceneSubIndex == 0 || m.banks.tracks.sixteen.canScrollScenesDown) {
    leds.setSingle(mapping.nav.right, 'on');
  }
  else {
    leds.setSingle(mapping.nav.right, 'off');
  }

  // Check if the current scene is selected in the editor which means it was launched.
  for (var i = 0; i < 8; i++) {
    if (m.banks.tracks.sixteen.activeScenePageIndex == m.banks.tracks.sixteen.pageSceneIndex && (i + m.banks.tracks.sixteen.pageSceneSubIndex * 8 == m.banks.tracks.sixteen.sceneIndex)) {
      leds.setSingle(mapping.group.min + i, 'on');
    }
    else {
      leds.setSingle(mapping.group.min + i, 'off');
    }
  }

};
