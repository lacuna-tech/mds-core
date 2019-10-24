// MDS Provider API Tests API Tests

describe('MDS Provider API Tests API Tests', () => {

  // API call test: GET /trips
  it('Makes a GET call to /trips', function() {
    cy.request({
      url: 'http://localhost/agency/trips',
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

  // API call test: GET /status_changes
  it('Makes a GET call to /status_changes', function() {
    cy.request({
      url: 'http://localhost/agency/status_changes',
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
