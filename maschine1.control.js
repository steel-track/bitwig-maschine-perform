/**
 * Performance focused controller script for Maschine MK1.
 */

// Load API version 1.
loadAPI(1);
load('callbacks.js');
load('leds.js');
load('mapping.js');
load('messages.js');
load('midi.js');
load('modes.js');

// Define the Maschine controller and its midi ports.
host.defineController('Native Instruments', 'Maschine 1 Performance Mode', '1.0', '6e1ae07e-e88e-11e5-9ce9-5e5517507c66', 'steel-track');
host.defineMidiPorts(1, 1);
host.addDeviceNameBasedDiscoveryPair(["Maschine MK1 Controller"], ["Maschine MK1 Controller"]);
host.addDeviceNameBasedDiscoveryPair(["Maschine MK1 Virtual Input"], ["Maschine MK1 Virtual Output"]);
host.addDeviceNameBasedDiscoveryPair(["Maschine MK1 In"], ["Maschine MK1 Out"]);

// Define globally scoped object so we don't use 'this'.
var m = {};

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

  // Set up banks and other global objects.
  application = host.createApplication();
  transport = host.createTransport();
  tracks = host.createTrackBank(8, 4, 8);
  scenes = host.createSceneBank(8);
  cTrack = host.createCursorTrack(4, 8);
  cDevice = cTrack.getPrimaryDevice();
  masterTrack = host.createMasterTrack(8);
  groove = host.createGroove();

  // Set up globals.
  m.trackArmedIndex = 0;
  m.trackSelectedIndex = 0;
  m.sceneIndex = 0;
  m.stopped = true;
  m.clipLength = 16;
  m.setClipLength = true;
  m.trackLabels = [];
  m.macroName = [];
  m.macroValue = [0, 0, 0, 0, 0, 0, 0, 0];
  m.trackRecording = [];
  m.trackRecordingQueued = [];
  m.mode = mapping.modes.track;
  m.trackName = [];
  m.trackName[0] = 'Volume';
  m.trackName[1] = 'Pan';
  m.trackName[2] = 'Macro1';
  m.trackName[3] = 'Macro2';
  m.trackName[4] = 'Send1';
  m.trackName[5] = 'Send2';
  m.trackName[6] = 'Send3';
  m.trackName[7] = 'Send4';
  m.trackValue = [0, 0, 0, 0, 0, 0, 0, 0];

  // Transport observers.
  transport.getPosition().addTimeObserver('', 3, 1, 1, 0, checkPosition());
  transport.addIsPlayingObserver(checkTransportPlaying());
  transport.addIsRecordingObserver(checkBoolean(null, mapping.nav.rec, null));

  scenes.addCanScrollDownObserver(checkBoolean(null, mapping.nav.right, null));
  scenes.addCanScrollUpObserver(checkBoolean(null, mapping.nav.left, null));

  // Track bank observers. All clips are at the intersection of the current scene index.
  for (var i = 0; i < 8; i++) {
    // Check if track's clip is playing.
    tracks.getChannel(i).getClipLauncherSlots().addIsPlayingObserver(checkBooleanClip(i, mapping.trackRecord.min + i, null));
    // Check if track's clip is recording.
    tracks.getChannel(i).getClipLauncherSlots().addIsRecordingObserver(checkBooleanClip(i, null, m.trackRecording));
    // Check if track's clip is queued to record.
    tracks.getChannel(i).getClipLauncherSlots().addIsRecordingQueuedObserver(checkBooleanClip(i, null, m.trackRecordingQueued));
    // Check if track is armed.
    tracks.getChannel(i).getArm().addValueObserver(checkBoolean(i, mapping.trackArm.min + i, null));
    // Check if track is selected in the mixer.
    tracks.getChannel(i).addIsSelectedInMixerObserver(checkBoolean(i, mapping.secondary.min + i, null));
    // Get track's label.
    tracks.getChannel(i).addNameObserver(6, 'none', getLabelObserverFunc(i, m.trackLabels, messages.position.top[i], null));
    // Get track's primary device macro names.
    cDevice.getMacro(i).addLabelObserver(6, 'none', getLabelObserverFunc(i, m.macroName, messages.position.bottom[i], mapping.modes.macro));
    // Get track's primary device macro values.
    cDevice.getMacro(i).getAmount().addValueObserver(13, checkPotValue(i, m.macroValue, mapping.modes.macro));
  }

  // Check if tracks can be paginated.
  tracks.addCanScrollChannelsDownObserver(checkBoolean(null, mapping.secondary.pageDown, null));
  tracks.addCanScrollChannelsUpObserver(checkBoolean(null, mapping.secondary.pageUp, null));

  // Track mode observers.
  cTrack.getVolume().addValueObserver(13, checkPotValue(0, m.trackValue, mapping.modes.track));
  cTrack.getPan().addValueObserver(13, checkPotValue(1, m.trackValue, mapping.modes.track));
  cDevice.getMacro(0).getAmount().addValueObserver(13, checkPotValue(2, m.trackValue, mapping.modes.track));
  cDevice.getMacro(1).getAmount().addValueObserver(13, checkPotValue(3, m.trackValue, mapping.modes.track));
  cTrack.getSend(0).addValueObserver(13, checkPotValue(4, m.trackValue, mapping.modes.track));
  cTrack.getSend(1).addValueObserver(13, checkPotValue(5, m.trackValue, mapping.modes.track));
  cTrack.getSend(2).addValueObserver(13, checkPotValue(6, m.trackValue, mapping.modes.track));
  cTrack.getSend(3).addValueObserver(13, checkPotValue(7, m.trackValue, mapping.modes.track));

  // Set leds to default that don't have observers.
  leds.setSingle(m.mode, 'on');
  var state = (m.setClipLength) ? 'on' : 'off';
  leds.setSingle(mapping.nav.setClipLength, state);
  leds.setSingle(mapping.clipLength.triggers[m.clipLength], state);

  // Initialize all labels and values for track mode.
  for (var i = 0; i < 8; i++) {
    messages.writeSingle(m.trackName[i], messages.position.bottom[i]);
    messages.sendVpotLinear(i, m.trackValue[i]);
  }

  println('Successfully initialized the Maschine.');
}

/**
 * Exit controller.
 *
 * Perform cleanup and turn off all leds.
 */
function exit() {
  // Turn off all leds.
  leds.setAll('off');

  // Clear the display with a goodbye message.
  messages.writeMessage(messages.fixLength('Goodbye!', 128), messages.position.lineTop);
  messages.writeMessage(messages.fixLength('See you soon :)', 128), messages.position.lineBottom);
}
