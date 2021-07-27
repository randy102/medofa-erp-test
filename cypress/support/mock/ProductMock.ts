import {BaseConfig, BaseMock} from './BaseMock'
import random from '../utils/random';
import {CK, GlobalCache} from "../cache";

export class ProductConfig extends BaseConfig<ProductDepend> {
  name?: string
  price?: number
  mainQty?: number
  inboundQty?: number
}

export type ProductDepend = {}

enum CacheKey {
  MAIN_LOCATION_ID,
  ADJUSTMENT_LOCATION_ID,
  INB_LOCATION_ID
}

export class ProductMock extends BaseMock<ProductConfig, ProductDepend> {
  MODEL = 'product.template'
  CAN_DELETE = true

  protected async getDependency(config: Partial<ProductConfig>): Promise<ProductDepend> {
    return {};
  }

  protected async getCreateParam({ price, name }: ProductConfig): Promise<object> {
    return {
      name: name || random(),
      list_price: price || 100000
    }
  }

  protected async afterGenerated(id: number, { mainQty, inboundQty }: Partial<ProductConfig>): Promise<void> {
    if (!isNaN(mainQty) && mainQty > 0) {
      const mainLocationId = await GlobalCache.get(CK.MAIN_STOCK_KHD_LOCATION_ID)
      await this.generateLotQuantity(mainLocationId, random(), mainQty)
    }

    if (!isNaN(inboundQty) && inboundQty > 0) {
      const inboundLocationId = await GlobalCache.get(CK.INB_STOCK_LOCATION_ID)
      await this.generateLotQuantity(inboundLocationId, random(), inboundQty)
    }
  }

  async generateLotQuantity(locationId: number, lot: number | string, qty: number): Promise<void> {
    const { product_variant_id } = await this.get(['product_variant_id', 'uom_id','company_id'])
    const productId = product_variant_id[0]
    const companyId = await this.rpc.getCompanyId()

    const val = {
      inventory_quantity: qty,
      location_id: locationId,
      product_id: productId,
    }
    if (typeof lot == 'number') {
      val['lot_id'] = lot
    } else {
      val['lot_id'] = await this.rpc.call('stock.production.lot','create', {
        name: lot,
        product_id: productId,
        company_id: companyId
      })
    }
    await this.rpc.with_context({'inventory_mode': true}).call('stock.quant','create', val)
  }
}