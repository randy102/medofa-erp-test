import { cy_wrap } from "../../support/utils";
import { SaleOrderPage } from "../../support/page";
import { PartnerModel, SaleOrderModel } from '../../support/model';

const saleMock1 = new SaleOrderModel({ state: 'Cancelled', orderLines: [{}] })
const saleMock2 = new SaleOrderModel({ state: 'Confirmed', orderLines: [{ stockQty: 1 }] })
const partner = new PartnerModel()


const page = new SaleOrderPage()

describe('Sale Order In Stock Percentage', function () {
  it('should display N/A in cancelled order', function () {
    cy_wrap(() => saleMock1.generate())
    page.navigate()

    cy_wrap(() => saleMock1.get(['name'])).then(sale => {
      page._findTreeColumn(sale['name'], 'in_stock_percentage').should('contain', 'N/A')
    })
  });

  it('should display 100% in confirmed order', function () {
    cy_wrap(() => saleMock2.generate())
    page.navigate()

    cy_wrap(() => saleMock2.get(['name'])).then(sale => {
      page._findTreeColumn(sale['name'], 'in_stock_percentage').should('contain', '100%')
    })
  });

  it('should display correct percentage in Draft and Receive state', function () {

  });

  before(() => {
    saleMock1.cleanup()
    saleMock2.cleanup()
  })
});