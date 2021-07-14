import BasePage from './base_page'

export default class SaleOrderPage extends BasePage{
  navigate() {
    super.navigate()
    this.clickRootMenu('sale.sale_menu_root')
    this.clickMenu('sale.sale_order_menu')
    this.clickMenu('sale.menu_sale_quotations')
  }

}