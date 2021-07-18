import login from '../utils/login'
import Chainable = Cypress.Chainable;

export default class BasePage {
  _navigate() {
    login()
    cy.visit('/')
  }

  _navigateMainView(){
    cy.get('.breadcrumb-item').eq(0).click()
    cy.get('.breadcrumb-item').should('have.length',1)
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
      cy.contains(`button[name="${name}"]`,new RegExp("^" + text + "$", "g")).scrollIntoView().click()
    else
      cy.contains('button',new RegExp("^" + text + "$", "g")).scrollIntoView().click()
  }

  _clickLinkText(name) {
    cy.contains('a',name).click()
  }

  _clickCreateButton() {
    cy.get('button.o_list_button_add').click()
  }

  _clickSaveButton() {
    cy.get('button.o_form_button_save').click()
  }

  _input(name, content) {
    cy.get(`input[name="${name}"]`).scrollIntoView().clear().type(content)
  }

  _selectMany2one(name: string, value: string) {
    cy.get(`div[name="${name}"]`).as(`many2one_${name}`).click().type(value)
    cy.wait(2000)
    cy.get(`@many2one_${name}`).type('{enter}')
  }

  _selectTreeMany2one(name: string, line: number, value: string) {
    cy.get(`div[name="${name}"]`).eq(line).as(`many2one_${name}`).click().type(value)
    cy.wait(2000)
    cy.get(`@many2one_${name}`).type('{enter}')
  }

  _findTreeRow(key: string, field?: string): Chainable {
    const css = BasePage.getFieldTreeCss('tr.o_data_row', field)
    return cy.contains(css, key)
  }

  _findTreeColumn(rowKey: string, colName: string, field?: string):  Chainable{
    return this._getTreeColumnIndex(colName, field).then((index) => {
      return this._findTreeRow(rowKey, field).children().eq(index)
    })
  }

  _getTreeCell(rowNum: number, colNum: number, field?: string): Chainable {
    const css = BasePage.getFieldTreeCss('tr.o_data_row', field)
    return cy.get(css).eq(rowNum - 1).children().eq(colNum)
  }

  _clickTreeItem(name, field?: string) {
    const css = BasePage.getFieldTreeCss('tr.o_data_row', field)
    cy.contains(css, name).as(name).should('exist')
    cy.get(`@${name}`).scrollIntoView().click()
  }

  _inputTree(name: string, line: number, content: string, field?: string) {
    const css = BasePage.getFieldTreeCss(`tr.o_data_row input[name="${name}"]`, field)
    cy.get(css).eq(line).scrollIntoView().clear().type(content)
  }

  _getTreeColumnIndex(name: string, field?: string): Chainable{
    const css = BasePage.getFieldTreeCss(`table.o_list_table th[data-name="${name}"]`,field)
    return cy.get(css).invoke('index')
  }

  private static getFieldTreeCss(css, field){
    return  field ? `div[name="${field}"] ` + css : css
  }
}