import { cy_wrap } from "../../support/utils";
import { SaleOrderPage } from "../../support/page";
import { PartnerModel, SaleOrderModel, DistrictModel } from '../../support/model';
import { enterTest, leaveTest } from '../../support/utils/testMode';

const districtMock = new DistrictModel({ covid: true })
const partnerMock = new PartnerModel({ district: districtMock })
const saleMock1 = new SaleOrderModel({ partner: partnerMock, orderLines: [{}] })

const page = new SaleOrderPage()

describe('Highlight Sale Order', function () {

  it('should highlight order has delivery district affected by covid', function () {
    cy_wrap(() => saleMock1.generate())
    page.navigate()

    cy_wrap(() => saleMock1.get(['name'])).then(data => {
      page._findTreeRow(data['name']).should('have.class', 'text-warning')
    })
  });

});