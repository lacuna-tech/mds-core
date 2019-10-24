// GET /policies

it('Makes a GET call to /policies', function() {
  cy.request({
    url: 'http://localhost/agency/policies',
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
// GET /policies/:policy_id

it('Makes a GET call to /policies/:policy_id', function() {
  cy.request({
    url: 'http://localhost/agency/policies/:policy_id',
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
// GET /geographies/:geography_id

it('Makes a GET call to /geographies/:geography_id', function() {
  cy.request({
    url: 'http://localhost/agency/geographies/:geography_id',
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
// GET /schema/policy

it('Makes a GET call to /schema/policy', function() {
  cy.request({
    url: 'http://localhost/agency/schema/policy',
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
