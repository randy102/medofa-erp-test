import Chainable = Cypress.Chainable;

export function cy_wrap(asyncCallback: () => Promise<any>): Chainable<any> {
  return cy.wrap("Wrap").then({ timeout: 30000 }, () => {
    return new Cypress.Promise(resolve => {
      asyncCallback().then((result) => {
        resolve(result)
      })
    })
  })
}