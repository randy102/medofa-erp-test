import BasePage from './base_page'

export default class CouponProgramPage extends BasePage {
  _navigate() {
    super._navigate()
    this._clickRootMenu('sale.sale_menu_root')
    this._clickMenu('sale.product_menu_catalog')
    this._clickMenu('sale_coupon.menu_coupon_type_config')
    cy.get('ol[role="navigation"]').children().should('have.length', 1)
  }

  getNumberOfCoupon() {
    return cy.get('div[name="coupon_count"] .o_stat_value')
  }

  generateCoupon(number, prefix, length) {
    this._input('length', length)
    this._input('nbr_coupons', number)
    this._input('prefix', prefix)
    this._clickButton('Generate')
  }
}