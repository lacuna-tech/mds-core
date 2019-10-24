// GET /snapshot/:policy_uuid

it('Makes a GET call to /snapshot/:policy_uuid', function() {
  cy.request({
    url: 'http://localhost/agency/snapshot/:policy_uuid',
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
// GET /count/:rule_id

it('Makes a GET call to /count/:rule_id', function() {
  cy.request({
    url: 'http://localhost/agency/count/:rule_id',
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
