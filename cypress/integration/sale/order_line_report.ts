import { BaseMock, ProductMock, PurchaseOrderMock } from '../../support/mock';
import { SaleOrderFactory } from '../../support/mock_factory';
import { OrderLinePage } from '../../support/page';


const page = new OrderLinePage()
const productMock = new ProductMock({ mainQty: 10, inboundQty: 5 })
const mock = new SaleOrderFactory([
  { depends: { product: productMock }, state: 'Received', qty: 5 },
  { depends: { product: productMock }, state: 'Confirmed', qty: 5 },
  { depends: { product: productMock }, state: 'Cancelled', qty: 5 },
  { depends: { product: productMock }, state: 'Progressing', qty: 2 },
])
const purchaseMock = new PurchaseOrderMock({
  depends: { product: productMock },
  state: 'Confirmed', qty: 10
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
    BaseMock.with_cy(() => productMock.get(['default_code'])).then(({ default_code }) => {
      page._inputSearch(default_code, 'Product')
      page._findTreeGroupRow(default_code).should('be.visible')
      page._findTreeGroupColumn(default_code, 'main_stock_qty').should('contain', '3')
      page._findTreeGroupColumn(default_code, 'waiting_shipping_qty').should('contain', '5')
      page._findTreeGroupColumn(default_code, 'pick_pack_out_qty').should('contain', '2')
      page._findTreeGroupColumn(default_code, 'waiting_receive_qty').should('contain', '10')
      page._findTreeGroupColumn(default_code, 'inbound_qty').should('contain', '5')
    })
  });

  after(() => {
    mock.cleanup()
    purchaseMock.cleanup(false)
  })
});