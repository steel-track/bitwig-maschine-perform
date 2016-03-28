/**
 * Allows the controller to be set into different modes.
 */

function encoderModes(data1, data2) {
  // Check if our main knob bank was used.
  var main_knob = mapping.knobs.main.indexOf(data1);
  if (main_knob > -1) {
    // Switch based on macro mode.
    switch (m.mode) {
      // Macro mode.
      case mapping.modes.macro:
        // Change value of macro based on knob index.
        cDevice.getMacro(main_knob).getAmount().inc(mapping.convertVPot(data2), 128);
        break;
      case mapping.modes.track:
        switch (main_knob) {
          case 0:
            // Volume.
            cTrack.getVolume().inc(mapping.convertVPot(data2), 128);
            break;
          case 1:
            // Pan.
            cTrack.getPan().inc(mapping.convertVPot(data2), 128);
            break;
          case 2:
            // Macro 1.
            cDevice.getMacro(0).getAmount().inc(mapping.convertVPot(data2), 128);
            break;
          case 3:
            // Macro 2.
            cDevice.getMacro(1).getAmount().inc(mapping.convertVPot(data2), 128);
            break;
          case 4:
            // Send 1.
            cTrack.getSend(0).inc(mapping.convertVPot(data2), 128);
            break;
          case 5:
            // Send 2.
            cTrack.getSend(1).inc(mapping.convertVPot(data2), 128);
            break;
          case 6:
            // Send 3.
            cTrack.getSend(2).inc(mapping.convertVPot(data2), 128);
            break;
          case 7:
            // Send 4.
            cTrack.getSend(3).inc(mapping.convertVPot(data2), 128);
            break;
        }
    }
  }
}
