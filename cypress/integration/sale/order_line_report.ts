import OrderLinePage from '../../support/page/order_line_page';
import SaleOrderMock from '../../support/mock/sale_order_mock';
import SaleOrderFactory from '../../support/mock_factory/sale_order_factory';
import ProductMock from '../../support/mock/product_mock';
import BaseMock from '../../support/mock/base_mock';

const page = new OrderLinePage()
const productMock = new ProductMock()
const mock = new SaleOrderFactory([
  {productMock, state:'Received'},
  {productMock, state:'Confirmed'},
  {productMock, state:'Cancelled'},
])
describe('Order Line Report', function () {
  beforeEach(() => {
    page.navigate()
  })

  it('should group by Product and Filter Progressing by default', function () {
    page._getSearchContainer().should('contain','By Product').and('contain','Progressing')
    cy.get('.o_list_table_grouped').should('be.visible')
  });

  it.only('should test', function () {
    BaseMock.with_cy(() => mock.generate())
  });

  after(() => {
    // mock.cleanup()
  })
});