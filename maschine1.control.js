/**
 * Performance focused controller script for Maschine MK1.
 */

// Load API version 1.
loadAPI(1);

// Load includes.
load('utilities/leds.js');
load('utilities/mapping.js');
load('utilities/messages.js');
load('utilities/model.js');
load('modes/Mode.js');
load('modes/global.js');
load('modes/modes.js');
load('modes/displayModes/deviceDisplayMode.js');
load('modes/displayModes/panDisplayMode.js');
load('modes/displayModes/parameterDisplayMode.js');
load('modes/displayModes/trackDisplayMode.js');
load('modes/displayModes/volumeDisplayMode.js');
load('modes/padModes/clipLengthPadMode.js');
load('modes/padModes/duplicatePadMode.js');
load('modes/padModes/keyboardPadMode.js');
load('modes/padModes/keyboardSettingsPadMode.js');
load('modes/padModes/mutePadMode.js');
load('modes/padModes/navigatePadMode.js');
load('modes/padModes/navigateMovePadMode.js');
load('modes/padModes/patternPadMode.js');
load('modes/padModes/scenePadMode.js');
load('modes/padModes/selectPadMode.js');
load('modes/padModes/soloPadMode.js');

// Define the Maschine controller and its midi ports.
host.defineController('Native Instruments', 'Maschine 1 Performance Mode', '1.0', '6e1ae07e-e88e-11e5-9ce9-5e5517507c66', 'steel-track');
host.defineMidiPorts(1, 1);
host.addDeviceNameBasedDiscoveryPair(['Maschine MK1 Controller'], ['Maschine MK1 Controller']);
host.addDeviceNameBasedDiscoveryPair(['Maschine MK1 Virtual Input'], ['Maschine MK1 Virtual Output']);
host.addDeviceNameBasedDiscoveryPair(['Maschine MK1 In'], ['Maschine MK1 Out']);
host.addDeviceNameBasedDiscoveryPair(['Maschine Controller In'], ['Maschine Controller Out']);

// Constants.
var status_id_notes = 144;
var status_id_cc = 176;

/**
 * Initialization function.
 */
