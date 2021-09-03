import { CouponProgramPage, SaleOrderPage } from '../../support/page';
import { cy_sync } from "../../support/utils";
import { SaleOrderModel, ProgramModel } from '../../support/model';
import { randomString } from 'odoo-seeder';

const CONST = {
  price: 10000
}

const programName = randomString()
const couponProgramMock = new ProgramModel({
  name: programName,
  type: 'coupon_program',
  discountType: 'percentage',
  percentage: 10
})
const saleOrderMock = new SaleOrderModel({ orderLines: [{ price: CONST.price }] })

const page = new CouponProgramPage()
const salePage = new SaleOrderPage()

describe('Generate coupon with length and prefix', function () {

  it('should generate coupon code successfully', function () {
    cy_sync(() => couponProgramMock.generate())
    page.navigate()
    page._clickTreeItem(programName)

    page.getNumberOfCoupon().should('contain', '0')
    page._clickButton('Generate Coupon')
    page.generateCoupon('1', 'ABC', '6')
    cy.contains('Number of Coupons To Generate').should('not.exist')

    page.getNumberOfCoupon().should('contain', '1')
    page._clickButton('Coupons')
    page._getTreeCell(1, 1).invoke('text').as('coupon_code').should('have.length', 9).and('include', 'ABC')
  });

  it('should alert if running out of coupon code', function () {
    const prefix = randomString()
    const exceededCouponError = 'Coupon Code Exceeded! Please change another prefix, length or number of coupons!'
    const maxCouponError = 'Can only generate maximum 10 coupons!'

    page.navigate()
    page._clickTreeItem(programName)
    page._clickButton('Generate Coupon')
    page.generateCoupon('11', prefix, '1')
    cy.contains(maxCouponError).should('be.visible')
    page._clickButton('Ok')

    page.generateCoupon('5', prefix, '1')
    page.getNumberOfCoupon().should('contain', '6')

    for (let currentCoupon = 7; currentCoupon <= 11; currentCoupon++) {
      page._clickButton('Generate Coupon')
      page.generateCoupon(String(13 - currentCoupon), prefix, '1')
      cy.contains(exceededCouponError).should('be.visible')
      page._clickButton('Ok')

      page.generateCoupon('1', prefix, '1')
      page.getNumberOfCoupon().should('contain', currentCoupon.toString())
    }
    page._clickButton('Generate Coupon')
    page.generateCoupon('1', prefix, '1')
    cy.contains(exceededCouponError).should('be.visible')
    page._clickButton('Ok')
  });

  it('should apply code to sale order successfully', function () {
    cy_sync(() => saleOrderMock.generate())
    salePage.navigate()

    cy_sync(() => saleOrderMock.get(['name'])).then(data => {
      salePage._clickTreeItem(data['name'])
      salePage.applyCouponCode(this['coupon_code'])
      cy.contains(`Discount: ${programName}`).should('exist')
      cy.contains(-CONST.price * 0.1).should('exist')
    })
  });
});