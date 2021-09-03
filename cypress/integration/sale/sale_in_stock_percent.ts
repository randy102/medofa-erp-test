import { cy_sync } from "../../support/utils";
import { SaleOrderPage } from "../../support/page";
import { SaleOrderModel } from '../../support/model';


const saleMock1 = new SaleOrderModel({ state: 'Cancelled', orderLines: [{}] })
const saleMock2 = new SaleOrderModel({ state: 'Confirmed', orderLines: [{ stockQty: 1 }] })
const saleMock3 = new SaleOrderModel({
  state: 'Received',
  orderLines: [
    { qty: 5, stockQty: 10 },
    { qty: 5, stockQty: 0 },
    { qty: 5, stockQty: 4 }
  ]
})


const page = new SaleOrderPage()

describe('Sale Order In Stock Percentage', function () {
  it('should display N/A in cancelled order', function () {
    cy_sync(() => saleMock1.generate())
    page.navigate()

    cy_sync(() => saleMock1.get(['name'])).then(sale => {
      page._findTreeColumn(sale['name'], 'in_stock_percentage').should('contain', 'N/A')
    })
  });

  it('should display 100% in confirmed order', function () {
    cy_sync(() => saleMock2.generate())
    page.navigate()

    cy_sync(() => saleMock2.get(['name'])).then(sale => {
      page._findTreeColumn(sale['name'], 'in_stock_percentage').should('contain', '100%')
    })
  });

  it('should display correct percentage in Draft and Receive state', function () {
    cy_sync(() => saleMock3.generate())
    page.navigate()

    cy_sync(() => saleMock3.get(['name'])).then(sale => {
      page._findTreeColumn(sale['name'], 'in_stock_percentage').should('contain', '60.0%')
    })
  });

});