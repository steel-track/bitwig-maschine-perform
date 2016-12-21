var parameterDisplayMode = new Mode();

parameterDisplayMode.id = function() {
  return 'parameter';
};

parameterDisplayMode.init = function() {
  if (m.modes.display.id() != 'parameter') {
    m.modes.display = parameterDisplayMode;
    m.banks.devices.current.parameters.index = 0;
    m.banks.devices.current.parameters.page = 0;
  }
  else {
    m.modes.display = deviceDisplayMode;
  }

};

parameterDisplayMode.processMidi = function(status, data1, data2) {
  // Use note data.
  if (status == status_id_notes) {
    // Ignore if velocity is 0 because it's probably a lift-off.
    if (data2 === 0) {
      return;
    }

    // Switch parameter pages.
    if (data1 >= mapping.secondary.min && data1 <= mapping.secondary.max) {
      var index = (m.banks.devices.current.parameters.page * 8) + (data1 - mapping.secondary.min);
      if (m.banks.devices.current.parameters.pageNames.length > index) {
        m.banks.devices.current.parameters.index = index;
        m.banks.devices.current.control.setParameterPage(m.banks.devices.current.parameters.index);
      }
    }


    // Since there's no paging built into parameters, do it manually.
    if (data1 == mapping.secondary.pageUp) {
      if (m.banks.devices.current.parameters.page > 0) {
        m.banks.devices.current.parameters.page--;
      }
    }

    if (data1 == mapping.secondary.pageDown) {
      //Check if we should page based on number of pages.
      if ((m.banks.devices.current.parameters.page + 1) * 8 <= m.banks.devices.current.parameters.pageNames.length) {
        m.banks.devices.current.parameters.page++;
      }
    }
  }

  // Use cc data.
  if (status == status_id_cc) {
    // Send parameter value changes.
    var knob = mapping.knobs.main.indexOf(data1);
    if (knob > -1) {
      m.banks.devices.current.control.getParameter(knob).inc(mapping.convertVPot(data2), 128);
    }
  }
};

parameterDisplayMode.flush = function() {
  // Set mode leds.
  for (var key in mapping.displayModes) {
    if (mapping.displayModes.hasOwnProperty(key)) {
      if (mapping.displayModes[key] != mapping.displayModes.modules) {
        leds.setSingle(mapping.displayModes[key], 'off');
      }
    }
  }
  leds.setSingle(mapping.displayModes.modules, 'on');

  if (m.banks.devices.current.parameters.page == 0) {
    leds.setSingle(mapping.secondary.pageUp, 'off');
  }
  else {
    leds.setSingle(mapping.secondary.pageUp, 'on');
  }

  if (m.banks.devices.current.parameters.pageNames != null && (m.banks.devices.current.parameters.page + 1) * 8 < m.banks.devices.current.parameters.pageNames.length) {
    leds.setSingle(mapping.secondary.pageDown, 'on');
  }
  else {
    leds.setSingle(mapping.secondary.pageDown, 'off');
  }

  var activeIndex = m.banks.devices.current.parameters.index - (m.banks.devices.current.parameters.page * 8);

  for (var i = 0; i < 8; i++) {
    // Set active page.
    if (i == activeIndex) {
      leds.setSingle(mapping.secondary.min + activeIndex, 'on');
    }
    else {
      leds.setSingle(mapping.secondary.min + i, 'off');
    }

    messages.writeSingle(m.banks.devices.current.parameters.pageNames[i + (m.banks.devices.current.parameters.page * 8)], messages.position.top[i]);
    messages.writeSingle(m.banks.devices.current.parameters[i].name, messages.position.bottom[i]);
    messages.sendVpotLinear(i, m.banks.devices.current.parameters[i].value);
  }
};
