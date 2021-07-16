import BasePage from './base_page'

export default class CouponProgramPage extends BasePage {
  navigate() {
    super.navigate()
    this.clickRootMenu('sale.sale_menu_root')
    this.clickMenu('sale.product_menu_catalog')
    this.clickMenu('sale_coupon.menu_coupon_type_config')
    cy.get('ol[role="navigation"]').children().should('have.length', 1)
  }

  getNumberOfCoupon() {
    return cy.get('div[name="coupon_count"] .o_stat_value')
  }

  generateCoupon(number, prefix, length) {
    this.input('length', length)
    this.input('nbr_coupons', number)
    this.input('prefix', prefix)
    this.clickButton('Generate')
  }
}