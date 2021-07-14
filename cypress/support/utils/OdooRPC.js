import Odoo from 'odoo-xmlrpc'

export default class OdooRPC {
  static instance
  odoo

  constructor() {
    console.log('-----------Create OdooRPC instance-------------')
    this.odoo = new Odoo({
      url: Cypress.config('baseUrl'),
      port: +Cypress.env('erpPort'),
      db: Cypress.env('erpDB'),
      username: Cypress.env('erpUsername'),
      password: Cypress.env('erpPassword')
    });
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new OdooRPC()
    }
    return this.instance
  }

  create(model, val) {
    return this.call(model, 'create', val)
  }

  write(model, id, val) {
    return this.call(model, 'write', [id], val)
  }

  archive(model, id) {
    return this.write(model, id, {'active': false})
  }

  call(model, method, ...params) {
    console.log(params)
    const odooInstance = this.odoo
    return new Cypress.Promise((resolve, reject) => {
      odooInstance.connect(function (err) {
        if (err) {
          console.log({err})
          reject(err)
        }
        odooInstance.execute_kw(model, method, [params], function (err, value) {
          if (err) {
            console.log({err})
            reject(err)
          }
          resolve(value)
        });
      });
    })
  }

}