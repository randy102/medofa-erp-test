import { SaleOrderFactory } from '../../support/model_factory';
import { OrderLinePage } from '../../support/page';
import { cy_wrap } from "../../support/utils";
import { ProductModel, PurchaseOrderModel } from '../../support/model';
import { randomInt } from '@lib';

const CONST = {
  mainKhdQty: randomInt(10, 30),
  mainHdQty: randomInt(10, 30),
  inboundQty: randomInt(),
  scrapQty: randomInt(),
  receivedQty: randomInt(),
  saleConfirmedQty: randomInt(0, 10),
  cancelledQty: randomInt(),
  progressingQty: randomInt(0, 10),
  purchaseConfirmedQty: randomInt()
}
const page = new OrderLinePage()

const productMock = new ProductModel({
  mainHdQty: CONST.mainHdQty,
  mainKhdQty: CONST.mainKhdQty,
  inboundQty: CONST.inboundQty,
  scrapQty: CONST.scrapQty
})

const mock = new SaleOrderFactory([
  { orderLines: [{ product: productMock, qty: CONST.receivedQty }], state: 'Received' },
  { orderLines: [{ product: productMock, qty: CONST.saleConfirmedQty }], state: 'Confirmed' },
  { orderLines: [{ product: productMock, qty: CONST.cancelledQty }], state: 'Cancelled' },
  { orderLines: [{ product: productMock, qty: CONST.progressingQty }], state: 'Progressing' },
])
const purchaseMock = new PurchaseOrderModel({
  orderLines: [{ product: productMock, qty: CONST.purchaseConfirmedQty }],
  state: 'Confirmed',
})

describe('Order Line Report', function () {
  before(() => {
    cy_wrap(async () => {
      await mock.generate()
      await purchaseMock.generate()
    })
  })

  beforeEach(() => {
    page.navigate()
  })

  it('should group by Product and Filter Progressing by default', function () {
    page._getSearchContainer().should('contain', 'By Product').and('contain', 'Progressing')
    cy.get('.o_list_table_grouped').should('be.visible')
  });

  it.only('should display product quantities correctly', function () {
    cy_wrap(() => productMock.get(['default_code'])).then(({ default_code }) => {
      page._inputSearch(default_code, 'Product')
      page._findTreeGroupRow(default_code).should('be.visible')

      const realMainQty = CONST.mainHdQty + CONST.mainKhdQty - CONST.progressingQty - CONST.saleConfirmedQty
      page._findTreeGroupColumn(default_code, 'main_stock_qty').should('contain', realMainQty)
      page._findTreeGroupColumn(default_code, 'waiting_shipping_qty').should('contain', CONST.saleConfirmedQty)
      page._findTreeGroupColumn(default_code, 'pick_pack_out_qty').should('contain', CONST.progressingQty)
      page._findTreeGroupColumn(default_code, 'waiting_receive_qty').should('contain', CONST.purchaseConfirmedQty)
      page._findTreeGroupColumn(default_code, 'inbound_qty').should('contain', CONST.inboundQty)
    })
  });

  after(() => {
    mock.cleanup()
    purchaseMock.cleanup(false)
  })
});