import { PartnerMock, SaleOrderMock } from "../../support/mock";
import { DistrictMock } from "../../support/mock/DistrictMock";
import { cy_wrap } from "../../support/utils";
import { SaleOrderPage } from "../../support/page";

const districtMock = new DistrictMock({ val: { warning_covid: true } })
const partnerMock = new PartnerMock({ depends: { district: districtMock } })
const saleMock1 = new SaleOrderMock({ depends: { partner: partnerMock } })

const page = new SaleOrderPage()

describe('Highlight Sale Order', function () {
  it('should highlight order has delivery district affected by covid', function () {
    cy_wrap(() => saleMock1.generate())
    page.navigate()

    cy_wrap(() => saleMock1.get(['name'])).then(data => {
      page._findTreeRow(data['name']).should('have.class', 'text-warning')
    })
  });

  after(() => {
    console.log('Clean')
    saleMock1.cleanup()
  })
});