import { SettingPage } from '../../support/page/SettingPage';
import { ConfigParam } from '../../support/extension';
import { cy_wrap } from '../../support/utils';
import { randomInt } from 'odoo-seeder';
import { PartnerModel, ProductModel } from '../../support/model';
import { PartnerPage } from '../../support/page/PartnerPage';
import { SaleOrderFactory } from '../../support/model_factory';
import { enterTest, leaveTest } from '../../support/utils/testMode';

const TIER: { [key: string]: [number, string, string, string] } = {
  noneReward: [randomInt(1, 10) / 10, 'medofa_none_reward', 'medofa_loyalty.none_tier_reward', 'None'],
  bronzeReward: [randomInt(1, 10) / 10, 'medofa_bronze_reward', 'medofa_loyalty.bronze_tier_reward', 'Bronze'],
  silverReward: [randomInt(1, 10) / 10, 'medofa_silver_reward', 'medofa_loyalty.silver_tier_reward', 'Silver'],
  goldReward: [randomInt(1, 10) / 10, 'medofa_gold_reward', 'medofa_loyalty.gold_tier_reward', 'Gold'],
  diamondReward: [randomInt(1, 10) / 10, 'medofa_diamond_reward', 'medofa_loyalty.diamond_tier_reward', 'Diamond'],
}

const [pReward, , , pName] = Object.values(TIER)[randomInt(0, 4)]
const CONST = {
  amountTotal: randomInt(10000, 1000000)
}
const salePrice1 = randomInt(10000, CONST.amountTotal)
const salePrice2 = CONST.amountTotal - salePrice1

const expectedPoint1 = Math.floor(salePrice1 * pReward / 100)
const expectedPoint2 = Math.floor(salePrice2 * pReward / 100)

const config = new ConfigParam()
const partner = new PartnerModel({ loyaltyRank: pName.toLowerCase() })
const product = new ProductModel({ mainHdQty: 2 })
const saleOrder = new SaleOrderFactory({
  'sale1': {
    partner,
    state: 'Delivered',
    orderLines: [{ product, price: salePrice1, stockQty: 1 }]
  },
  'sale2': {
    partner,
    state: 'Delivered',
    orderLines: [{ product, price: salePrice2, stockQty: 1 }]
  }
})

const settingPage = new SettingPage()
const partnerPage = new PartnerPage()

describe('Loyalty Point', function () {
  before(() => {
    enterTest()
  })

  it('should config member tiers reward successfully', function () {
    settingPage.navigate()
    settingPage.navigateTab('Medofa')
    for (const [percent, name] of Object.values(TIER)) {
      settingPage._input(name, percent)
    }
    settingPage.save()

    for (const [percent, , key] of Object.values(TIER)) {
      cy_wrap(() => config.get(key)).then(result => {
        expect(parseFloat(result)).eq(percent)
      })
    }
  });

  it('should add point to customer after order is delivered', function () {
    cy_wrap(() => saleOrder.generate())
    partnerPage.navigate()
    partnerPage._switchTreeView()
    cy_wrap(() => partner.getOption()).then(option => {
      partnerPage._inputSearch(option.name, 'Name')
      partnerPage._clickTreeItem(option.name)
    })

    partnerPage._clickTab('Loyalty')
    partnerPage._findFormField('loyalty_rank').should('contain', pName)


    cy_wrap(() => saleOrder.getModel('sale1').get(['name'])).then(({ name }) => {
      partnerPage._findTreeColumn(`Đơn hàng #${name}`, 'type', 'loyalty_history').should('contain', 'Auto')
      partnerPage._findTreeColumn(`Đơn hàng #${name}`, 'quantity', 'loyalty_history').invoke('text').then((point) => {
        const formatPoint = parseInt(point.replace(',', ''))
        expect(formatPoint).to.eq(expectedPoint1)
      })
    })

    cy_wrap(() => saleOrder.getModel('sale2').get(['name'])).then(({ name }) => {
      partnerPage._findTreeColumn(`Đơn hàng #${name}`, 'type', 'loyalty_history').should('contain', 'Auto')
      partnerPage._findTreeColumn(`Đơn hàng #${name}`, 'quantity', 'loyalty_history').invoke('text').then((point) => {
        const formatPoint = parseInt(point.replace(',', ''))
        expect(formatPoint).to.eq(expectedPoint2)
      })
    })

    partnerPage._findFormField('loyalty_point_sum').invoke('text').then((point: string) => {
      const formatPoint = parseInt(point.replace(',', ''))
      expect(formatPoint).to.eq(expectedPoint1 + expectedPoint2)
    })
  });

  after(() => leaveTest())
});