var clipLengthPadMode = new Mode();

clipLengthPadMode.id = function() {
  return 'clipLength';
};

clipLengthPadMode.init = function(velocity) {
  // Button press and clipLength mode is not on.
  if (!m.setClipLength.isEnabled && velocity > 0) {
    // Store previous pad mode so we can set it again.
    m.modes.previousPad = m.modes.pad;
    m.setClipLength.isEnabled = true;
    m.modes.pad = clipLengthPadMode;
    m.transport.control.setLauncherOverdub(false);
  }
  else if (m.setClipLength.isEnabled && velocity > 0) {
    m.setClipLength.isEnabled = false;
    m.transport.control.setLauncherOverdub(true);
  }
  else if (m.setClipLength.isEnabled && velocity === 0) {
    m.modes.pad = m.modes.previousPad;
  }
};

clipLengthPadMode.processMidi = function(status, data1, data2) {
  if (status == status_id_notes) {
    // Ignore if velocity is 0 because it's probably a lift-off.
    if (data2 === 0) {
      return;
    }

    if (data1 >= mapping.pads.min && data1 <= mapping.pads.max) {
      m.setClipLength.length = data1 - mapping.pads.min + 1;
    }
  }
};

clipLengthPadMode.flush = function() {
  for (var i = 0; i < 16; i++) {
    var state = (m.setClipLength.length - 1 == i) ? 'on' : 'off';
    leds.setSingle(mapping.pads.min + i, state);
  }
};
