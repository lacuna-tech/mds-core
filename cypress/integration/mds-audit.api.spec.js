// MDS Audit API Tests

describe('MDS Audit API Tests', () => {

  // API call test: POST /trips/:audit_trip_id/start
  describe('POST /trips/:audit_trip_id/start', () => {
    it('Makes a POST call to /trips/:audit_trip_id/start', function() {
      const urlParams = {'audit_trip_id': 'some_value'}
      const {audit_trip_id} = urlParams
      cy.request({
        url: `http://localhost/agency/trips/${audit_trip_id}/start/`,
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

  // API call test: POST /trips/:audit_trip_id/vehicle/event
  describe('POST /trips/:audit_trip_id/vehicle/event', () => {
    it('Makes a POST call to /trips/:audit_trip_id/vehicle/event', function() {
      const urlParams = {'audit_trip_id': 'some_value'}
      const {audit_trip_id} = urlParams
      cy.request({
        url: `http://localhost/agency/trips/${audit_trip_id}/vehicle/event/`,
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

  // API call test: POST /trips/:audit_trip_id/vehicle/telemetry
  describe('POST /trips/:audit_trip_id/vehicle/telemetry', () => {
    it('Makes a POST call to /trips/:audit_trip_id/vehicle/telemetry', function() {
      const urlParams = {'audit_trip_id': 'some_value'}
      const {audit_trip_id} = urlParams
      cy.request({
        url: `http://localhost/agency/trips/${audit_trip_id}/vehicle/telemetry/`,
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

  // API call test: POST /trips/:audit_trip_id/note
  describe('POST /trips/:audit_trip_id/note', () => {
    it('Makes a POST call to /trips/:audit_trip_id/note', function() {
      const urlParams = {'audit_trip_id': 'some_value'}
      const {audit_trip_id} = urlParams
      cy.request({
        url: `http://localhost/agency/trips/${audit_trip_id}/note/`,
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

  // API call test: POST /trips/:audit_trip_id/end
  describe('POST /trips/:audit_trip_id/end', () => {
    it('Makes a POST call to /trips/:audit_trip_id/end', function() {
      const urlParams = {'audit_trip_id': 'some_value'}
      const {audit_trip_id} = urlParams
      cy.request({
        url: `http://localhost/agency/trips/${audit_trip_id}/end/`,
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

  // API call test: GET /trips/:audit_trip_id
  describe('GET /trips/:audit_trip_id', () => {
    it('Makes a GET call to /trips/:audit_trip_id', function() {
      const urlParams = {'audit_trip_id': 'some_value'}
      const {audit_trip_id} = urlParams
      cy.request({
        url: `http://localhost/agency/trips/${audit_trip_id}/`,
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

  // API call test: DELETE /trips/:audit_trip_id
  describe('DELETE /trips/:audit_trip_id', () => {
    it('Makes a DELETE call to /trips/:audit_trip_id', function() {
      const urlParams = {'audit_trip_id': 'some_value'}
      const {audit_trip_id} = urlParams
      cy.request({
        url: `http://localhost/agency/trips/${audit_trip_id}/`,
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
  })

  // API call test: GET /trips
  describe('GET /trips', () => {
    it('Makes a GET call to /trips', function() {
      const urlParams = {}
      const {} = urlParams
      cy.request({
        url: `http://localhost/agency/trips/`,
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

  // API call test: GET /vehicles/:provider_id/vin/:vin
  describe('GET /vehicles/:provider_id/vin/:vin', () => {
    it('Makes a GET call to /vehicles/:provider_id/vin/:vin', function() {
      const urlParams = {'provider_id': 'some_value', 'vin': 'some_value'}
      const {provider_id,vin} = urlParams
      cy.request({
        url: `http://localhost/agency/vehicles/${provider_id}/vin/${vin}/`,
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
