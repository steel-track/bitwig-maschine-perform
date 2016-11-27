/**
 * Store state from observers.
 */

// Define globally scoped object to hold observer states.
var m = {};

// Setup storage for our observers.
m.device = [];
m.devices = {};
m.scenes = {};
m.track = [];
m.tracks = {};
m.transport = {};
m.mode = {};

for (var i = 0; i < 8; i++) {
  m.device[i] = {};
  m.device[i].macro = [];
  m.track[i] = {};
  m.track[i].sends = [];
}

for (var j = 0; j < 8; j++) {
  m.device[i].macro[j] = {};
  m.device[i].parameter[j] = {};
}

var callbacks = {
  tracks: {
    track: {
      clipLauncher: {
        isPlaying: function(i) {
          return function(isPlaying) {
            m.track[i].clipIsPlaying = isPlaying;
          }
        },
        isRecording: function(i) {
          return function(isRecording) {
            m.track[i].clipIsRecording = isRecording;
          }
        },
        isRecordingQueued: function(i) {
          return function(isRecordingQueued) {
            m.track[i].clipIsRecordingQueued = isRecordingQueued;
          }
        }
      },
      getArm: function (i) {
        return function(isArmed) {
          m.track[i].isArmed = isArmed;
        }
      },
      isSelected: function (i) {
        return function(isSelected) {
          m.track[i].isSelected = isSelected;
        }
      },
      name: function (i) {
        return function(name) {
          m.track[i].name = name;
        }
      },
      volume: function(i) {
        return function(volume) {
          m.track[i].volume = volume;
        }
      },
      pan: function(i) {
        return function(pan) {
          m.track[i].pan = pan;
        }
      },
      sends: function(i, j) {
        return function(sendAmount) {
          m.track[i].sends[j] = sendAmount;
        }
      }
    },
    scenes: {
      canScrollDown: function() {
        return function(canScroll) {
          m.scenes.canScrollDown = canScroll;
        }
      },
      canScrollUp: function() {
        return function(canScroll) {
          m.scenes.canScrollUp = canScroll;
        }
      }
    },
    canScrollDown: function() {
      return function(canScroll) {
        m.tracks.canScrollDown = canScroll;
      }
    },
    canScrollUp: function() {
      return function(canScroll) {
        m.tracks.canScrollUp = canScroll;
      }
    }
  },
  devices: {
    device: {
      name: function(i) {
        return function(name) {
          m.device[i] = name;
        }
      },
      parameters: {
        pageNames: function(i) {
          return function(names) {
            m.device[i].parameterPageNames = names;
          }
        },
        parameter: {
          name: function(i, j) {
            return function(name) {
              m.device[i].parameter[j].name = name;
            }
          },
          value: function(i, j) {
            return function(value) {
              m.device[i].parameter[j].value = value;
            }
          }
        }
      },
      macros: {
        macro: {
          name: function (i, j) {
            return function(name) {
              m.track[i].macro[j].name = name;
            }
          },
          value: function (i, j) {
            return function(value) {
              m.track[i].macro[j].value = value;
            }
          }
        }
      }
    },
    canScrollDown: function() {
      return function(canScroll) {
        m.devicesCanScrollDown = canScroll;
      }
    },
    canScrollUp: function() {
      return function(canScroll) {
        m.devicesCanScrollUp = canScroll;
      }
    }
  },
  transport: {
    position: function() {
      return function(position) {
        m.transport.position = position;
      }
    },
    isPlaying: function() {
      return function(playing) {
        m.transport.isPlaying = playing;
      }
    },
    isRecording: function() {
      return function(recording) {
        m.transport.isRecording = recording;
      }
    }
  }
};