import { BaseMock, ProductMock, PurchaseOrderMock } from '../../support/mock';
import { SaleOrderFactory } from '../../support/mock_factory';
import { OrderLinePage } from '../../support/page';
import { randomInt } from "../../support/utils";

const CONST = {
  mainQty: randomInt(10, 20),
  inboundQty: randomInt(),
  scrapQty: randomInt(),
  receivedQty: randomInt(),
  saleConfirmedQty: randomInt(0, 10),
  cancelledQty: randomInt(),
  progressingQty: randomInt(0, 10),
  purchaseConfirmedQty: randomInt()
}
const page = new OrderLinePage()
const productMock = new ProductMock({mainQty: CONST.mainQty, inboundQty: CONST.inboundQty, scrapQty: CONST.scrapQty})
const mock = new SaleOrderFactory([
  {depends: {product: productMock}, state: 'Received', qty: CONST.receivedQty},
  {depends: {product: productMock}, state: 'Confirmed', qty: CONST.saleConfirmedQty},
  {depends: {product: productMock}, state: 'Cancelled', qty: CONST.cancelledQty},
  {depends: {product: productMock}, state: 'Progressing', qty: CONST.progressingQty},
])
const purchaseMock = new PurchaseOrderMock({
  depends: {product: productMock},
  state: 'Confirmed', qty: CONST.purchaseConfirmedQty
})

describe('Order Line Report', function () {
  before(() => {
    BaseMock.with_cy(async () => {
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
    BaseMock.with_cy(() => productMock.get(['default_code'])).then(({default_code}) => {
      page._inputSearch(default_code, 'Product')
      page._findTreeGroupRow(default_code).should('be.visible')

      const realMainQty = CONST.mainQty - CONST.progressingQty - CONST.saleConfirmedQty
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