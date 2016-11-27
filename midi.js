/**
 * React to all midi input.
 */
function onMidi(status, data1, data2) {

  // println('status: ' + status);
  // println('data1: ' + data1);
  // println('data2: ' + data2);

  modes.processMidi(status, data1, data2);

  //   // Check if note falls within secondary range.
  //   if (data1 >= mapping.secondary.min && data1 <= mapping.secondary.max) {
  //     if (m.topMode == mapping.topModes.track) {
  //       m.trackSelectedIndex = data1 - mapping.secondary.min;
  //       tracks.getChannel(m.trackSelectedIndex).selectInMixer();
  //     }
  //     else if (m.topMode == mapping.topModes.parameter) {
  //       m.parameterPageSelectedIndex = data1 - mapping.secondary.min;
  //       devices.getDevice(m.parameterPageSelectedIndex).setParameterPage((m.parameterPageBank * 8) + m.parameterPageSelectedIndex);
  //     }
  //     else if (m.topMode == 'devices') {
  //       m.deviceSelectedIndex = data1 - mapping.secondary.min;
  //       cDevice = devices.getDevice(m.deviceSelectedIndex);
  //       m.parameterPageBank = 0;
  //       cDevice.selectInEditor();
  //     }
  //   }
  //
  //   // Page tracks up and down.
  //   if (data1 == mapping.secondary.pageDown) {
  //     if (m.topMode == mapping.topModes.track) {
  //       tracks.scrollChannelsPageDown();
  //     }
  //     else if (m.topMode == mapping.topModes.parameter) {
  //       // Since there's no paging built into parameters, do it manually.
  //       // Check if we should page based on number of pages.
  //       if ((m.parameterPageBank + 1) * 8 <= m.parameterPageName.length) {
  //         m.parameterPageBank++;
  //         var startIndex = m.parameterPageBank * 8;
  //         // Initialize all labels and values.
  //         for (var i = startIndex; i < startIndex + 8; i++) {
  //           messages.writeSingle(m.parameterPageName[i], messages.position.top[i]);
  //         }
  //       }
  //     }
  //     else if (m.topMode == 'devices') {
  //       devices.scrollPageDown();
  //     }
  //   }
  //
  //   if (data1 == mapping.secondary.pageUp) {
  //     if (m.topMode == mapping.topModes.track) {
  //       tracks.scrollChannelsPageUp();
  //     }
  //     else if (m.topMode == mapping.topModes.parameter) {
  //       // Since there's no paging built into parameters, do it manually.
  //       // Check if we should page based on number of pages.
  //       if (m.parameterPageBank > 0) {
  //         m.parameterPageBank--;
  //         var startIndex = m.parameterPageBank * 8;
  //         // Initialize all labels and values.
  //         for (var i = startIndex; i < startIndex + 8; i++) {
  //           messages.writeSingle(m.parameterPageName[i], messages.position.top[i]);
  //         }
  //         if (m.parameterPageBank == 0) {
  //           leds.setSingle(mapping.secondary.pageUp, 'off');
  //         }
  //       }
  //     }
  //     else if (m.topMode == 'devices') {
  //       devices.scrollPageUp();
  //     }
  //   }
  // }
  //
  // // Set track mode.
  // if (data1 == mapping.topModes.track) {
  //   m.topMode = mapping.topModes.track;
  //   leds.setSingle(mapping.topModes.parameter, 'off');
  //   leds.setSingle(m.topModes.track, 'on');
  //
  //   // Initialize all labels and values.
  //   for (var i = 0; i < 8; i++) {
  //     messages.writeSingle(m.trackLabel[i], messages.position.top[i]);
  //     messages.writeSingle(m.trackName[i], messages.position.bottom[i]);
  //     messages.sendVpotLinear(i, m.trackValue[i]);
  //   }
  // }
  //
  // // Set parameter mode.
  // if (data1 == mapping.topModes.parameter) {
  //
  //   // Toggle device and parameter mode
  //   if (m.topMode == mapping.topModes.parameter) {
  //     m.topMode = 'devices';
  //     // Write device names.
  //     for (var i = 0; i < 8; i++) {
  //       messages.writeSingle(m.deviceName[i], messages.position.top[i]);
  //     }
  //   }
  //   else if (m.topMode == 'devices') {
  //     m.topMode = mapping.topModes.parameter();
  //     for (var i = 0; i < 8; i++) {
  //       messages.writeSingle(m.parameterPageName[i], messages.position.top[i]);
  //     }
  //   }
  //   else {
  //     leds.setSingle(mapping.topModes.track, 'off');
  //     leds.setSingle(mapping.topModes.parameter, 'on');
  //     m.topMode = mapping.topModes.parameter;
  //     for (var i = 0; i < 8; i++) {
  //       messages.writeSingle(m.parameterName[i], messages.position.bottom[i]);
  //       messages.sendVpotLinear(i, m.parameterValue[i]);
  //     }
  //   }
  // }
}

/**
 * React to all sysex input.
 */
function onSysex(data) {
  printSysex(data);
}
