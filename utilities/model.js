/**
 * Store state from observers.
 */

// Define globally scoped object to hold observer states.
var m = {
  set: function(o, property) {
    return function(data) {
      o[property] = data;
    }
  },

  setArray: function(o, property) {
    return function(index, data) {
      o[property][index] = data;
    }
  },

  setArguments: function(o, property) {
    return function() {
      o[property] = [];
      for(var i = 0; i < arguments.length; i++) {
        o[property][i] = arguments[i];
      }
    }
  },

  midi: {
    control: null
  },

  modes: {
    global: null,
    pad: null,
    display: null
  },

  application: {
    control: null
  },

  masterTrack: {
    control: null
  },

  groove: {
    control: null
  },

  setClipLength: {
    isEnabled: false,
    length: 1
  },

  keyboard: {
    octave: 4,
    rootNote: 0,
    scaleType: 'chromatic'
  },

  banks: {
    tracks: {
      current: new TrackModel(),
      lastArmed: new TrackModel(),
      four: {
        0: new TrackModel(),
        1: new TrackModel(),
        2: new TrackModel(),
        3: new TrackModel(),
        canScrollChannelsUp: false,
        canScrollChannelsDown: false,
        canScrollScenesUp: false,
        canScrollScenesDown: false,
        control: null
      },
      eight: {
        0: new TrackModel(),
        1: new TrackModel(),
        2: new TrackModel(),
        3: new TrackModel(),
        4: new TrackModel(),
        5: new TrackModel(),
        6: new TrackModel(),
        7: new TrackModel(),
        canScrollUp: false,
        canScrollDown: false,
        control: null
      },
      sixteen: {
        0: new TrackModel(),
        1: new TrackModel(),
        2: new TrackModel(),
        3: new TrackModel(),
        4: new TrackModel(),
        5: new TrackModel(),
        6: new TrackModel(),
        7: new TrackModel(),
        8: new TrackModel(),
        9: new TrackModel(),
        10: new TrackModel(),
        11: new TrackModel(),
        12: new TrackModel(),
        13: new TrackModel(),
        14: new TrackModel(),
        15: new TrackModel(),
        pageIndex: 0,
        channelIndex: 0,
        pageChannelSubIndex: 0,
        sceneIndex: 0,
        activeScenePageIndex: 0,
        pageSceneIndex: 0,
        pageSceneSubIndex: 0,
        canScrollUp: false,
        canScrollDown: false,
        canScrollScenesUp: false,
        canScrollScenesDown: false,
        control: null
      }
    },
    devices: {
      current: new DeviceModel(),
      eight: {
        0: new DeviceModel(),
        1: new DeviceModel(),
        2: new DeviceModel(),
        3: new DeviceModel(),
        4: new DeviceModel(),
        5: new DeviceModel(),
        6: new DeviceModel(),
        7: new DeviceModel(),
        canScrollUp: false,
        canScrollDown: false,
        pageIndex: 0,
        control: null
      }
    },
    scenes: {
      count: 0,
      oldCount: 0,
      current: {
        index: 0
      },
      eight: {
        scrollPosition: 0,
        0: {
          isSelected: false
        },
        1: {
          isSelected: false
        },
        2: {
          isSelected: false
        },
        3: {
          isSelected: false
        },
        4: {
          isSelected: false
        },
        5: {
          isSelected: false
        },
        6: {
          isSelected: false
        },
        7: {
          isSelected: false
        },
        canScrollUp: false,
        canScrollDown: false,
        control: null
      },
      sixteen: {
        canScrollUp: false,
        canScrollDown: false,
        control: null
      }
    }
  },

  transport: {
    position: '',
    isPlaying: false,
    isRecording: false,
    beatsPerBar: 4,
    control: null
  }
};

function TrackModel() {
  this.clipIsPlaying = [];
  this.clipIsRecording = [];
  this.clipIsRecordingQueued = [];
  this.clipHasContent = [];
  this.isArmed = false;
  this.isSelected = false;
  this.isSoloed = false;
  this.isMuted = false;
  this.name = '';
  this.volume = 0;
  this.volumeRaw = 0;
  this.pan = 0;
  this.xfade = 'AB';
  this.sends = [
    {
      value: 0
    },
    {
      value: 0
    },
    {
      value: 0
    },
    {
      value: 0
    },
    {
      value: 0
    },
    {
      value: 0
    },
    {
      value: 0
    },
    {
      value: 0
    }
  ];
  this.control = null
}

function DeviceModel() {
  this.name = '';
  this.isSelected = false;
  this.position = 0;
  this.parameters = {
    0: {
      name: '',
        value: 0
    },
    1: {
      name: '',
        value: 0
    },
    2: {
      name: '',
        value: 0
    },
    3: {
      name: '',
        value: 0
    },
    4: {
      name: '',
        value: 0
    },
    5: {
      name: '',
        value: 0
    },
    6: {
      name: '',
        value: 0
    },
    7: {
      name: '',
        value: 0
    },
    page: 0,
    index: 0,
    pageNames: []
  };
  this.macros = [
    {
      name: '',
      value: 0
    },
    {
      name: '',
      value: 0
    },
    {
      name: '',
      value: 0
    },
    {
      name: '',
      value: 0
    },
    {
      name: '',
      value: 0
    },
    {
      name: '',
      value: 0
    },
    {
      name: '',
      value: 0
    },
    {
      name: '',
      value: 0
    }
  ];
  this.control = null;
}
