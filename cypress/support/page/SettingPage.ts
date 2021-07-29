import { BasePage } from "./BasePage";

export class SettingPage extends BasePage {
  navigate() {
    super._navigate()
    this._clickRootMenu('base.menu_administration')
    this.ensurePageLoaded()
  }

  ensurePageLoaded() {
    cy.contains('.title', 'Settings').should('be.visible')
  }

  navigateTab(name: string) {
    cy.contains('.settings_tab>.tab', name).click()
  }

  save() {
    this._clickButton('Save', 'execute')
  }

}