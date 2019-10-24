// MDS Infra API Tests

describe('MDS Infra API Tests', () => {

  // API call test: GET /test/fire_metrics_sheet
  describe('GET /test/fire_metrics_sheet', () => {
    it('Makes a GET call to /test/fire_metrics_sheet', function() {
      const urlParams = {}
      const {} = urlParams
      cy.request({
        url: `http://localhost/agency/test/fire_metrics_sheet/`,
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
