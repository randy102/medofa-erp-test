import { SettingPage } from "../../support/page/SettingPage";
import { cy_wrap } from "../../support/utils";
import { ConfigParam } from "../../support/extension";
import { CouponProgramPage } from "../../support/page";
import { PartnerModel, SaleOrderModel, CouponProgramModel } from '../../support/model';
import { OdooRPC, randomString } from '../../support/lib';

const PROGRAM_NAME = randomString()

const programMock = new CouponProgramModel({ name: PROGRAM_NAME })
const partnerMock = new PartnerModel({ customerRefId: OdooRPC.getPartnerId() })
const saleMock1 = new SaleOrderModel({ partner: partnerMock, state: 'Delivered', orderLines: [{ stockQty: 1 }] })
const saleMock2 = new SaleOrderModel({ partner: partnerMock, state: 'Delivered', orderLines: [{ stockQty: 1 }] })

const settingPage = new SettingPage()
const programPage = new CouponProgramPage()

const configParam = new ConfigParam()

describe('Generate referring coupon for customer', function () {
  before(() => {
    cy_wrap(() => programMock.generate())
  })

  it('should config specific program used to generate coupon', function () {
    settingPage.navigate()
    settingPage.navigateTab('Medofa')

    cy_wrap(() => programMock.get(['name'])).then(data => {
      settingPage._selectMany2one('medofa_customer_referring_program', data['name'])
    })
    settingPage.save()
    cy.wait(5000)

    settingPage.ensurePageLoaded()
    cy_wrap(() => configParam.get('medofa_marketing.customer_referring_program')).then(data => {
      expect(parseInt(data)).equal(programMock.getId())
    })
  });

  it('should generate coupon successfully', function () {
    cy_wrap(() => saleMock1.generate())

    programPage.navigate()
    programPage._clickTreeItem(PROGRAM_NAME)
    programPage.getNumberOfCoupon().should('contain', 1)
    programPage._clickButton('Coupons')
    programPage._findTreeRow(OdooRPC.getPartnerName()).should('exist')
  });

  it('should not generate coupon if its not the first order', function () {
    cy_wrap(() => saleMock2.generate())
    programPage.navigate()
    programPage._clickTreeItem(PROGRAM_NAME)
    programPage.getNumberOfCoupon().should('contain', 1)
  });

  after(() => {
    programMock.cleanup()
    saleMock1.cleanup(false)
  })
});