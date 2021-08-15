import { ModelFactory } from 'odoo-seeder';
import { SaleOrderModel, SaleOrderOption } from '../model';


export class SaleOrderFactory extends ModelFactory<SaleOrderOption> {
  getMockClass() {
    return SaleOrderModel
  }
}