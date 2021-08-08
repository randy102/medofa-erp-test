import { SaleOrderMock } from "../../support/mock";
import { cy_wrap } from "../../support/utils";
import { SaleOrderPage } from "../../support/page";
import { SaleOrderFactory } from "../../support/mock_factory";

const saleMock1 = new SaleOrderMock({ state: 'Cancelled' })
const saleMock2 = new SaleOrderMock({ state: 'Confirmed', stockQty: 1 })
const saleMock3 = new SaleOrderMock({ orderLines: [{ qty: 1, price: 43 }] })


const page = new SaleOrderPage()

describe('Sale Order In Stock Percentage', function () {
  it.only('should test', function () {
    saleMock3.generate()
  });

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
    // saleMock1.cleanup()
    // saleMock2.cleanup()
  })
});