import {BaseConfig, BaseMock} from './BaseMock'
import {CK, GlobalCache} from "../cache";
import {randomString} from "../utils";

export class ProductConfig extends BaseConfig<ProductDepend> {
  name?: string
  price?: number
  mainHdQty?: number
  mainKhdQty?: number
  inboundQty?: number
  scrapQty?: number
}

export type ProductDepend = {}

export class ProductMock extends BaseMock<ProductConfig, ProductDepend> {
  MODEL = 'product.template'
  CAN_DELETE = true

  protected async getDependency(config: Partial<ProductConfig>): Promise<ProductDepend> {
    return {};
  }

  protected async getCreateParam({ price, name }: ProductConfig): Promise<object> {
    return {
      name: name || randomString(),
      list_price: price || 100000
    }
  }

  protected async afterGenerated(id: number, { mainHdQty, mainKhdQty, inboundQty, scrapQty }: Partial<ProductConfig>): Promise<void> {
    if (!isNaN(mainHdQty) && mainHdQty > 0) {
      const mainHDLocationId = await GlobalCache.get(CK.MAIN_STOCK_HD_LOCATION_ID)
      await this.generateLotQuantity(mainHDLocationId, randomString(), mainHdQty)
    }

    if (!isNaN(mainKhdQty) && mainKhdQty > 0) {
      await this.generateMainKhdQty(randomString(), mainKhdQty)
    }

    if (!isNaN(inboundQty) && inboundQty > 0) {
      const inboundLocationId = await GlobalCache.get(CK.INB_STOCK_LOCATION_ID)
      await this.generateLotQuantity(inboundLocationId, randomString(), inboundQty)
    }

    if (!isNaN(scrapQty) && scrapQty > 0){
      const scrapLocationId = await GlobalCache.get(CK.SCRAP_STOCK_LOCATION_ID)
      await this.generateLotQuantity(scrapLocationId, randomString(), scrapQty)
    }
  }

  async generateMainKhdQty(lot: number | string, qty: number){
    const mainKHDLocationId = await GlobalCache.get(CK.MAIN_STOCK_KHD_LOCATION_ID)
    await this.generateLotQuantity(mainKHDLocationId, randomString(), qty)
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