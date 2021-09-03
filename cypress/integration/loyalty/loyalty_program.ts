import { randomString, randomInt } from 'odoo-seeder'
import { LoyaltyProgramPage } from '../../support/page/LoyaltyProgramPage';
import { PartnerModel, ProgramModel, SaleOrderModel } from '../../support/model';
import { SaleOrderPage } from '../../support/page';
import { cy_sync } from '../../support/utils';
import { ConfigParam } from '../../support/extension';
import { PartnerPage } from '../../support/page/PartnerPage';

const CONST = {
  programName: randomString(),
  codeProgramName: randomString(),
  programCode: randomString(),
  programReward: randomInt(10, 100),
  partnerRank: 'silver',
  silverReward: 0.5,
  lowerSalePrice: randomInt(10, 10 / 0.5 * 100 - 1),
  higherSalePrice: randomInt(100 / 0.5 * 100 + 1, 100000000)
}
const expectedLowerPoint = Math.floor(CONST.silverReward * CONST.higherSalePrice / 100)


const program = new ProgramModel({
  name: CONST.codeProgramName,
  isLoyalty: true,
  code: CONST.programCode,
  usage: 'code_needed',
  discountType: 'fixed_amount',
  fixAmount: 1,
  type: 'promotion_program',
  loyaltyReward: CONST.programReward
})
const partner = new PartnerModel({ loyaltyRank: CONST.partnerRank })
const highSale = new SaleOrderModel({ partner, orderLines: [{ price: CONST.higherSalePrice, stockQty: 1 }] })
const lowSale = new SaleOrderModel({
  partner,
  state: 'Delivered',
  couponCode: CONST.programCode,
  orderLines: [{ price: CONST.lowerSalePrice, stockQty: 1 }]
})
const config = new ConfigParam()

const page = new LoyaltyProgramPage()
const salePage = new SaleOrderPage()
const partnerPage = new PartnerPage()

describe('Loyalty Program', function () {
  it('should create loyalty program successfully', function () {
    page.navigate()
    page._clickCreateButton()
    page._input('name', CONST.programName)
    page._input('reward_point', CONST.programReward)
    page._clickSaveButton()

    page._navigateMainView()
    page._findTreeRow(CONST.programName).should('exist')
  })

  it('should delete loyalty program successfully', function () {
    page.navigate()
    page._clickTreeItem(CONST.programName)
    page._ensurePageTitle(CONST.programName)
    page._clickActionButton('Archive')
    page._clickConfirmOk()
    page._getFormRibbon().should('contain', 'Archived')

    page._clickActionButton('Delete')
    page._clickConfirmOk()
    cy.contains(CONST.programName).should('not.exist')
  });

  it('should apply loyalty program on order line that have price equals 0', function () {
    cy_sync(() => Promise.all([highSale.generate(), program.generate()]))
    salePage.navigate()

    cy_sync(() => highSale.get(['name'])).then(({ name }) => {
      salePage._clickTreeItem(name)
      salePage.applyCouponCode(CONST.programCode)
      salePage._findTreeRow(`Loyalty: ${CONST.codeProgramName}`, 'order_line').should('exist')
      salePage._findTreeColumn(`Loyalty: ${CONST.codeProgramName}`, 'price_subtotal').should('contain', 0)
    })
  });

  it('should add tier reward point if program point is lower than tier point', function () {
    cy_sync(async () => {
      await config.set('medofa_loyalty.silver_tier_reward', CONST.silverReward)
      await highSale.processDelivery()
    })

    partnerPage.navigate()
    partnerPage._switchTreeView()

    cy_sync(() => partner.getOption()).then(option => {
      partnerPage._inputSearch(option.name, 'Name')
      partnerPage._clickTreeItem(option.name)
    })

    partnerPage._clickTab('Loyalty')
    partnerPage._findFormField('loyalty_rank').should('contain', 'Silver')

    cy_sync(() => highSale.get(['name'])).then(({ name }) => {
      partnerPage._findTreeColumn(`Đơn hàng #${name}`, 'quantity', 'loyalty_history').invoke('text').then((point) => {
        const formatPoint = parseInt(point.replace(',', ''))
        expect(formatPoint).to.eq(expectedLowerPoint)
      })
    })

    partnerPage._findFormField('loyalty_point_sum').invoke('text').then((point: string) => {
      const formatPoint = parseInt(point.replace(',', ''))
      expect(formatPoint).to.eq(expectedLowerPoint)
    })
  });

  it('should add program reward point if program point is higher than tier point', function () {
    cy_sync(async () => {
      await config.set('medofa_loyalty.silver_tier_reward', CONST.silverReward)
      await lowSale.generate()
    })

    partnerPage.navigate()
    partnerPage._switchTreeView()

    cy_sync(() => partner.getOption()).then(option => {
      partnerPage._inputSearch(option.name, 'Name')
      partnerPage._clickTreeItem(option.name)
    })

    partnerPage._clickTab('Loyalty')
    partnerPage._findFormField('loyalty_rank').should('contain', 'Silver')

    cy_sync(() => lowSale.get(['name'])).then(({ name }) => {
      partnerPage._findTreeColumn(`Đơn hàng #${name}`, 'quantity', 'loyalty_history').invoke('text').then((point) => {
        const formatPoint = parseInt(point.replace(',', ''))
        expect(formatPoint).to.eq(CONST.programReward)
      })
    })

    partnerPage._findFormField('loyalty_point_sum').invoke('text').then((point: string) => {
      const formatPoint = parseInt(point.replace(',', ''))
      expect(formatPoint).to.eq(expectedLowerPoint + CONST.programReward)
    })
  });
});