import { Field, Model, ModelConfig, MRecord, ORecord, SeedOption, OdooRPC, formatDatetime } from '../lib';
import { ProductModel } from './ProductModel';
import moment = require('moment');
import { PartnerModel } from './PartnerModel';


export class PurchaseLineOption extends SeedOption {
  @Field({ key: 'product_id', cls: ProductModel })
  product: ORecord<ProductModel>

  @Field({ key: 'product_qty', def: 1 })
  qty: number

  @Field({ key: 'price_unit', def: 10000 })
  price: number

  @Field({ key: 'date_planned', def: () => formatDatetime(moment()) })
  datePlanned: string

  @Field({ key: 'product_uom' })
  uom: number

  @Field({ key: 'name' })
  name: string
}

export class PurchaseOrderOption extends SeedOption {
  @Field({ key: 'partner_id', def: OdooRPC.getPartnerId() })
  partner: ORecord<PartnerModel>

  @Field({ key: 'order_line', cls: PurchaseLineOption })
  orderLines: MRecord<PurchaseLineOption>

  state: 'Approved' | 'Confirmed' | 'Cancelled'
}

export class PurchaseOrderModel extends Model<PurchaseOrderOption> {
  protected getModelConfig(): ModelConfig {
    return {
      modelName: 'purchase.order',
      optionClass: PurchaseOrderOption,
    };
  }

  async beforeGenerate(option: PurchaseOrderOption): Promise<void> {
    const { orderLines } = option
    for (const line of (orderLines as PurchaseLineOption[])) {
      const data = await (line.product as ProductModel).get(['uom_id', 'name'])
      if (!line.uom) {
        line.uom = data['uom_id'][0]
      }
      if (!line.name) {
        line.name = data['name']
      }
    }
  }

  async afterGenerate(option: PurchaseOrderOption, id: number): Promise<void> {
    switch (option.state) {
      case 'Approved':
        await this.approve()
        break
      case 'Confirmed':
        await this.confirm()
        break
      case 'Cancelled':
        await this.cancel()
        break
    }

  }

  private async approve() {

  }

  private async confirm() {
    await this.call('button_confirm')
  }

  private async cancel() {
    await this.call('button_cancel')
  }


  protected async beforeCleanup(option: PurchaseOrderOption): Promise<void> {
    await this.cancel()
    if (option.state == 'Confirmed') {
      const { picking_ids } = await this.get(['picking_ids'])
      await this.rpc.unlink('stock.picking', picking_ids)
    }
  }

}