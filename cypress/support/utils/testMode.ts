import axios from 'axios';

export function enterTest() {
  return axios.post(process.env.BASE_URL + '/database_rollback/activate', {
    method: 'POST',
    data: {
      "jsonrpc": "2.0",
      "params": {}
    }
  }).then(() => console.log('Enter Test Mode'))
  // cy.request({
  //   method: 'GET',
  //   url: '/database_rollback/activate',
  //   body: {
  //     "jsonrpc": "2.0",
  //     "params": {}
  //   }
  // })
}

export function leaveTest() {
  return axios.post(process.env.BASE_URL + '/database_rollback/rollback', {
    method: 'POST',
    data: {
      "jsonrpc": "2.0",
      "params": {}
    }
  }).then(() => console.log('Rollback Database'))
  // cy.request({
  //   method: 'GET',
  //   url: '/database_rollback/rollback',
  //   body: {
  //     "jsonrpc": "2.0",
  //     "params": {}
  //   }
  // })
}