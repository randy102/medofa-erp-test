import { BaseConfig, BaseMock }  from './BaseMock'
import { ProductMock } from './ProductMock';


export class SaleOrderConfig extends BaseConfig<SaleOrderDepends> {
  price?: number
  qty?: number
  state?: 'Received' | 'Confirmed' | 'Cancelled' | 'Progressing'
}

export type SaleOrderDepends = {
  product?: ProductMock
}

export class SaleOrderMock extends BaseMock<SaleOrderConfig, SaleOrderDepends> {
  MODEL = 'sale.order'
  CAN_DELETE = true

  protected async getDependency({ depends , price = 100000}: Partial<SaleOrderConfig>): Promise<SaleOrderDepends> {
    const { product } = depends
    if (!product) {
      depends.product = new ProductMock({ price })
    }
    return depends
  }

  protected async getCreateParam({ qty = 1 }: SaleOrderConfig, { product }: SaleOrderDepends): Promise<object> {
    const productData = await product.get(['product_variant_id', 'display_name', 'uom_id'])
    return {
      "picking_policy": "direct",
      "partner_id": Cypress.env('erpPartnerId'),
      "order_line": [[0, 0, {
        "product_uom_qty": qty,
        "product_id": productData['product_variant_id'][0],
        "name": productData['display_name'],
        "product_uom": productData['uom_id'][0],
      }]],
      "is_return": false,
    }
  }

  protected async afterGenerated(id: number, config: Partial<SaleOrderConfig>): Promise<void> {
    switch (config.state) {
      case 'Received':
        await this.receive()
        break
      case 'Confirmed':
        await this.confirm()
        break
      case 'Cancelled':
        await this.cancel()
        break
      case 'Progressing':
        await this.process()
        break
    }
  }

  async process(): Promise<void>{
    await this.confirm()
    const findShipPickingDomain = [
      ['sale_id','=',this.getId()],
      ['picking_code','=','SHIP']
    ]
    const [shipPicking] = await this.rpc.search('stock.picking', findShipPickingDomain, ['id'])
    const immediateTransferId = await this.rpc.create('stock.immediate.transfer', {pick_ids: [[4, shipPicking.id]]})
    await this.rpc.call('stock.immediate.transfer','process',[immediateTransferId])
  }

  async confirm(): Promise<void> {
    await this.rpc.call(this.MODEL, 'action_confirm', [this.getId()])
  }

  async receive(): Promise<void> {
    await this.rpc.call(this.MODEL, 'action_receive', [this.getId()])
  }

  async cancel(): Promise<void> {
    const [cancelType] = await this.rpc.search('medofa.cancel.type', [], ['id'])
    await this.rpc.call(this.MODEL, 'cancel_order_with_reason', this.getId(), cancelType.id, 'Cancel')
  }

  protected async beforeCleanup(config: Partial<SaleOrderConfig>): Promise<void> {
    await this.cancel()
    if (config.state == "Confirmed") {
      const { picking_ids } = await this.get(['picking_ids'])
      await this.rpc.unlink('stock.picking', picking_ids)
    }
  }

  protected async shouldCleanup(config: Partial<SaleOrderConfig>, depends: Partial<SaleOrderDepends>): Promise<boolean> {
    return config.state != 'Progressing'
  }
}