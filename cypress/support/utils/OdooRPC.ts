import Odoo = require("odoo-xmlrpc");

export default class OdooRPC {
  static instance
  odoo

  constructor() {
    console.log('-----------Create OdooRPC instance-------------')
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
    return this.call(model, 'unlink', id)
  }

  call(model, method, ...params): Promise<any> {
    const odooInstance = this.odoo
    return new Promise((resolve, reject) => {
      odooInstance.connect(function (err) {
        if (err) {
          console.log(model, method, params, { err })
          reject(err)
        }
        odooInstance.execute_kw(model, method, [params], function (err, value) {
          if (err) {
            console.log(model, method, params, { err })
            reject(err)
          }
          resolve(value)
          console.log(model, method, params, { value })
        });
      });
    })
  }
}