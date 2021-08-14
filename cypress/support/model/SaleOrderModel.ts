import { Field, Model, ModelConfig, MRecord, ORecord } from '../lib';
import { SeedOption } from '../lib';
import { ProductModel } from './ProductModel';
import { PartnerModel } from './PartnerModel';


export class OrderLine extends SeedOption {
  @Field({ key: 'product_id', cls: ProductModel })
  product: ORecord<ProductModel>

  @Field({ key: 'list_price' })
  price: number

  @Field({ key: 'product_uom_qty' })
  qty: number
}

export class SaleOrderOption extends SeedOption {
  @Field({ key: 'partner_id', cls: PartnerModel, def: 123 })
  partner: ORecord<PartnerModel>

  @Field({ key: 'other' })
  other: number

  @Field({ key: 'order_line', cls: OrderLine })
  orderLines: MRecord<OrderLine>
}

export class SaleOrderModel extends Model<SaleOrderOption> {
  protected getModelConfig(): ModelConfig {
    return { modelName: 'sale.order', optionClass: SaleOrderOption };
  }

}