function init() {

  // Setup callbacks for receiving midi.
  host.getMidiInPort(0).setMidiCallback(onMidi);
  host.getMidiInPort(0).setSysexCallback(onSysex);
  m.midi.control = host.getMidiInPort(0).createNoteInput('Maschine Pads', '?');
  m.midi.control.setShouldConsumeEvents(false);

  // Buffer flushing because with rapid value changes the controller locks up causing jumps in control changes.
  host.scheduleTask(flushTimerCallback, null, 250);

  // Set up banks and other global objects.
  m.application.control = host.createApplication();
  m.transport.control = host.createTransport();
  m.banks.tracks.eight.control = host.createTrackBank(8, 0, 8);
  m.banks.scenes.eight.control = host.createSceneBank(8);
  m.masterTrack.control = host.createMasterTrack(8);
  m.groove.control = host.createGroove();
  m.banks.tracks.current.control = host.createCursorTrack(4, 16);
  m.banks.devices.current.control = m.banks.tracks.current.control.createCursorDevice();
  m.banks.tracks.sixteen.control = host.createTrackBank(16, 0, 16);
  m.banks.devices.eight.control = m.banks.tracks.current.control.createDeviceBank(8);
  m.banks.tracks.four.control = host.createTrackBank(4, 0, 4);

  // Transport observers.
  m.transport.control.getPosition().addTimeObserver('', 3, 1, 1, 0, m.set(m.transport, 'position'));
  m.transport.control.addIsPlayingObserver(m.set(m.transport, 'isPlaying'));
  m.transport.control.addIsRecordingObserver(m.set(m.transport, 'isRecording'));
  m.transport.control.getTimeSignature().getNumerator().addValueObserver(m.set(m.transport, 'beatsPerBar'));

  // Current track information.
  m.banks.tracks.current.control.addNameObserver(6, 'none', m.set(m.banks.tracks.current, 'name'));
  m.banks.tracks.current.control.getVolume().addValueObserver(13, m.set(m.banks.tracks.current, 'volume'));
  m.banks.tracks.current.control.getPan().addValueObserver(11, m.set(m.banks.tracks.current, 'pan'));
  m.banks.tracks.current.control.getCrossFadeMode().addValueObserver(m.set(m.banks.tracks.current, 'xfade'));
  m.banks.tracks.current.control.getSend(0).addValueObserver(13, m.set(m.banks.tracks.current.sends[0], 'value'));
  m.banks.tracks.current.control.getSend(0).addNameObserver(6, 'none', m.set(m.banks.tracks.current.sends[0], 'name'));
  m.banks.tracks.current.control.getSend(1).addValueObserver(13, m.set(m.banks.tracks.current.sends[1], 'value'));
  m.banks.tracks.current.control.getSend(1).addNameObserver(6, 'none', m.set(m.banks.tracks.current.sends[1], 'name'));
  m.banks.tracks.current.control.getSend(2).addValueObserver(13, m.set(m.banks.tracks.current.sends[2], 'value'));
  m.banks.tracks.current.control.getSend(2).addNameObserver(6, 'none', m.set(m.banks.tracks.current.sends[2], 'name'));
  m.banks.tracks.current.control.getSend(3).addValueObserver(13, m.set(m.banks.tracks.current.sends[3], 'value'));
  m.banks.tracks.current.control.getSend(3).addNameObserver(6, 'none', m.set(m.banks.tracks.current.sends[3], 'name'));

  for (var i = 0; i < 4; i++) {
    m.banks.tracks.four.control.getChannel(i).getClipLauncherSlots().setIndication(true);
    m.banks.tracks.four.control.getChannel(i).getClipLauncherSlots().addHasContentObserver(m.setArray(m.banks.tracks.four[i], 'clipHasContent'));
    m.banks.tracks.four.control.getChannel(i).getClipLauncherSlots().addIsPlayingObserver(m.setArray(m.banks.tracks.four[i], 'clipIsPlaying'));
    m.banks.tracks.four.control.getChannel(i).getClipLauncherSlots().addIsRecordingObserver(m.setArray(m.banks.tracks.four[i], 'clipIsRecording'));
    m.banks.tracks.four.control.getChannel(i).getClipLauncherSlots().addIsRecordingQueuedObserver(m.setArray(m.banks.tracks.four[i], 'clipIsRecordingQueued'));
  }

  for (var i = 0; i < 8; i++) {
    m.banks.tracks.eight.control.getChannel(i).addIsSelectedInMixerObserver(m.set(m.banks.tracks.eight[i], 'isSelected'));
    m.banks.tracks.eight.control.getChannel(i).addNameObserver(6, 'none', m.set(m.banks.tracks.eight[i], 'name'));
    m.banks.tracks.eight.control.getChannel(i).getVolume().addValueObserver(13, m.set(m.banks.tracks.eight[i], 'volume'));
    m.banks.tracks.eight.control.getChannel(i).getPan().addValueObserver(11, m.set(m.banks.tracks.eight[i], 'pan'));
    m.banks.tracks.eight.control.getChannel(i).getVolume().addValueDisplayObserver(6, 'none', m.set(m.banks.tracks.eight[i], 'volumeRaw'));
    m.banks.tracks.eight.control.getChannel(i).getPan().addValueDisplayObserver(6, 'none', m.set(m.banks.tracks.eight[i], 'panRaw'));
    m.banks.devices.eight.control.getDevice(i).addNameObserver(6, 'none', m.set(m.banks.devices.eight[i], 'name'));
    m.banks.devices.eight.control.getDevice(i).addHasSelectedDeviceObserver(m.set(m.banks.devices.eight[i], 'isSelected'));
//    m.banks.devices.current.control.getMacro(i).addLabelObserver(6, 'none', m.set(m.banks.devices.current.macros[i], 'name'));
//    m.banks.devices.current.control.getMacro(i).getAmount().addValueObserver(13, m.set(m.banks.devices.current.macros[i], 'value'));
    m.banks.devices.current.control.getParameter(i).addNameObserver(6, 'none', m.set(m.banks.devices.current.parameters[i], 'name'));
    m.banks.devices.current.control.getParameter(i).addValueObserver(13, m.set(m.banks.devices.current.parameters[i], 'value'));
    m.banks.devices.current.control.getParameter(i).addValueDisplayObserver(6, 'none', m.set(m.banks.devices.current.parameters[i], 'rawValue'));
  }

  for (var i = 0; i < 16; i++) {
    m.banks.tracks.sixteen.control.getChannel(i).addIsSelectedInMixerObserver(m.set(m.banks.tracks.sixteen[i], 'isSelected'));
    m.banks.tracks.sixteen.control.getChannel(i).addNameObserver(6, 'none', m.set(m.banks.tracks.sixteen[i], 'name'));
    m.banks.tracks.sixteen.control.getChannel(i).getMute().addValueObserver(m.set(m.banks.tracks.sixteen[i], 'isMuted'));
    m.banks.tracks.sixteen.control.getChannel(i).getSolo().addValueObserver(m.set(m.banks.tracks.sixteen[i], 'isSoloed'));
    m.banks.tracks.sixteen.control.getChannel(i).getArm().addValueObserver(m.set(m.banks.tracks.sixteen[i], 'isArmed'));
    m.banks.tracks.sixteen.control.getChannel(i).getClipLauncherSlots().addHasContentObserver(m.setArray(m.banks.tracks.sixteen[i], 'clipHasContent'));
    m.banks.tracks.sixteen.control.getChannel(i).getClipLauncherSlots().addIsPlayingObserver(m.setArray(m.banks.tracks.sixteen[i], 'clipIsPlaying'));
    m.banks.tracks.sixteen.control.getChannel(i).getClipLauncherSlots().addIsRecordingObserver(m.setArray(m.banks.tracks.sixteen[i], 'clipIsRecording'));
    m.banks.tracks.sixteen.control.getChannel(i).getClipLauncherSlots().addIsRecordingQueuedObserver(m.setArray(m.banks.tracks.sixteen[i], 'clipIsRecordingQueued'));
  }

  // Check if banks can be paginated based on mode.
  m.banks.tracks.four.control.addCanScrollChannelsDownObserver(m.set(m.banks.tracks.four, 'canScrollChannelsDown'));
  m.banks.tracks.four.control.addCanScrollChannelsUpObserver(m.set(m.banks.tracks.four, 'canScrollChannelsUp'));
  m.banks.tracks.four.control.addCanScrollScenesDownObserver(m.set(m.banks.tracks.four, 'canScrollScenesDown'));
  m.banks.tracks.four.control.addCanScrollScenesUpObserver(m.set(m.banks.tracks.four, 'canScrollScenesUp'));
  m.banks.tracks.eight.control.addCanScrollChannelsDownObserver(m.set(m.banks.tracks.eight, 'canScrollDown'));
  m.banks.tracks.eight.control.addCanScrollChannelsUpObserver(m.set(m.banks.tracks.eight, 'canScrollUp'));
  m.banks.tracks.sixteen.control.addCanScrollChannelsDownObserver(m.set(m.banks.tracks.sixteen, 'canScrollDown'));
  m.banks.tracks.sixteen.control.addCanScrollChannelsUpObserver(m.set(m.banks.tracks.sixteen, 'canScrollUp'));
  m.banks.tracks.sixteen.control.addCanScrollScenesDownObserver(m.set(m.banks.tracks.sixteen, 'canScrollScenesDown'));
  m.banks.tracks.sixteen.control.addCanScrollScenesUpObserver(m.set(m.banks.tracks.sixteen, 'canScrollScenesUp'));
  m.banks.devices.eight.control.addCanScrollDownObserver(m.set(m.banks.devices.eight, 'canScrollDown'));
  m.banks.devices.eight.control.addCanScrollUpObserver(m.set(m.banks.devices.eight, 'canScrollUp'));
  m.banks.scenes.eight.control.addSceneCountObserver(m.set(m.banks.scenes, 'count'));
  m.banks.devices.current.control.addPositionObserver(m.set(m.banks.devices.current, 'position'));

  // Parameter page names.
  m.banks.devices.current.control.addPageNamesObserver(m.setArguments(m.banks.devices.current.parameters, 'pageNames'));

  // Set initial modes and initialize.
  m.modes.pad = scenePadMode;
  m.modes.display = trackDisplayMode;
  m.modes.global= global;
  modes.init();

  println('Successfully initialized the Maschine.');
}

function flushTimerCallback() {
  // If flushing is false, then trigger a flush to ensure the controller is up to date.
  if (m.flush == false) {
    modes.flush();
  }
  m.flush = true;
  host.scheduleTask(flushTimerCallback, null, 250);
}

/**
 * Flush to the external controller after observers register changes.
 */
function flush() {
  // To avoid flooding the controller with messages while rapidly changing values, we set a timer to allow flushing.
  if (m.flush == true) {
    modes.flush();
    m.flush = false;
  }
}

/**
 * Exit controller.
 *
 * Perform cleanup and turn off all leds.
 */
function exit() {
  // Clear the display with a goodbye message.
  messages.writeMessage(messages.fixLength('Goodbye!', 128), messages.position.lineTop);
  messages.writeMessage(messages.fixLength('See you soon :)', 128), messages.position.lineBottom);

  // Turn off all leds.
  leds.setAll('off');
}

/**
 * React to all midi input.
 */
function onMidi(status, data1, data2) {

//   println('status: ' + status);
//   println('data1: ' + data1);
//   println('data2: ' + data2);

  modes.processMidi(status, data1, data2);
}

/**
 * React to all sysex input.
 */
function onSysex(data) {
  printSysex(data);
}
