import { ProductMock } from '../../support/mock';
import { SaleOrderPage, SaleState } from '../../support/page';
import { cy_wrap, OdooRPC, randomString } from "../../support/utils";


const productMock = new ProductMock()

const page = new SaleOrderPage()

describe('Create Sale Order', function () {
  beforeEach(() => {
    page.navigate()
  })

  it('should create order', function () {
    cy_wrap(() => productMock.generate())
    page._clickCreateButton()
    page._selectMany2one('partner_id', OdooRPC.getPartnerName())
    page._clickLinkText('Add a product')
    cy_wrap(() => productMock.get(['default_code'])).then(data => {
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

  it('should show product not fulfilled error when confirm order ', function () {
    page._clickTreeItem(this.order_name)

    page._clickButton('Confirm', 'action_confirm_with_check_stock')
    cy.contains('.modal-title', 'Confirm Order').should('be.visible')
    cy.contains('button[special="cancel"]', 'Cancel').click()
    cy.contains('.modal-title', 'Confirm Order').should('not.exist')
    page.getStateButton(SaleState.RECEIVED).should('have.attr', 'aria-checked', 'true')

    page._navigateMainView()
    page._findTreeColumn(this.order_name, 'flag_db').should('contain', '15')
    page._findTreeColumn(this.order_name, 'flag_db_str').should('contain', 'Received')
  });

  it('should confirm order successfully when product has enough stock', function () {
    cy_wrap(() => productMock.generateMainKhdQty(randomString(), 5))
    page._clickTreeItem(this.order_name)

    page._clickButton('Confirm', 'action_confirm_with_check_stock')
    cy.wait(2000)
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
});