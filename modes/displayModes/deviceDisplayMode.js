var deviceDisplayMode = new Mode();

deviceDisplayMode.id = function() {
  return 'device';
};

deviceDisplayMode.init = function() {
  m.modes.display = deviceDisplayMode;
};

deviceDisplayMode.processMidi = function(status, data1, data2) {
  // Use note data.
  if (status == status_id_notes) {
    // Ignore if velocity is 0 because it's probably a lift-off.
    if (data2 === 0) {
      return;
    }

    // Switch devices.
    if (data1 >= mapping.secondary.min && data1 <= mapping.secondary.max) {
      m.banks.devices.eight.control.getDevice(data1 - mapping.secondary.min).selectInEditor();
    }

    // Paginate device bank.
    if (data1 == mapping.secondary.pageDown && m.banks.devices.eight.canScrollDown) {
      m.banks.devices.eight.pageIndex++;
      m.banks.devices.eight.control.scrollPageDown();
    }

    if (data1 == mapping.secondary.pageUp) {
      m.banks.devices.eight.pageIndex--;
      m.banks.devices.eight.control.scrollPageUp();
    }
  }

  // Use cc data.
  if (status == status_id_cc) {
    // Send parameter value changes.
    var knob = mapping.knobs.main.indexOf(data1);
    if (knob > -1) {
      m.devices.current.control.getParameter(knob).getAmount().inc(mapping.convertVPot(data2), 128);
    }
  }
};

deviceDisplayMode.flush = function() {
  for (var key in mapping.displayModes) {
    if (mapping.displayModes.hasOwnProperty(key)) {
      if (mapping.displayModes[key] != mapping.displayModes.modules) {
        leds.setSingle(mapping.displayModes[key], 'off');
      }
    }
  }
  leds.setSingle(mapping.displayModes.modules, 'on');

  // Set pagination.
  leds.setSingle(mapping.secondary.pageUp, (m.banks.devices.eight.canScrollUp) ? 'on' : 'off');
  leds.setSingle(mapping.secondary.pageDown, (m.banks.devices.eight.canScrollDown) ? 'on' : 'off');

  var index = m.banks.devices.current.position - (8 * m.banks.devices.eight.pageIndex);

  for (var i = 0; i < 8; i++) {
    // Selected device is within our bank window.
    if (index >= 0 && index < 8) {
      if (index == i) {
        leds.setSingle(mapping.secondary.min + i, 'on');
      }
      else {
        leds.setSingle(mapping.secondary.min + i, 'off');
      }
    }
    else {
      leds.setSingle(mapping.secondary.min + i, 'off');
    }

    messages.writeSingle(m.banks.devices.eight[i].name, messages.position.top[i]);
    messages.writeSingle(m.banks.devices.current.parameters[i].name, messages.position.bottom[i]);
    messages.sendVpotLinear(i, m.banks.devices.current.parameters[i].value);
  }
};
