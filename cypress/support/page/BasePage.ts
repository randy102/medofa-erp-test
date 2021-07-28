import {login} from '../utils'
import Chainable = Cypress.Chainable;

export abstract class BasePage {
  abstract navigate()

  /**
   * @description General
   */
  _navigate() {
    login()
    cy.visit('/')
  }

  _ensurePageTitle(title){
    cy.contains('.breadcrumb-item.active',title).should('be.visible')
  }

  _navigateMainView() {
    cy.get('.breadcrumb-item').eq(0).click()
    cy.get('.breadcrumb-item').should('have.length', 1)
  }

  _clickRootMenu(id) {
    cy.get('a.full[data-display="static"]').click()
    this._clickMenu(id)
    cy.wait(2000)
  }

  _clickMenu(id) {
    cy.get(`a[data-menu-xmlid="${id}"]`).click()
  }

  _clickButton(text: string, name?: string) {
    if (name)
      cy.contains(`button[name="${name}"]`, new RegExp("^" + text + "$", "g")).scrollIntoView().click()
    else
      cy.contains('button', text).scrollIntoView().click()
  }

  _clickLinkText(name) {
    cy.contains('a', name).click()
  }

  _findToast(content: string): Chainable {
    return cy.contains('.toast-body', content)
  }

  _clickActionButton(title: string) {
    cy.contains('button.o_dropdown_toggler_btn', 'Action').as('action_button').click()
    cy.get('@action_button').next().contains('a[role="menuitem"]', title).click()
  }

  _clickCreateButton() {
    cy.get('button.o_list_button_add').click()
  }


  /**
   * @description Form View
   */
  _clickSaveButton() {
    cy.get('button.o_form_button_save').click()
  }

  _clickTab(title: string) {
    cy.contains('a[data-toggle="tab"]', title).click()
  }

  _input(name, content) {
    cy.get(`input[name="${name}"]`).scrollIntoView().clear().type(content)
  }

  _textArea(name, content) {
    cy.get(`textarea[name="${name}"]`).scrollIntoView().clear().type(content)
  }

  _selectMany2one(name: string, value: string) {
    cy.get(`div[name="${name}"]`).as(`many2one_${name}`).click().type(value)
    cy.wait(2000)
    cy.get(`@many2one_${name}`).type('{enter}')
  }

  _findFormField(name): Chainable {
    return cy.get(`.o_field_widget[name="${name}"]`)
  }

  /**
   * @description Tree View
   */
  _selectTreeMany2one(name: string, line: number, value: string) {
    cy.get(`div[name="${name}"]`).eq(line).as(`many2one_${name}`).click().type(value)
    cy.wait(2000)
    cy.get(`@many2one_${name}`).type('{enter}')
  }

  _findTreeGroupRow(key: string): Chainable {
    return cy.contains('tr.o_group_header', key)
  }

  _findTreeRow(key: string, field?: string): Chainable {
    const css = BasePage.getFieldTreeCss('tr.o_data_row', field)
    return cy.contains(css, key)
  }

  _findTreeGroupColumn(rowKey: string, colName: string): Chainable {
    return this._getTreeColumnIndex(colName).then((index) => {
      return this._findTreeGroupRow(rowKey).children().eq(index - 2)
    })
  }

  _findTreeColumn(rowKey: string, colName: string, field?: string): Chainable {
    return this._getTreeColumnIndex(colName, field).then((index) => {
      return this._findTreeRow(rowKey, field).children().eq(index)
    })
  }

  _getTreeCell(rowNum: number, colNum: number, field?: string): Chainable {
    const css = BasePage.getFieldTreeCss('tr.o_data_row', field)
    return cy.get(css).eq(rowNum - 1).children().eq(colNum)
  }

  _getTreeColumnIndex(name: string, field?: string): Chainable {
    const css = BasePage.getFieldTreeCss(`table.o_list_table th[data-name="${name}"]`, field)
    return cy.get(css).invoke('index')
  }

  _clickTreeItem(name: string, field?: string) {
    const css = BasePage.getFieldTreeCss('tr.o_data_row', field)
    cy.contains(css, name).as(name).should('exist')
    cy.get(`@${name}`).scrollIntoView().click()
  }

  _checkTreeItem(name: string) {
    this._findTreeRow(name).find('div.custom-control.custom-checkbox').click()
  }

  _inputTree(name: string, line: number, content: string, field?: string) {
    const css = BasePage.getFieldTreeCss(`tr.o_data_row input[name="${name}"]`, field)
    cy.get(css).eq(line).scrollIntoView().clear().type(content)
  }


  _getSearchContainer(): Chainable {
    return cy.get('div.o_searchview_input_container')
  }

  _inputSearch(keyword, type){
    cy.get('.o_searchview_input_container input[type="text"]').type(keyword)
    cy.contains('.o_searchview_input_container .o_searchview_autocomplete a',type).click()
  }

  private static getFieldTreeCss(css, field) {
    return field ? `div[name="${field}"] ` + css : css
  }
}