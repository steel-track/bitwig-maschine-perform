/**
 * Helper methods for iterating over multiple modes.
 */
var modes = {
  /**
   * Run all active modes' init functions.
   */
  init: function() {
    m.modes.global.init();
    m.modes.display.init();
    m.modes.pad.init();
  },

  /**
   * Run all active modes' flush functions.
   */
  flush: function() {
    m.modes.global.flush();
    m.modes.display.flush();
    m.modes.pad.flush();
  },

  /**
   * Run all active modes' forceFlush functions if they exist.
   */
  forceFlush: function() {
    if (typeof m.modes.global.forceFlush === 'function') {
      m.modes.global.forceFlush();
    }

    if (typeof m.modes.display.forceFlush === 'function') {
      m.modes.display.forceFlush();
    }

    if (typeof m.modes.pad.forceFlush === 'function') {
      m.modes.pad.forceFlush();
    }
  },

  /**
   * Run all active modes' midi processing functions.
   */
  processMidi: function(status, data1, data2) {
    m.modes.global.processMidi(status, data1, data2);
    m.modes.display.processMidi(status, data1, data2);
    m.modes.pad.processMidi(status, data1, data2);
  }
};
