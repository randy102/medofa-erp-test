export function login() {
  cy.request({
    method: 'GET',
    url: '/web/session/authenticate',
    body: {
      "jsonrpc": "2.0",
      "params": {
        "db": Cypress.env('erpDB'),
        "login": Cypress.env('erpUsername'),
        "password": Cypress.env('erpPassword')
      }
    }
  })
  // cy.request('/').its('body').then(body => {
  //   const $html = Cypress.$(body)
  //   const csrf = $html.find('input[name=csrf_token]').val()
  //
  //   cy.request({
  //     method: 'POST',
  //     url: '/web/login',
  //     failOnStatusCode: false,
  //     form: true,
  //     body: {
  //       login: Cypress.env('erpUsername'),
  //       password: Cypress.env('erpPassword'),
  //       csrf_token: csrf,
  //     },
  //   }).then((resp) => {
  //     console.log("Logged in")
  //     expect(resp.status).to.eq(200)
  //   })
  // })
}