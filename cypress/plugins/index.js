/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/**
 * @type {Cypress.PluginConfig}
 */
// eslint-disable-next-line no-unused-vars
require('dotenv').config()

module.exports = (on, config) => {
  config.baseUrl = process.env.BASE_URL
  config.env.erpUsername = process.env.ERP_USER
  config.env.erpPassword = process.env.ERP_PASSWORD
  config.env.erpDB = process.env.ERP_DB
  config.env.erpPort = +process.env.ERP_PORT
  config.env.erpPartnerId = +process.env.PARTNER_ID
  return config
}