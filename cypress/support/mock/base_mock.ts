import OdooRPC from '../utils/OdooRPC'

export default class BaseMock {
  id: number
  rpc: OdooRPC
  MODEL: string
  canDelete: boolean

  constructor(canDelete = false) {
    this.rpc = OdooRPC.getInstance()
    this.canDelete = canDelete
  }

  async cleanup() {
    if (this.canDelete)
       await this.rpc.unlink(this.MODEL, this.id)
    else
      await this.rpc.archive(this.MODEL, this.id)
  }

  async _get(fields) {
    const [result] = await this.rpc.read(this.MODEL, this.id, fields)
    return result
  }

  with_cy(asyncCallback, ...args) {
    return cy.wrap("Mock").then({timeout: 30000}, () => {
      return new Cypress.Promise(resolve => {
        asyncCallback.call(this, ...args).then(resolve)
      })
    })
  }

  _generate(val) {
    return this.rpc.create(this.MODEL, val).then(result => {
      console.log('Mock Generated')
      this.id = result
    })
  }
}