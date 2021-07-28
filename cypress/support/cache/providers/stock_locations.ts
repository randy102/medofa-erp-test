import { GlobalCache } from "../GlobalCache";
import { CK } from "../Keys";
import { OdooRPC } from "../../utils";

async function findLocation(pattern: string, rpc): Promise<number> {
  const [location] = await rpc.search('stock.location', [['complete_name', 'like', pattern]], ['id'])
  return location['id']
}

GlobalCache.provide(CK.INB_STOCK_LOCATION_ID, async (rpc: OdooRPC) => {
  return findLocation('INB/Stock', rpc)
})

GlobalCache.provide(CK.MAIN_STOCK_KHD_LOCATION_ID, async (rpc: OdooRPC) => {
  return findLocation('MAIN/Stock/KHD', rpc)
})

GlobalCache.provide(CK.MAIN_STOCK_HD_LOCATION_ID, async (rpc: OdooRPC) => {
  return findLocation('MAIN/Stock/HD', rpc)
})

GlobalCache.provide(CK.SCRAP_STOCK_LOCATION_ID, async (rpc: OdooRPC) => {
  return findLocation('SCRAP/Stock', rpc)
})