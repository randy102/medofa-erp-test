import OdooRPC from '../utils/OdooRPC'

export default class BaseMock {
  id
  rpc
  MODEL

  constructor() {
    this.rpc = OdooRPC.getInstance()
  }

  cleanup() {
    return this.rpc.archive(this.MODEL, this.id)
  }

  _generate(val) {
    return cy.wrap("Generate Mock Data").then({timeout: 20000},() => {
      return this.rpc.create(this.MODEL, val).then(result => {
        console.log('Mock Generated')
        this.id = result
      })
    })
  }
}