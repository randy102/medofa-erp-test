import Odoo = require("odoo-xmlrpc");

export default class OdooRPC {
  private context
  static instance
  odoo

  constructor() {
    console.log('OdooRPC instance created.')
    this.odoo = new Odoo({
      url: Cypress.config('baseUrl'),
      port: Cypress.env('erpPort'),
      db: Cypress.env('erpDB'),
      username: Cypress.env('erpUsername'),
      password: Cypress.env('erpPassword')
    });
  }

  static getInstance(): OdooRPC {
    if (!this.instance) {
      this.instance = new OdooRPC()
    }
    return this.instance
  }

  create(model, val): Promise<number> {
    return this.call(model, 'create', val)
  }

  read(model, id, fields: string[] = []): Promise<any> {
    return this.call(model, 'read', [+id], fields)
  }

  write(model, id, val): Promise<void> {
    return this.call(model, 'write', [id], val)
  }

  archive(model, id): Promise<void> {
    return this.write(model, id, { 'active': false })
  }

  unlink(model, id): Promise<void> {
    if (!Array.isArray(id)){
      id = [id]
    }
    return this.call(model, 'unlink', id)
  }

  search(model, domain = [], fields: string[] = [], limit: number = 1): Promise<any[]> {
    return this.call(model, 'search_read', domain, fields, 0, limit)
  }

  async getCompanyId(): Promise<number>{
    const [user] = await this.search('res.users',[['partner_id.id','=',Cypress.env('erpPartnerId')]], ['company_id'])
    return user['company_id'][0]
  }

  with_context(context: object): OdooRPC{
    this.context = context
    return this
  }

  call(model, method, ...params): Promise<any> {
    const odooInstance = this.odoo
    let args = []
    args.push(params)
    if (this.context){
      args.push({'context': this.context})
      this.context = undefined
    }

    return new Promise((resolve, reject) => {
      odooInstance.connect(function (err) {
        if (err) {
          console.log(err)
          reject(err)
        }
        odooInstance.execute_kw(model, method, args, function (err, value) {
          if (err) {
            console.log(err)
            reject(err)
          } else{
            resolve(value)
            console.log(`Executed Successfully: ${model}.${method}(${JSON.stringify(params)}) => ${value}`)
          }
        });
      });
    })
  }
}