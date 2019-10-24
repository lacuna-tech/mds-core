// MDS Policy-author API Tests

describe('MDS Policy-author API Tests', () => {

  // API call test: GET /policies
  describe('GET /policies', () => {
    it('Makes a GET call to /policies', function() {
      const urlParams = {}
      const {} = urlParams
      cy.request({
        url: `http://localhost/agency/policies/`,
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

  // API call test: POST /policies
  describe('POST /policies', () => {
    it('Makes a POST call to /policies', function() {
      const urlParams = {}
      const {} = urlParams
      cy.request({
        url: `http://localhost/agency/policies/`,
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

  // API call test: POST /policies/:policy_id/publish
  describe('POST /policies/:policy_id/publish', () => {
    it('Makes a POST call to /policies/:policy_id/publish', function() {
      const urlParams = {'policy_id': 'some_value'}
      const {policy_id} = urlParams
      cy.request({
        url: `http://localhost/agency/policies/${policy_id}/publish/`,
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

  // API call test: PUT /policies/:policy_id
  describe('PUT /policies/:policy_id', () => {
    it('Makes a PUT call to /policies/:policy_id', function() {
      const urlParams = {'policy_id': 'some_value'}
      const {policy_id} = urlParams
      cy.request({
        url: `http://localhost/agency/policies/${policy_id}/`,
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

  // API call test: DELETE /policies/:policy_id
  describe('DELETE /policies/:policy_id', () => {
    it('Makes a DELETE call to /policies/:policy_id', function() {
      const urlParams = {'policy_id': 'some_value'}
      const {policy_id} = urlParams
      cy.request({
        url: `http://localhost/agency/policies/${policy_id}/`,
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

  // API call test: GET /policies/meta/
  describe('GET /policies/meta/', () => {
    it('Makes a GET call to /policies/meta/', function() {
      const urlParams = {}
      const {} = urlParams
      cy.request({
        url: `http://localhost/agency/policies/meta//`,
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

  // API call test: GET /policies/:policy_id
  describe('GET /policies/:policy_id', () => {
    it('Makes a GET call to /policies/:policy_id', function() {
      const urlParams = {'policy_id': 'some_value'}
      const {policy_id} = urlParams
      cy.request({
        url: `http://localhost/agency/policies/${policy_id}/`,
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

  // API call test: GET /policies/:policy_id/meta
  describe('GET /policies/:policy_id/meta', () => {
    it('Makes a GET call to /policies/:policy_id/meta', function() {
      const urlParams = {'policy_id': 'some_value'}
      const {policy_id} = urlParams
      cy.request({
        url: `http://localhost/agency/policies/${policy_id}/meta/`,
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

  // API call test: PUT /policies/:policy_id/meta
  describe('PUT /policies/:policy_id/meta', () => {
    it('Makes a PUT call to /policies/:policy_id/meta', function() {
      const urlParams = {'policy_id': 'some_value'}
      const {policy_id} = urlParams
      cy.request({
        url: `http://localhost/agency/policies/${policy_id}/meta/`,
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

  // API call test: GET /geographies/meta/
  describe('GET /geographies/meta/', () => {
    it('Makes a GET call to /geographies/meta/', function() {
      const urlParams = {}
      const {} = urlParams
      cy.request({
        url: `http://localhost/agency/geographies/meta//`,
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

  // API call test: GET /geographies/:geography_id
  describe('GET /geographies/:geography_id', () => {
    it('Makes a GET call to /geographies/:geography_id', function() {
      const urlParams = {'geography_id': 'some_value'}
      const {geography_id} = urlParams
      cy.request({
        url: `http://localhost/agency/geographies/${geography_id}/`,
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

  // API call test: POST /geographies/
  describe('POST /geographies/', () => {
    it('Makes a POST call to /geographies/', function() {
      const urlParams = {}
      const {} = urlParams
      cy.request({
        url: `http://localhost/agency/geographies//`,
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

  // API call test: PUT /geographies/:geography_id
  describe('PUT /geographies/:geography_id', () => {
    it('Makes a PUT call to /geographies/:geography_id', function() {
      const urlParams = {'geography_id': 'some_value'}
      const {geography_id} = urlParams
      cy.request({
        url: `http://localhost/agency/geographies/${geography_id}/`,
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

  // API call test: DELETE /geographies/:geography_id
  describe('DELETE /geographies/:geography_id', () => {
    it('Makes a DELETE call to /geographies/:geography_id', function() {
      const urlParams = {'geography_id': 'some_value'}
      const {geography_id} = urlParams
      cy.request({
        url: `http://localhost/agency/geographies/${geography_id}/`,
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

  // API call test: GET /geographies/:geography_id/meta
  describe('GET /geographies/:geography_id/meta', () => {
    it('Makes a GET call to /geographies/:geography_id/meta', function() {
      const urlParams = {'geography_id': 'some_value'}
      const {geography_id} = urlParams
      cy.request({
        url: `http://localhost/agency/geographies/${geography_id}/meta/`,
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

  // API call test: GET /geographies
  describe('GET /geographies', () => {
    it('Makes a GET call to /geographies', function() {
      const urlParams = {}
      const {} = urlParams
      cy.request({
        url: `http://localhost/agency/geographies/`,
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

  // API call test: PUT /geographies/:geography_id/meta
  describe('PUT /geographies/:geography_id/meta', () => {
    it('Makes a PUT call to /geographies/:geography_id/meta', function() {
      const urlParams = {'geography_id': 'some_value'}
      const {geography_id} = urlParams
      cy.request({
        url: `http://localhost/agency/geographies/${geography_id}/meta/`,
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

})
