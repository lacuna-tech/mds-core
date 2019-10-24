// MDS Native API Tests

describe('MDS Native API Tests', () => {

  // API call test: GET /events/:cursor?
  describe('GET /events/:cursor?', () => {
    it('Makes a GET call to /events/:cursor?', function() {
      const urlParams = {'cursor': 'some_value'}
      const {cursor} = urlParams
      cy.request({
        url: `http://localhost/agency/events/${cursor}/`,
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

  // API call test: GET /vehicles/:device_id
  describe('GET /vehicles/:device_id', () => {
    it('Makes a GET call to /vehicles/:device_id', function() {
      const urlParams = {'device_id': 'some_value'}
      const {device_id} = urlParams
      cy.request({
        url: `http://localhost/agency/vehicles/${device_id}/`,
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

  // API call test: GET /providers
  describe('GET /providers', () => {
    it('Makes a GET call to /providers', function() {
      const urlParams = {}
      const {} = urlParams
      cy.request({
        url: `http://localhost/agency/providers/`,
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
