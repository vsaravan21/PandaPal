/**
 * Explicit Expo config entry so Expo always receives config data.
 * Fixes "Config file contains no configuration data" when app.json is not picked up.
 */
module.exports = require('./app.json');
