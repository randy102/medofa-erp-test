import login from '../utils/login'

export default class BasePage {
  _navigate() {
    login()
    cy.visit('/')
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
      cy.get(`button[name="${name}"]`).contains(new RegExp("^" + text + "$", "g")).scrollIntoView().click()
    else
      cy.contains(new RegExp("^" + text + "$", "g")).scrollIntoView().click()
  }

  _clickLinkText(name) {
    cy.get('a').contains(name).click()
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

  _findTreeRow(key: string){
    return cy.get('tr.o_data_row').contains(key)
  }

  _clickTreeItem(name, field?: string) {
    let css = '.o_data_row'
    if (field) {
      css = `div[name="${field}"] ` + css
    }
    console.log({name, field, css})
    cy.get(css).contains(name).as(name).should('exist')
    cy.get(`@${name}`).scrollIntoView().click()
  }

  _inputTree(name: string, line: number, content: string) {
    cy.get(`input[name="${name}"]`).eq(line).scrollIntoView().clear().type(content)
  }

  _getTreeCell(rowNum, colNum) {
    return cy.get('tr.o_data_row').eq(rowNum - 1).children().eq(colNum)
  }

}