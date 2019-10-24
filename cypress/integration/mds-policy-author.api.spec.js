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
// POST /policies

it('Makes a POST call to /policies', function() {
  cy.request({
    url: 'http://localhost/agency/policies',
    auth: {
      bearer: "." + Base64.encode("{\"scope\": \"admin:all test:all\"}") + ".",
    },
    method: 'POST'
  })
  .then((resp) => {
    expect(resp.status).to.eq(200)
    expect(resp.headers['content-type']).to.eq('application/json; charset=utf-8');
    expect(resp.headers['server']).to.eq('istio-envoy');
    expect(resp.body).to.deep.eq({ normal: 'payload' });
  })
})
// POST /policies/:policy_id/publish

it('Makes a POST call to /policies/:policy_id/publish', function() {
  cy.request({
    url: 'http://localhost/agency/policies/:policy_id/publish',
    auth: {
      bearer: "." + Base64.encode("{\"scope\": \"admin:all test:all\"}") + ".",
    },
    method: 'POST'
  })
  .then((resp) => {
    expect(resp.status).to.eq(200)
    expect(resp.headers['content-type']).to.eq('application/json; charset=utf-8');
    expect(resp.headers['server']).to.eq('istio-envoy');
    expect(resp.body).to.deep.eq({ normal: 'payload' });
  })
})
// PUT /policies/:policy_id

it('Makes a PUT call to /policies/:policy_id', function() {
  cy.request({
    url: 'http://localhost/agency/policies/:policy_id',
    auth: {
      bearer: "." + Base64.encode("{\"scope\": \"admin:all test:all\"}") + ".",
    },
    method: 'PUT'
  })
  .then((resp) => {
    expect(resp.status).to.eq(200)
    expect(resp.headers['content-type']).to.eq('application/json; charset=utf-8');
    expect(resp.headers['server']).to.eq('istio-envoy');
    expect(resp.body).to.deep.eq({ normal: 'payload' });
  })
})
// DELETE /policies/:policy_id

it('Makes a DELETE call to /policies/:policy_id', function() {
  cy.request({
    url: 'http://localhost/agency/policies/:policy_id',
    auth: {
      bearer: "." + Base64.encode("{\"scope\": \"admin:all test:all\"}") + ".",
    },
    method: 'DELETE'
  })
  .then((resp) => {
    expect(resp.status).to.eq(200)
    expect(resp.headers['content-type']).to.eq('application/json; charset=utf-8');
    expect(resp.headers['server']).to.eq('istio-envoy');
    expect(resp.body).to.deep.eq({ normal: 'payload' });
  })
})
// GET /policies/meta/

it('Makes a GET call to /policies/meta/', function() {
  cy.request({
    url: 'http://localhost/agency/policies/meta/',
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
// GET /policies/:policy_id/meta

it('Makes a GET call to /policies/:policy_id/meta', function() {
  cy.request({
    url: 'http://localhost/agency/policies/:policy_id/meta',
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
// PUT /policies/:policy_id/meta

it('Makes a PUT call to /policies/:policy_id/meta', function() {
  cy.request({
    url: 'http://localhost/agency/policies/:policy_id/meta',
    auth: {
      bearer: "." + Base64.encode("{\"scope\": \"admin:all test:all\"}") + ".",
    },
    method: 'PUT'
  })
  .then((resp) => {
    expect(resp.status).to.eq(200)
    expect(resp.headers['content-type']).to.eq('application/json; charset=utf-8');
    expect(resp.headers['server']).to.eq('istio-envoy');
    expect(resp.body).to.deep.eq({ normal: 'payload' });
  })
})
// GET /geographies/meta/

it('Makes a GET call to /geographies/meta/', function() {
  cy.request({
    url: 'http://localhost/agency/geographies/meta/',
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
// POST /geographies/

it('Makes a POST call to /geographies/', function() {
  cy.request({
    url: 'http://localhost/agency/geographies/',
    auth: {
      bearer: "." + Base64.encode("{\"scope\": \"admin:all test:all\"}") + ".",
    },
    method: 'POST'
  })
  .then((resp) => {
    expect(resp.status).to.eq(200)
    expect(resp.headers['content-type']).to.eq('application/json; charset=utf-8');
    expect(resp.headers['server']).to.eq('istio-envoy');
    expect(resp.body).to.deep.eq({ normal: 'payload' });
  })
})
// PUT /geographies/:geography_id

it('Makes a PUT call to /geographies/:geography_id', function() {
  cy.request({
    url: 'http://localhost/agency/geographies/:geography_id',
    auth: {
      bearer: "." + Base64.encode("{\"scope\": \"admin:all test:all\"}") + ".",
    },
    method: 'PUT'
  })
  .then((resp) => {
    expect(resp.status).to.eq(200)
    expect(resp.headers['content-type']).to.eq('application/json; charset=utf-8');
    expect(resp.headers['server']).to.eq('istio-envoy');
    expect(resp.body).to.deep.eq({ normal: 'payload' });
  })
})
// DELETE /geographies/:geography_id

it('Makes a DELETE call to /geographies/:geography_id', function() {
  cy.request({
    url: 'http://localhost/agency/geographies/:geography_id',
    auth: {
      bearer: "." + Base64.encode("{\"scope\": \"admin:all test:all\"}") + ".",
    },
    method: 'DELETE'
  })
  .then((resp) => {
    expect(resp.status).to.eq(200)
    expect(resp.headers['content-type']).to.eq('application/json; charset=utf-8');
    expect(resp.headers['server']).to.eq('istio-envoy');
    expect(resp.body).to.deep.eq({ normal: 'payload' });
  })
})
// GET /geographies/:geography_id/meta

it('Makes a GET call to /geographies/:geography_id/meta', function() {
  cy.request({
    url: 'http://localhost/agency/geographies/:geography_id/meta',
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
// GET /geographies

it('Makes a GET call to /geographies', function() {
  cy.request({
    url: 'http://localhost/agency/geographies',
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
// PUT /geographies/:geography_id/meta

it('Makes a PUT call to /geographies/:geography_id/meta', function() {
  cy.request({
    url: 'http://localhost/agency/geographies/:geography_id/meta',
    auth: {
      bearer: "." + Base64.encode("{\"scope\": \"admin:all test:all\"}") + ".",
    },
    method: 'PUT'
  })
  .then((resp) => {
    expect(resp.status).to.eq(200)
    expect(resp.headers['content-type']).to.eq('application/json; charset=utf-8');
    expect(resp.headers['server']).to.eq('istio-envoy');
    expect(resp.body).to.deep.eq({ normal: 'payload' });
  })
})
