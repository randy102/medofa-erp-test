import { BaseConfig, BaseMock } from '../lib';
import { ProductMock } from './ProductMock';
import moment = require('moment');

export type PurchaseOrderDepend = {
  product?: ProductMock
}

export class PurchaseOrderConfig extends BaseConfig<PurchaseOrderDepend>{
  qty?: number
  price?: number
  state?: 'Approved' | 'Confirmed' | 'Cancelled'
}

export class PurchaseOrderMock extends BaseMock<PurchaseOrderConfig, PurchaseOrderDepend>{
  MODEL = 'purchase.order'
  CAN_DELETE = true

  protected async getCreateParam({ depends:{product}, qty = 1 , price = 80000}: Partial<PurchaseOrderConfig>, depends: Partial<PurchaseOrderDepend>): Promise<object> {
    const productData = await product.get(['product_variant_id', 'display_name', 'uom_id'])
    return {
      "partner_id": Cypress.env('erpPartnerId'),
      "order_line": [[0, 0, {
        "product_qty": qty,
        "price_unit": price,
        "date_planned": moment().format('YYYY-MM-DD HH:mm:ss'),
        "product_id": productData['product_variant_id'][0],
        "name": productData['display_name'],
        "product_uom": productData['uom_id'][0],
      }]],
      "is_return": false,
    }
  }

  protected async getDependency({ depends, price }: Partial<PurchaseOrderConfig>): Promise<PurchaseOrderDepend> {
    const { product } = depends
    if (!product) {
      depends.product = new ProductMock({ price })
    }
    return depends
  }

  protected async afterGenerated(id: number, config: Partial<PurchaseOrderConfig>): Promise<void> {
    switch (config.state) {
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
    await this.rpc.call(this.MODEL, 'button_confirm', [this.getId()])
  }

  private async cancel() {
    await this.rpc.call(this.MODEL, 'button_cancel', [this.getId()])
  }

  protected async beforeCleanup(config: Partial<PurchaseOrderConfig>): Promise<void> {
    await this.cancel()
    if (config.state == "Confirmed") {
      const { picking_ids } = await this.get(['picking_ids'])
      await this.rpc.unlink('stock.picking', picking_ids)
    }
  }
}