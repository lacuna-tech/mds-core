// MDS Agency API Tests API Tests

describe('MDS Agency API Tests API Tests', () => {

  // API call test: GET /service_areas
  it('Makes a GET call to /service_areas', function() {
    cy.request({
      url: 'http://localhost/agency/service_areas',
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

  // API call test: GET /service_areas/:service_area_id
  it('Makes a GET call to /service_areas/:service_area_id', function() {
    cy.request({
      url: 'http://localhost/agency/service_areas/:service_area_id',
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

  // API call test: POST /vehicles
  it('Makes a POST call to /vehicles', function() {
    cy.request({
      url: 'http://localhost/agency/vehicles',
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

  // API call test: GET /vehicles
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

  // API call test: PUT /vehicles/:device_id
  it('Makes a PUT call to /vehicles/:device_id', function() {
    cy.request({
      url: 'http://localhost/agency/vehicles/:device_id',
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

  // API call test: POST /vehicles/:device_id/event
  it('Makes a POST call to /vehicles/:device_id/event', function() {
    cy.request({
      url: 'http://localhost/agency/vehicles/:device_id/event',
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

  // API call test: POST /vehicles/telemetry
  it('Makes a POST call to /vehicles/telemetry', function() {
    cy.request({
      url: 'http://localhost/agency/vehicles/telemetry',
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

  // API call test: GET /admin/vehicle_ids
  it('Makes a GET call to /admin/vehicle_ids', function() {
    cy.request({
      url: 'http://localhost/agency/admin/vehicle_ids',
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

  // API call test: GET /admin/cache/info
  it('Makes a GET call to /admin/cache/info', function() {
    cy.request({
      url: 'http://localhost/agency/admin/cache/info',
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

  // API call test: GET /admin/wipe/:device_id
  it('Makes a GET call to /admin/wipe/:device_id', function() {
    cy.request({
      url: 'http://localhost/agency/admin/wipe/:device_id',
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

  // API call test: GET /admin/cache/refresh
  it('Makes a GET call to /admin/cache/refresh', function() {
    cy.request({
      url: 'http://localhost/agency/admin/cache/refresh',
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
