import OrderLinePage from '../../support/page/order_line_page';
import SaleOrderMock from '../../support/mock/sale_order_mock';

const page = new OrderLinePage()
const mock = new SaleOrderMock({state: 'Confirmed'})
describe('Order Line Report', function () {
  beforeEach(() => {
    page.navigate()
  })

  it('should group by Product and Filter Progressing by default', function () {
    page._getSearchContainer().should('contain','By Product').and('contain','Progressing')
    cy.get('.o_list_table_grouped').should('be.visible')
  });

  it.only('should test', function () {
    mock.with_cy(() => mock.generate())
  });

  after(() => {
    mock.cleanup()
  })
});