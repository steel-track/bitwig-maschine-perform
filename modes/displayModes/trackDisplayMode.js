var trackDisplayMode = new Mode();

trackDisplayMode.id = function() {
  return 'track';
};

trackDisplayMode.init = function() {
  m.trackName = ['Volume', 'Pan', 'Macro1', 'Macro2', 'Send1', 'Send2', 'Send3', 'Send4'];
};

trackDisplayMode.processMidi = function() {

};

trackDisplayMode.flush = function() {

};
