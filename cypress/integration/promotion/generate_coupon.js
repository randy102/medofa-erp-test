import CouponProgramMock from '../../support/mock/coupon_program_mock'
import random from '../../support/utils/random'
import CouponProgramPage from '../../support/page/coupon_program_page'

const mock = new CouponProgramMock()
const programName = random()
const page = new CouponProgramPage()

describe('Generate coupon with length and prefix', function () {
  before(() => {
    mock.generate(programName)
    page.init()
  })

  it('should generate coupon code successfully', function () {
    page.clickTreeItem(programName)

    page.getNumberOfCoupon().should('contain', '0')
    page.clickButton('Generate Coupon')
    page.generateCoupon('1',random(),'6')
    cy.contains('Number of Coupons To Generate').should('not.exist')

    page.getNumberOfCoupon().should('contain', '1')
    page.clickButton('Coupons')
    page.getCell(1,1).invoke('text').should('have.length', 9).and('include', 'ABC')
    cy.go('back')
  });

  it('should alert if running out of coupon code', function () {
    const prefix = random()
    const exceededCouponError = 'Coupon Code Exceeded! Please change another prefix, length or number of coupons!'
    const maxCouponError = 'Can only generate maximum 10 coupons!'

    page.clickButton('Generate Coupon')
    page.generateCoupon('11',prefix,'1')
    cy.contains(maxCouponError).should('be.visible')
    page.clickButton('Ok')

    page.generateCoupon('5',prefix,'1')
    page.getNumberOfCoupon().should('contain', '6')

    page.clickButton('Generate Coupon')
    page.generateCoupon('6',prefix,'1')
    cy.contains(exceededCouponError).should('be.visible')
    page.clickButton('Ok')

    page.generateCoupon('5',prefix,'1')
    page.getNumberOfCoupon().should('contain', '11')
  });


  after(() => {
    mock.cleanup()
  })
});