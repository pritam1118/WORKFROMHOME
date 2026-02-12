const cds = require('@sap/cds');

const registerHooks = require('./requests.hooks');
const registerActions = require('./requests.actions');

module.exports = cds.service.impl(function () {

  // register hooks
  registerHooks(this);

  // register actions
  registerActions(this);

});
