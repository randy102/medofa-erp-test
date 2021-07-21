import BasePage from './base_page';

export default class OrderLinePage extends BasePage{
  navigate() {
    super._navigate()
    this._clickRootMenu('sale.sale_menu_root')
    this._clickMenu('sale.sale_order_menu')
    this._clickMenu('medofa_order_lines.medofa_order_lines_menu')
  }

}