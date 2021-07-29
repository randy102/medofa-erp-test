import { CouponProgramMock, SaleOrderMock } from '../../support/mock';
import { CouponProgramPage, SaleOrderPage } from '../../support/page';
import { cy_wrap, randomString } from "../../support/utils";


const programName = randomString()
const couponProgramMock = new CouponProgramMock({ name: programName })
const saleOrderMock = new SaleOrderMock()
const page = new CouponProgramPage()
const salePage = new SaleOrderPage()

describe('Generate coupon with length and prefix', function () {
  it('should generate coupon code successfully', function () {
    cy_wrap(() => couponProgramMock.generate())
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
    cy_wrap(() => saleOrderMock.generate())
    salePage.navigate()

    cy_wrap(() => saleOrderMock.get(['name'])).then(data => {
      salePage._clickTreeItem(data['name'])
      salePage._clickButton('Coupon')
      salePage._input('coupon_code', this['coupon_code'])
      salePage._clickButton('Apply')
      cy.wait(5000)
      cy.contains(`Discount: ${programName}`).should('exist')
      cy.contains('-1000').should('exist')
    })
  });


  after(() => {
    saleOrderMock.cleanup()
    couponProgramMock.cleanup()
  })
});