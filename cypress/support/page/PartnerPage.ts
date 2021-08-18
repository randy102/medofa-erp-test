import { BasePage } from './BasePage';

export class PartnerPage extends BasePage {
  navigate() {
    super._navigate()
    this._clickRootMenu('contacts.menu_contacts')
    this._clickMenu('contacts.res_partner_menu_contacts')
  }

}