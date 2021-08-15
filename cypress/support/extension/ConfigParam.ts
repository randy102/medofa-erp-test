import { OdooRPC } from '../lib';


export class ConfigParam {
  private rpc: OdooRPC
  private MODEL = 'ir.config_parameter'

  constructor() {
    this.rpc = OdooRPC.getInstance()
  }

  async get(name: string): Promise<any> {
    return this.rpc.call(this.MODEL, 'get_param', name)
  }

  async set(name: string, value: any): Promise<void> {
    return this.rpc.call(this.MODEL, 'set_param', name, value)
  }

}