/**
 * Helper methods for iterating over multiple modes.
 */
var modes = {
  /**
   * Run all active modes' init functions.
   */
  init: function() {
    for (var key in m.mode) {
      if (m.mode.hasOwnProperty(key)) {
        key.init();
      }
    }
  },

  /**
   * Run all active modes' flush functions.
   */
  flush: function() {
    for (var key in m.mode) {
      if (m.mode.hasOwnProperty(key)) {
        key.flush();
      }
    }
  },

  /**
   * Run all active modes' midi processing functions.
   */
  processMidi: function(status, data1, data2) {
    for (var key in m.mode) {
      if (m.mode.hasOwnProperty(key)) {
        key.processMidi(status, data1, data2);
      }
    }
  }
};