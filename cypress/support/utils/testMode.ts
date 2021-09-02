export function enterTest() {
  cy.request({
    method: 'GET',
    url: '/database_rollback/activate',
    body: {
      "jsonrpc": "2.0",
      "params": {}
    }
  })
}

export function leaveTest() {
  cy.request({
    method: 'GET',
    url: '/database_rollback/rollback',
    body: {
      "jsonrpc": "2.0",
      "params": {}
    }
  })
}