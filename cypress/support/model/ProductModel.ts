import { Field, SeedModel, ModelConfig, SeedOption, randomString } from 'odoo-seeder';
import { CK, GlobalCache } from '../cache';

export class ProductOption extends SeedOption {
  @Field({ key: 'name', def: () => randomString() })
  name: string

  @Field({ key: 'list_price', def: 10000 })
  price: number

  mainHdQty?: number
  mainKhdQty?: number
  inboundQty?: number
  scrapQty?: number
}

export class ProductModel extends SeedModel<ProductOption> {
  private initQty = false

  protected getModelConfig(): ModelConfig {
    return { modelName: 'product.product', optionClass: ProductOption };
  }

  async create(val: object): Promise<number> {
    const templateId = await this.rpc.create('product.template', val)
    const [data] = await this.rpc.read('product.template', [templateId], ['product_variant_id'])
    return data['product_variant_id'][0]
  }

  async afterGenerate(option: ProductOption): Promise<void> {
    const { mainHdQty, mainKhdQty, inboundQty, scrapQty } = option
    if (!isNaN(mainHdQty) && mainHdQty > 0) {
      const mainHDLocationId = await GlobalCache.get(CK.MAIN_STOCK_HD_LOCATION_ID)
      await this.generateLotQuantity(mainHDLocationId, mainHdQty)
    }

    if (!isNaN(mainKhdQty) && mainKhdQty > 0) {
      await this.generateMainKhdQty(mainKhdQty)
    }

    if (!isNaN(inboundQty) && inboundQty > 0) {
      const inboundLocationId = await GlobalCache.get(CK.INB_STOCK_LOCATION_ID)
      await this.generateLotQuantity(inboundLocationId, inboundQty)
    }

    if (!isNaN(scrapQty) && scrapQty > 0) {
      const scrapLocationId = await GlobalCache.get(CK.SCRAP_STOCK_LOCATION_ID)
      await this.generateLotQuantity(scrapLocationId, scrapQty)
    }
  }

  protected async shouldCleanup(option: ProductOption): Promise<boolean> {
    return !this.initQty
  }

  async generateMainKhdQty(qty: number, lot?: number | string) {
    const mainKHDLocationId = await GlobalCache.get(CK.MAIN_STOCK_KHD_LOCATION_ID)
    await this.generateLotQuantity(mainKHDLocationId, qty, lot)
  }

  async generateLotQuantity(locationId: number, qty: number, lot: number | string = randomString()) {
    if (isNaN(qty) || qty <= 0) return
    const productId = this.getId()
    const companyId = await this.rpc.getCompanyId()

    const val = {
      inventory_quantity: qty,
      location_id: locationId,
      product_id: productId,
    }
    if (typeof lot == 'number') {
      val['lot_id'] = lot
    } else {
      val['lot_id'] = await this.rpc.call('stock.production.lot', 'create', {
        name: lot,
        product_id: productId,
        company_id: companyId
      })
    }
    await this.rpc.with_context({ 'inventory_mode': true }).call('stock.quant', 'create', val)
    this.initQty = true
  }

}