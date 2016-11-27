/**
 * Define interface for all modes.
 */
function Mode() {}

/**
 * Set an ID for the mode.
 *
 * @return {string} the id of the mode.
 */
Mode.prototype.id = function() {};

/**
 * Callback to initialize the mode.
 */
Mode.prototype.init = function() {};

/**
 * Callback to process midi inputs.
 *
 * @param {int} status the status byte
 * @param {int} data1 the data1 value
 * @param {int} data2 the data2 value
 */
Mode.prototype.processMidi = function(status, data1, data2) {};

/**
 * Callback that sends information to the controller on global flush().
 */
Mode.prototype.flush = function() {};