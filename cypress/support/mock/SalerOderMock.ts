import { BaseConfig, BaseMock, One2ManyConfig } from '../lib'
import { ProductMock } from './ProductMock';
import { OdooRPC } from "../utils";
import { PartnerMock } from "./PartnerMock";
import { Many2One, One2Many } from "../lib";

export class SaleOrderLineConfig extends One2ManyConfig {
  price?: number
  qty?: number
  stockQty?: number

  @Many2One
  product?: ProductMock
}

export class SaleOrderConfig extends BaseConfig<SaleOrderDepends> {
  @One2Many(SaleOrderLineConfig)
  orderLines: SaleOrderLineConfig[]

  partner: PartnerMock
  price: number
  price1: number
  qty: number
  qty1: number
  stockQty: number
  state: 'Received' | 'Confirmed' | 'Cancelled' | 'Progressing' | 'Delivering' | 'Delivered'
}

export type SaleOrderDepends = {
  product?: ProductMock
  product1?: ProductMock
  partner?: PartnerMock
}

export class SaleOrderMock extends BaseMock<SaleOrderConfig, SaleOrderDepends> {
  MODEL = 'sale.order'
  CAN_DELETE = true

  constructor(config?) {
    super(config, SaleOrderConfig);
  }

  protected async getDependency(config: Partial<SaleOrderConfig>): Promise<SaleOrderDepends> {
    const { price = 100000, stockQty = 0, depends } = config
    const { product } = depends
    if (!product) {
      depends.product = new ProductMock({ price, mainKhdQty: stockQty })
    }
    return depends
  }

  protected async getCreateParam(config: SaleOrderConfig, { product, partner }: SaleOrderDepends): Promise<object> {
    const { qty = 1, qty1 } = config

    const productData = await product.get(['product_variant_id', 'display_name', 'uom_id'])

    return {
      "picking_policy": "direct",
      "partner_id": partner?.getId() || OdooRPC.getPartnerId(),
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
        await this.processShip()
        break
      case 'Delivering':
        await this.processOut()
        break
      case 'Delivered':
        await this.processDelivery()
    }
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
    const immediateTransferId = await this.rpc.create('stock.immediate.transfer', {pick_ids: [[4, id]]})
    await this.rpc.call('stock.immediate.transfer', 'process', [immediateTransferId])
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
      const {picking_ids} = await this.get(['picking_ids'])
      await this.rpc.unlink('stock.picking', picking_ids)
    }
  }

  protected async shouldCleanup(config: Partial<SaleOrderConfig>, depends: Partial<SaleOrderDepends>): Promise<boolean> {
    return config.state != 'Progressing'
  }
}