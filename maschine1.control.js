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
  tracks = host.createMainTrackBank(8, 0, 8);
  scenes = host.createSceneBank(8);
  cTrack = host.createCursorTrack(0, 0);
  cDevice = cTrack.getPrimaryDevice();

  // Set up globals.
  m.trackIndex = 0;
  m.sceneIndex = 0;
  m.stopped = true;
  m.trackLabels = [];
  m.macroName = [];
  m.macroValue = [];
  m.trackRecording = [];
  m.trackRecordingQueued = [];

  // Transport observers.
  transport.getPosition().addTimeObserver('', 3, 1, 1, 0, checkPosition());
  transport.addIsPlayingObserver(checkTransportPlaying());
  transport.addIsRecordingObserver(checkBoolean(null, mapping.nav.rec, null));

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
    tracks.getChannel(i).addNameObserver(6, 'none', getLabelObserverFunc(i, m.trackLabels, messages.position.top[i]));
    // Get track's primary device macro names.
    cDevice.getMacro(i).addLabelObserver(6, 'none', getLabelObserverFunc(i, m.macroName, messages.position.bottom[i]));
    // Get track's primary device macro values.
    cDevice.getMacro(i).getAmount().addValueObserver(13, checkPotValue(i, m.macroValue));
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
  messages.writeMessage(messages.fixLength('Goodbye! :)', 128), messages.position.lineTop);
  messages.writeMessage(messages.fixLength('See you soon! :)', 128), messages.position.lineBottom);
}
