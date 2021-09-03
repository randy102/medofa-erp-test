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

import { config } from 'dotenv';
import { enterTest, leaveTest } from '../support/utils/testMode';
/**
 * @type {Cypress.PluginConfig}
 */
// eslint-disable-next-line no-unused-vars
config()

module.exports = (on, config) => {
  config.baseUrl = process.env.BASE_URL
  config.env.erpUsername = process.env.ERP_USER
  config.env.erpPassword = process.env.ERP_PASSWORD
  config.env.erpDB = process.env.ERP_DB
  config.env.erpPort = +process.env.ERP_PORT
  config.env.erpPartnerId = +process.env.PARTNER_ID
  config.env.erpPartnerName = process.env.PARTNER_NAME

  on('before:run', (details) => {
    return enterTest()
  })

  on('before:spec', (spec) => {
    if ('specFilter' in spec)
      return enterTest()
  })

  on('after:run', (results) => {
    return leaveTest()
  })

  on('after:spec', (spec, results) => {
    if (!results)
      return leaveTest()
  })

  return config
}

