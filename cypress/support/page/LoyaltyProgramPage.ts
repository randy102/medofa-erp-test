import { BasePage } from './BasePage'

export class LoyaltyProgramPage extends BasePage {
  navigate() {
    super._navigate()
    this._clickRootMenu('sale.sale_menu_root')
    this._clickMenu('sale.product_menu_catalog')
    this._clickMenu('medofa_loyalty_program.medofa_loyalty_program_menu')
    this._ensurePageTitle('Loyalty Programs')
  }
}