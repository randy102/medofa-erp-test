import BasePage from './base_page'

export enum SaleState {
  DRAFT = 'draft',
  RECEIVED = 'receive',
  CONFIRMED = 'sale'
}

export default class SaleOrderPage extends BasePage{
  _navigate() {
    super._navigate()
    this._clickRootMenu('sale.sale_menu_root')
    this._clickMenu('sale.sale_order_menu')
    this._clickMenu('sale.menu_sale_quotations')
  }

  getStateButton(state: SaleState){
    return cy.get(`button[data-value="${state}"]`)
  }


}