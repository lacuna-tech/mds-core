// POST /trips/:audit_trip_id/start

it('Makes a POST call to /trips/:audit_trip_id/start', function() {
  cy.request({
    url: 'http://localhost/agency/trips/:audit_trip_id/start',
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
// POST /trips/:audit_trip_id/vehicle/event

it('Makes a POST call to /trips/:audit_trip_id/vehicle/event', function() {
  cy.request({
    url: 'http://localhost/agency/trips/:audit_trip_id/vehicle/event',
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
// POST /trips/:audit_trip_id/vehicle/telemetry

it('Makes a POST call to /trips/:audit_trip_id/vehicle/telemetry', function() {
  cy.request({
    url: 'http://localhost/agency/trips/:audit_trip_id/vehicle/telemetry',
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
// POST /trips/:audit_trip_id/note

it('Makes a POST call to /trips/:audit_trip_id/note', function() {
  cy.request({
    url: 'http://localhost/agency/trips/:audit_trip_id/note',
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
// POST /trips/:audit_trip_id/end

it('Makes a POST call to /trips/:audit_trip_id/end', function() {
  cy.request({
    url: 'http://localhost/agency/trips/:audit_trip_id/end',
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
// GET /trips/:audit_trip_id

it('Makes a GET call to /trips/:audit_trip_id', function() {
  cy.request({
    url: 'http://localhost/agency/trips/:audit_trip_id',
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
// DELETE /trips/:audit_trip_id

it('Makes a DELETE call to /trips/:audit_trip_id', function() {
  cy.request({
    url: 'http://localhost/agency/trips/:audit_trip_id',
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
// GET /trips

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
// GET /vehicles

it('Makes a GET call to /vehicles', function() {
  cy.request({
    url: 'http://localhost/agency/vehicles',
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
// GET /vehicles/:provider_id/vin/:vin

it('Makes a GET call to /vehicles/:provider_id/vin/:vin', function() {
  cy.request({
    url: 'http://localhost/agency/vehicles/:provider_id/vin/:vin',
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
