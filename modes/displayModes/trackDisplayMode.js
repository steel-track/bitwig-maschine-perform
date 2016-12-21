var trackDisplayMode = new Mode();

trackDisplayMode.id = function() {
  return 'track';
};

trackDisplayMode.init = function() {
  m.modes.display = trackDisplayMode;

  switch (m.banks.tracks.current.xfade) {
    case 'A':
      m.banks.tracks.current.xfadeValue = 0;
      break;
    case 'B':
      m.banks.tracks.current.xfadeValue = 127;
      break;
    case 'AB':
      m.banks.tracks.current.xfadeValue = 63;
      break;
    default:
      m.banks.tracks.current.xfadeValue = 63;
  }
};

trackDisplayMode.processMidi = function(status, data1, data2) {
  // Use note data.
  if (status == status_id_notes) {
    // Ignore if velocity is 0 because it's probably a lift-off.
    if (data2 === 0) {
      return;
    }

    // Switch tracks if notes fall within secondary range.
    if (data1 >= mapping.secondary.min && data1 <= mapping.secondary.max) {
      m.banks.tracks.eight.control.getChannel(data1 - mapping.secondary.min).selectInMixer();
      m.banks.tracks.eight.control.getChannel(data1 - mapping.secondary.min).getPrimaryDevice().selectInEditor();

      // Make sure our xfade tracking value is updated if the channel changes.
      switch (m.banks.tracks.current.xfade) {
        case 'A':
          m.banks.tracks.current.xfadeValue = 0;
          break;
        case 'B':
          m.banks.tracks.current.xfadeValue = 127;
          break;
        case 'AB':
          m.banks.tracks.current.xfadeValue = 63;
          break;
        default:
          m.banks.tracks.current.xfadeValue = 63;
      }
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
      switch (knob) {
        case 1:
          // Volume.
          m.banks.tracks.current.control.getVolume().inc(mapping.convertVPot(data2), 128);
          break;
        case 2:
          // Pan.
          m.banks.tracks.current.control.getPan().inc(mapping.convertVPot(data2), 128);
          break;
        case 3:
          // Xfade mode.
          this.xfadeKnobConversion(data1, data2);
          break;
        case 4:
          // Send 1.
          m.banks.tracks.current.control.getSend(0).inc(mapping.convertVPot(data2), 128);
          break;
        case 5:
          // Send 2.
          m.banks.tracks.current.control.getSend(1).inc(mapping.convertVPot(data2), 128);
          break;
        case 6:
          // Send 3.
          m.banks.tracks.current.control.getSend(2).inc(mapping.convertVPot(data2), 128);
          break;
        case 7:
          // Send 4.
          m.banks.tracks.current.control.getSend(3).inc(mapping.convertVPot(data2), 128);
          break;
      }
    }
  }
};

trackDisplayMode.flush = function() {
  // Set display mode leds.
  for (var key in mapping.displayModes) {
    if (mapping.displayModes.hasOwnProperty(key)) {
      if (mapping.displayModes[key] != mapping.displayModes.track) {
        leds.setSingle(mapping.displayModes[key], 'off');
      }
    }
  }
  leds.setSingle(mapping.displayModes.track, 'on');

  // Initialize all labels and values.
  var labels = [m.banks.tracks.current.name, 'Volume', 'Pan', m.banks.tracks.current.xfade];
  for (var i = 0; i < 4; i++) {
    labels[i + 4] = m.banks.tracks.current.sends[i].name;
  }
  for (var i = 0; i < 8; i++) {
    messages.writeSingle(m.banks.tracks.eight[i].name, messages.position.top[i]);
    messages.writeSingle(labels[i], messages.position.bottom[i]);

    var state = (m.banks.tracks.eight[i].isSelected) ? 'on' : 'off';
    leds.setSingle(mapping.secondary.min + i, state);
  }

  // Set pagination.
  leds.setSingle(mapping.secondary.pageUp, (m.banks.tracks.eight.canScrollUp) ? 'on' : 'off');
  leds.setSingle(mapping.secondary.pageDown, (m.banks.tracks.eight.canScrollDown) ? 'on' : 'off');

  // Send vpot status.
  messages.sendVpotLinear(1, m.banks.tracks.current.volume);
  messages.sendVpotBipolar(2, m.banks.tracks.current.pan);
  switch (m.banks.tracks.current.xfade) {
    case 'A':
      messages.sendVpotBipolar(3, 0);
      break;
    case 'B':
      messages.sendVpotBipolar(3, 10);
      break;
    case 'AB':
      messages.sendVpotBipolar(3, 5);
      break;
    default:
      messages.sendVpotBipolar(3, 6);
  }
  messages.sendVpotLinear(4, m.banks.tracks.current.sends[0].value);
  messages.sendVpotLinear(5, m.banks.tracks.current.sends[1].value);
  messages.sendVpotLinear(6, m.banks.tracks.current.sends[2].value);
  messages.sendVpotLinear(7, m.banks.tracks.current.sends[3].value);
};

trackDisplayMode.xfadeValues = ['A', 'AB', 'B'];

trackDisplayMode.xfadeKnobConversion = function(data1, data2) {
  m.banks.tracks.current.xfadeValue = m.banks.tracks.current.xfadeValue + mapping.convertVPot(data2);
  if (m.banks.tracks.current.xfadeValue <= 0) {
    m.banks.tracks.current.xfadeValue = 0;
    m.banks.tracks.current.control.getCrossFadeMode().set('A');
  }
  else if (m.banks.tracks.current.xfadeValue >= 127) {
    m.banks.tracks.current.xfadeValue = 127;
    m.banks.tracks.current.control.getCrossFadeMode().set('B');
  }
  else {
    m.banks.tracks.current.control.getCrossFadeMode().set('AB');
  }

};
