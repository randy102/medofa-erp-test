import CouponProgramMock from '../../support/mock/coupon_program_mock'
import random from '../../support/utils/random'
import CouponProgramPage from '../../support/page/coupon_program_page'
import SaleOrderMock from '../../support/mock/sale_order_mock'
import SaleOrderPage from '../../support/page/sale_order_page'
import login from '../../support/utils/login'

const couponProgramMock = new CouponProgramMock()
const saleOrderMock = new SaleOrderMock()
const programName = random()
const page = new CouponProgramPage()
const salePage = new SaleOrderPage()

describe('Generate coupon with length and prefix', function () {
  before(() => {
    couponProgramMock.with_cy(couponProgramMock.generate, programName)
    page.navigate()
  })

  it('should generate coupon code successfully', function () {
    page.clickTreeItem(programName)

    page.getNumberOfCoupon().should('contain', '0')
    page.clickButton('Generate Coupon')
    page.generateCoupon('1', 'ABC', '6')
    cy.contains('Number of Coupons To Generate').should('not.exist')

    page.getNumberOfCoupon().should('contain', '1')
    page.clickButton('Coupons')
    page.getCell(1, 1).invoke('text').as('coupon_code').should('have.length', 9).and('include', 'ABC')
    cy.go('back')
  });

  it('should alert if running out of coupon code', function () {
    const prefix = random()
    const exceededCouponError = 'Coupon Code Exceeded! Please change another prefix, length or number of coupons!'
    const maxCouponError = 'Can only generate maximum 10 coupons!'

    page.clickButton('Generate Coupon')
    page.generateCoupon('11', prefix, '1')
    cy.contains(maxCouponError).should('be.visible')
    page.clickButton('Ok')

    page.generateCoupon('5', prefix, '1')
    page.getNumberOfCoupon().should('contain', '6')

    page.clickButton('Generate Coupon')
    page.generateCoupon('6', prefix, '1')
    cy.contains(exceededCouponError).should('be.visible')
    page.clickButton('Ok')

    page.generateCoupon('5', prefix, '1')
    page.getNumberOfCoupon().should('contain', '11')
  });

  it('should apply code to sale order successfully', function () {
    saleOrderMock.with_cy(saleOrderMock.generate)
    salePage.navigate()
    saleOrderMock.with_cy(saleOrderMock._get, ['name']).then(data => {
      salePage.clickTreeItem(data['name'])
      salePage.clickButton('Coupon')
      salePage.input('coupon_code', this['coupon_code'])
      salePage.clickButton('Apply')
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