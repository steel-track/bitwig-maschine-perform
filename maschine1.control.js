/**
 * Performance focused controller script for Maschine MK1.
 */

// Load API version 1.
loadAPI(1);
load('leds.js');
load('mapping.js');
load('messages.js');
load('midi.js');
load('state.js');

// Load all mode includes.
// TODO: include all files!
load('modes/mode.js');
load('modes/global.js');

// Define the Maschine controller and its midi ports.
host.defineController('Native Instruments', 'Maschine 1 Performance Mode', '1.0', '6e1ae07e-e88e-11e5-9ce9-5e5517507c66', 'steel-track');
host.defineMidiPorts(1, 1);
host.addDeviceNameBasedDiscoveryPair(['Maschine MK1 Controller'], ['Maschine MK1 Controller']);
host.addDeviceNameBasedDiscoveryPair(['Maschine MK1 Virtual Input'], ['Maschine MK1 Virtual Output']);
host.addDeviceNameBasedDiscoveryPair(['Maschine MK1 In'], ['Maschine MK1 Out']);

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
  masterTrack = host.createMasterTrack(8);
  groove = host.createGroove();
  devices = cTrack.createDeviceBank(8);

  // Transport observers.
  transport.getPosition().addTimeObserver('', 3, 1, 1, 0, callbacks.transport.position());
  transport.addIsPlayingObserver(callbacks.transport.isPlaying());
  transport.addIsRecordingObserver(callbacks.transport.isRecording());

  for (var i = 0; i < 8; i++) {

    tracks.getChannel(i).getClipLauncherSlots().addIsPlayingObserver(callbacks.tracks.track.clipLauncher.isPlaying(i));
    tracks.getChannel(i).getClipLauncherSlots().addIsRecordingObserver(callbacks.tracks.track.clipLauncher.isRecording(i));
    tracks.getChannel(i).getClipLauncherSlots().addIsRecordingQueuedObserver(callbacks.tracks.track.clipLauncher.isRecordingQueued(i));
    tracks.getChannel(i).getArm().addValueObserver(callbacks.tracks.track.getArm(i));
    tracks.getChannel(i).addIsSelectedInMixerObserver(callbacks.tracks.track.isSelected(i));
    tracks.getChannel(i).addNameObserver(6, 'none', callbacks.tracks.track.name(i));
    tracks.getChannel(i).getVolume().addValueObserver(13, callbacks.tracks.track.volume(i));
    tracks.getChannel(i).getPan().addValueObserver(13, callbacks.tracks.track.pan(i));

    devices.getDevice(i).addNameObserver(6, 'none', callbacks.devices.device.name(i));
    devices.getDevice(i).addPageNamesObserver(callbacks.devices.device.parameters.pageNames(i));

    for (var j = 0; j < 8; j++) {

      tracks.getChannel(i).getSend(j).addValueObserver(13, callbacks.tracks.track.sends(i, j));
      devices.getDevice(i).getMacro(j).addLabelObserver(6, 'none', callbacks.devices.device.macros.macro.name(i, j));
      devices.getDevice(i).getMacro(j).getAmount().addValueObserver(13, callbacks.device.macros.macro.value(i, j));
      devices.getDevice(i).getParameter(j).addLabelObserver(6, 'none', callbacks.devices.device.parameters.parameter.name(i, j));
      devices.getDevice(i).getParameter(j).getAmount().addValueObserver(13, callbacks.devices.device.parameters.parameter.value(i, j));

    }
  }

  // Check if banks can be paginated based on mode.
  tracks.addCanScrollChannelsDownObserver(callbacks.tracks.canScrollDown());
  tracks.addCanScrollChannelsUpObserver(callbacks.tracks.canScrollUp());
  tracks.addCanScrollScenesDownObserver(callbacks.tracks.scenes.canScrollDown());
  tracks.addCanScrollScenesUpObserver(callbacks.tracks.scenes.canScrollUp());
  devices.addCanScrollDownObserver(callbacks.devices.canScrollDown());
  devices.addCanScrollUpObserver(callbacks.devices.canScrollUp());

  // Set initial modes and initialize.
  m.mode.pad = selectPadMode;
  m.mode.display = trackDisplayMode;
  m.mode.global= global;
  modes.init();

  println('Successfully initialized the Maschine.');
}

/**
 * Flush to the external controller after observers register changes.
 */
function flush() {
  modes.flush();
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
