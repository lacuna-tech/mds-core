// MDS Compliance API Tests

describe('MDS Compliance API Tests', () => {

  // API call test: GET /snapshot/:policy_uuid
  describe('GET /snapshot/:policy_uuid', () => {
    it('Makes a GET call to /snapshot/:policy_uuid', function() {
      const urlParams = {'policy_uuid': 'some_value'}
      const {policy_uuid} = urlParams
      cy.request({
        url: `http://localhost/agency/snapshot/${policy_uuid}/`,
        auth: {
          bearer: "." + Base64.encode("{\"scope\": \"admin:all test:all\"}") + ".",
        },
        method: 'GET'
      })
      .then((resp) => {
        expect(resp.status).to.eq(200)
        expect(resp.headers['content-type']).to.eq('application/json; charset=utf-8');
        expect(resp.headers['server']).to.eq('istio-envoy');
        expect(resp.body).to.deep.eq({ normal: 'payload' });
      })
    })
  })

  // API call test: GET /count/:rule_id
  describe('GET /count/:rule_id', () => {
    it('Makes a GET call to /count/:rule_id', function() {
      const urlParams = {'rule_id': 'some_value'}
      const {rule_id} = urlParams
      cy.request({
        url: `http://localhost/agency/count/${rule_id}/`,
        auth: {
          bearer: "." + Base64.encode("{\"scope\": \"admin:all test:all\"}") + ".",
        },
        method: 'GET'
      })
      .then((resp) => {
        expect(resp.status).to.eq(200)
        expect(resp.headers['content-type']).to.eq('application/json; charset=utf-8');
        expect(resp.headers['server']).to.eq('istio-envoy');
        expect(resp.body).to.deep.eq({ normal: 'payload' });
      })
    })
  })

})
