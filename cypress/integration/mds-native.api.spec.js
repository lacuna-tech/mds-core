// MDS Native API Tests API Tests

describe('MDS Native API Tests API Tests', () => {

  // API call test: GET /events/:cursor?
  it('Makes a GET call to /events/:cursor?', function() {
    cy.request({
      url: 'http://localhost/agency/events/:cursor?',
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

  // API call test: GET /vehicles/:device_id
  it('Makes a GET call to /vehicles/:device_id', function() {
    cy.request({
      url: 'http://localhost/agency/vehicles/:device_id',
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

  // API call test: GET /providers
  it('Makes a GET call to /providers', function() {
    cy.request({
      url: 'http://localhost/agency/providers',
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
