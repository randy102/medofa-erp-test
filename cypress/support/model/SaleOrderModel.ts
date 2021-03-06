import { Field, SeedModel, ModelConfig, MRecord, ORecord, OdooRPC, SeedOption } from 'odoo-seeder';
import { ProductModel } from './ProductModel';
import { PartnerModel, PartnerOption } from './PartnerModel';


export class OrderLine extends SeedOption {
  @Field({ key: 'product_id', cls: ProductModel, auto: true })
  product: ORecord<ProductModel>

  @Field({ key: 'price_unit', def: 10000 })
  price: number

  @Field({ key: 'product_uom_qty', def: 1 })
  qty: number

  stockQty: number
}

export class SaleOrderOption extends SeedOption {
  @Field({ key: 'partner_id', cls: PartnerModel, def: OdooRPC.getPartnerId(), auto: true })
  partner: ORecord<PartnerModel, PartnerOption>

  @Field({ key: 'order_line', cls: OrderLine })
  orderLines: MRecord<OrderLine>

  state: 'Received' | 'Confirmed' | 'Cancelled' | 'Progressing' | 'Delivering' | 'Delivered'

  couponCode: string
}

export class SaleOrderModel extends SeedModel<SaleOrderOption> {
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
    if (option.couponCode) {
      await this.applyCouponCode(option.couponCode)
    }
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

  async applyCouponCode(code: string) {
    this.ensureIdExisted()
    await this.rpc.call('sale.coupon.apply.code', 'apply_code', this.getId(), code)
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
    await this.rpc.call('stock.immediate.transfer', 'process', immediateTransferId)
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