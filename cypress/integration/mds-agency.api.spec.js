// MDS Agency API Tests

describe('MDS Agency API Tests', () => {

  // API call test: GET /service_areas
  describe('GET /service_areas', () => {
    it('Makes a GET call to /service_areas', function() {
      const urlParams = {}
      const {} = urlParams
      cy.request({
        url: `http://localhost/agency/service_areas/`,
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

  // API call test: GET /service_areas/:service_area_id
  describe('GET /service_areas/:service_area_id', () => {
    it('Makes a GET call to /service_areas/:service_area_id', function() {
      const urlParams = {'service_area_id': 'some_value'}
      const {service_area_id} = urlParams
      cy.request({
        url: `http://localhost/agency/service_areas/${service_area_id}/`,
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

  // API call test: POST /vehicles
  describe('POST /vehicles', () => {
    it('Makes a POST call to /vehicles', function() {
      const urlParams = {}
      const {} = urlParams
      cy.request({
        url: `http://localhost/agency/vehicles/`,
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

  // API call test: GET /vehicles
  describe('GET /vehicles', () => {
    it('Makes a GET call to /vehicles', function() {
      const urlParams = {}
      const {} = urlParams
      cy.request({
        url: `http://localhost/agency/vehicles/`,
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

  // API call test: PUT /vehicles/:device_id
  describe('PUT /vehicles/:device_id', () => {
    it('Makes a PUT call to /vehicles/:device_id', function() {
      const urlParams = {'device_id': 'some_value'}
      const {device_id} = urlParams
      cy.request({
        url: `http://localhost/agency/vehicles/${device_id}/`,
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
  })

  // API call test: POST /vehicles/:device_id/event
  describe('POST /vehicles/:device_id/event', () => {
    it('Makes a POST call to /vehicles/:device_id/event', function() {
      const urlParams = {'device_id': 'some_value'}
      const {device_id} = urlParams
      cy.request({
        url: `http://localhost/agency/vehicles/${device_id}/event/`,
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
  })

  // API call test: POST /vehicles/telemetry
  describe('POST /vehicles/telemetry', () => {
    it('Makes a POST call to /vehicles/telemetry', function() {
      const urlParams = {}
      const {} = urlParams
      cy.request({
        url: `http://localhost/agency/vehicles/telemetry/`,
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
  })

  // API call test: GET /admin/vehicle_ids
  describe('GET /admin/vehicle_ids', () => {
    it('Makes a GET call to /admin/vehicle_ids', function() {
      const urlParams = {}
      const {} = urlParams
      cy.request({
        url: `http://localhost/agency/admin/vehicle_ids/`,
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

  // API call test: GET /admin/cache/info
  describe('GET /admin/cache/info', () => {
    it('Makes a GET call to /admin/cache/info', function() {
      const urlParams = {}
      const {} = urlParams
      cy.request({
        url: `http://localhost/agency/admin/cache/info/`,
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

  // API call test: GET /admin/wipe/:device_id
  describe('GET /admin/wipe/:device_id', () => {
    it('Makes a GET call to /admin/wipe/:device_id', function() {
      const urlParams = {'device_id': 'some_value'}
      const {device_id} = urlParams
      cy.request({
        url: `http://localhost/agency/admin/wipe/${device_id}/`,
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

  // API call test: GET /admin/cache/refresh
  describe('GET /admin/cache/refresh', () => {
    it('Makes a GET call to /admin/cache/refresh', function() {
      const urlParams = {}
      const {} = urlParams
      cy.request({
        url: `http://localhost/agency/admin/cache/refresh/`,
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
