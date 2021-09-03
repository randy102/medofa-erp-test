import Chainable = Cypress.Chainable;

export function cy_sync(asyncCallback: () => Promise<any>): Chainable<any> {
  return cy.then({ timeout: 30000 }, () => asyncCallback())
}