import ProductMock from '../../support/mock/product_mock';
import SaleOrderPage, { SaleState } from '../../support/page/sale_order_page';
import { MockItem } from '../../support/mock/mock_item';
import BaseMock from '../../support/mock/base_mock';

const productMock: MockItem = new ProductMock()
const page = new SaleOrderPage()

describe('Create Sale Order', function () {
  beforeEach(() => {
    page.navigate()
  })

  it('should create order', function () {
    BaseMock.with_cy(() => productMock.generate())
    page._clickCreateButton()
    page._selectMany2one('partner_id', 'Quang Trần')
    page._clickLinkText('Add a product')
    BaseMock.with_cy(() => productMock.get(['default_code'])).then(data => {
      page._selectTreeMany2one('product_id', 0, data['default_code'])
    })
    page._inputTree('product_uom_qty', 0, '5')
    page._clickSaveButton()
    cy.get('button.o_form_button_edit').should('be.visible')
    page.getStateButton(SaleState.DRAFT).should('have.attr', 'aria-checked', 'true')

    cy.get('div.oe_title span[name="name"]').invoke('text').as('order_name').then(order_name => {
      page._navigateMainView()
      page._findTreeColumn(order_name, 'flag_db').should('contain', '10')
      page._findTreeColumn(order_name, 'flag_db_str').should('contain', 'Waiting')
    })
  });

  it('should receive order', function () {
    page._clickTreeItem(this.order_name)
    page._clickButton('Receive')
    page.getStateButton(SaleState.RECEIVED).should('have.attr', 'aria-checked', 'true')

    page._navigateMainView()
    page._findTreeColumn(this.order_name, 'flag_db').should('contain', '15')
    page._findTreeColumn(this.order_name, 'flag_db_str').should('contain', 'Received')
  });

  it('should confirm order', function () {
    page._clickTreeItem(this.order_name)

    page._clickButton('Confirm', 'action_confirm_with_check_stock')
    cy.contains('.modal-title', 'Confirm Order').should('be.visible')
    cy.contains('button[special="cancel"]', 'Cancel').click()
    cy.contains('.modal-title', 'Confirm Order').should('not.exist')
    page.getStateButton(SaleState.RECEIVED).should('have.attr', 'aria-checked', 'true')

    page._clickButton('Confirm', 'action_confirm_with_check_stock')
    cy.contains('.modal-title', 'Confirm Order').should('be.visible')
    cy.contains('.modal-content button[name="action_confirm"]', 'Confirm').click()
    page.getStateButton(SaleState.CONFIRMED).should('have.attr', 'aria-checked', 'true')

    page._navigateMainView()
    page._findTreeColumn(this.order_name, 'flag_db').should('contain', '20')
    page._findTreeColumn(this.order_name, 'flag_db_str').should('contain', 'Confirmed')
  });

  it('should cancel order', function () {
    page._clickTreeItem(this.order_name)

    page._clickButton('Cancel','action_cancel_with_reason')
    cy.contains('.modal-title','Please input order cancel reason!').should('be.visible')
    page._clickButton('Confirm','action_confirm_cancel')
    page._findToast('Type').should('be.visible')

    page._selectMany2one('type','Khách hàng ảo')
    page._textArea('content','Test')
    page._clickButton('Confirm','action_confirm_cancel')
    page.getStateButton(SaleState.CANCELED).should('have.attr', 'aria-checked', 'true')

    page._clickTab('Cancel Info')
    page._findFormField('cancel_type_id').should('contain','Khách hàng ảo')
    page._findFormField('cancel_content').should('contain','Test')
    page._findFormField('state_before_cancel').should('contain','Confirmed')

    page._navigateMainView()
    page._findTreeColumn(this.order_name, 'flag_db').should('contain', '25')
    page._findTreeColumn(this.order_name, 'flag_db_str').should('contain', 'Cancelled')
  });

  it('should delete order', function () {
    page._checkTreeItem(this.order_name)
    page._clickActionButton('Delete')
    page._clickButton('Ok')
    page._findTreeRow(this.order_name).should('not.exist')
  });

  after(() => {
    productMock.cleanup()
  })
});