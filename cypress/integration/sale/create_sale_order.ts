import ProductMock from '../../support/mock/product_mock';
import SaleOrderPage, { SaleState } from '../../support/page/sale_order_page';
import { MockItem } from '../../support/mock/mock_item';

const productMock: MockItem = new ProductMock()
const page = new SaleOrderPage()

describe('Create Sale Order', function () {
  before(() =>{
    // productMock.with_cy(() => productMock.generate({}))
  })

  beforeEach(() =>{
    page._navigate()
  })

  it('should create order successfully', function () {
    page._clickCreateButton()
    page._selectMany2one('partner_id', 'Quang Trần')
    page._clickLinkText('Add a product')
    page._selectTreeMany2one('product_id', 0 ,'test')
    page._inputTree('product_uom_qty',0, '5')
    page._clickSaveButton()
    cy.get('button.o_form_button_edit').should('be.visible')
    page.getStateButton(SaleState.DRAFT).should('have.attr', 'aria-checked', 'true')

    cy.get('div.oe_title span[name="name"]').invoke('text').as('order_name').then(order_name => {
      page._navigateMainView()
      page._findTreeColumn(order_name, 'flag_db').should('contain','10')
    })


  });

  it('should receive order successfully', function () {
    page._clickTreeItem(this.order_name)
    page._clickButton('Receive')
    page.getStateButton(SaleState.RECEIVED).should('have.attr', 'aria-checked', 'true')

    page._navigateMainView()
    page._findTreeColumn(this.order_name, 'flag_db').should('contain','15')
  });

  after(() => {
    productMock.cleanup()
  })
});