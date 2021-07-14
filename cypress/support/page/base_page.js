import login from '../utils/login'

export default class BasePage{
  init(){
    login()
    cy.visit('/')
  }

  clickRootMenu(id){
    cy.get('a.full[data-display="static"]').click()
    this.clickMenu(id)
  }

  clickMenu(id){
    cy.get(`a[data-menu-xmlid="${id}"]`).click()
  }

  clickTreeItem(name){
    cy.get('.o_data_row').contains(name).as(name).should('exist')
    cy.get(`@${name}`).scrollIntoView().click()
  }

  clickButton(name){
    cy.contains(new RegExp("^" + name + "$", "g")).scrollIntoView().click()
  }

  input(name, content){
    cy.get(`input[name="${name}"]`).scrollIntoView().clear().type(content)
  }

  getFirstRow(){
    return cy.get('tr.o_data_row')
  }

  getRow(num){
    return cy.get('tr.o_data_row').eq(num-1)
  }

  getColumn(row, number){
    return row.children().eq(number)
  }

  getCell(rowNum, colNum){
    return this.getRow(rowNum).children().eq(colNum)
  }
}