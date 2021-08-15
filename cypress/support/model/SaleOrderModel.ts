import { Field, Model, ModelConfig, MRecord, ORecord, OdooRPC } from '../lib';
import { SeedOption } from '../lib';
import { ProductModel } from './ProductModel';
import { PartnerModel } from './PartnerModel';


export class OrderLine extends SeedOption {
  @Field({ key: 'product_id', cls: ProductModel })
  product: ORecord<ProductModel>

  @Field({ key: 'price_unit', def: 10000 })
  price: number

  @Field({ key: 'product_uom_qty', def: 1 })
  qty: number

  stockQty: number
}

export class SaleOrderOption extends SeedOption {
  @Field({ key: 'partner_id', cls: PartnerModel, def: OdooRPC.getPartnerId() })
  partner: ORecord<PartnerModel>

  @Field({ key: 'order_line', cls: OrderLine })
  orderLines: MRecord<OrderLine>

  state: 'Received' | 'Confirmed' | 'Cancelled' | 'Progressing' | 'Delivering' | 'Delivered'
}

export class SaleOrderModel extends Model<SaleOrderOption> {
  protected getModelConfig(): ModelConfig {
    return { modelName: 'sale.order', optionClass: SaleOrderOption };
  }

  async beforeGenerate(option: SaleOrderOption): Promise<void> {
    const { orderLines } = option
    for (const line of (orderLines as OrderLine[])) {
      await (line.product as ProductModel).generateMainKhdQty(line.stockQty)
    }
  }

  async afterGenerate(option: SaleOrderOption): Promise<void> {
    switch (option.state) {
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
        await this.processShip()
        break
      case 'Delivering':
        await this.processOut()
        break
      case 'Delivered':
        await this.processDelivery()
    }
  }

  protected async beforeCleanup(option: SaleOrderOption): Promise<void> {
    await this.cancel()
    if (option.state == "Confirmed") {
      const { picking_ids } = await this.get(['picking_ids'])
      await this.rpc.unlink('stock.picking', picking_ids)
    }
  }

  protected async shouldCleanup(option: SaleOrderOption): Promise<boolean> {
    return option.state != 'Progressing'
  }

  async processShip(): Promise<void> {
    await this.confirm()

    const findShipPickingDomain = [
      ['sale_id', '=', this.getId()],
      ['picking_code', '=', 'SHIP']
    ]
    const [shipPicking] = await this.rpc.search('stock.picking', findShipPickingDomain, ['id'])
    await this.validatePicking(shipPicking.id)
  }

  async processOut(): Promise<void> {
    await this.processShip()
    const pickCodes = ['PICK', 'PACK', 'OUT']
    const findPickPackDomain = [
      ['sale_id', '=', this.getId()],
      ['picking_code', 'in', pickCodes]
    ]

    const pickings = await this.rpc.search('stock.picking', findPickPackDomain, ['id', 'picking_code'], 0)
    for (const code of pickCodes) {
      await this.validatePicking(pickings.find(pick => pick.picking_code == code)['id'])
    }
  }

  async processDelivery(): Promise<void> {
    await this.processOut()

    const findDeliveryPickingDomain = [
      ['sale_id', '=', this.getId()],
      ['picking_code', '=', 'DE']
    ]
    const [deliveryPicking] = await this.rpc.search('stock.picking', findDeliveryPickingDomain, ['id'])
    await this.validatePicking(deliveryPicking.id)
  }

  async validatePicking(id: number) {
    const immediateTransferId = await this.rpc.create('stock.immediate.transfer', { pick_ids: [[4, id]] })
    await this.rpc.call('stock.immediate.transfer', 'process', [immediateTransferId])
  }

  async confirm(): Promise<void> {
    await this.call('action_confirm')
  }

  async receive(): Promise<void> {
    await this.call('action_receive')
  }

  async cancel(): Promise<void> {
    const [cancelType] = await this.rpc.search('medofa.cancel.type', [], ['id'])
    await this.call('cancel_order_with_reason', cancelType.id, 'Cancel')
  }

}