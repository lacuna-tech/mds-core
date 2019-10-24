// MDS Daily API Tests API Tests

describe('MDS Daily API Tests API Tests', () => {

  // API call test: GET /admin/vehicle_counts
  it('Makes a GET call to /admin/vehicle_counts', function() {
    cy.request({
      url: 'http://localhost/agency/admin/vehicle_counts',
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

  // API call test: GET /admin/events
  it('Makes a GET call to /admin/events', function() {
    cy.request({
      url: 'http://localhost/agency/admin/events',
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

  // API call test: GET /admin/last_day_trips_by_provider
  it('Makes a GET call to /admin/last_day_trips_by_provider', function() {
    cy.request({
      url: 'http://localhost/agency/admin/last_day_trips_by_provider',
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

  // API call test: GET /admin/raw_trip_data/:trip_id
  it('Makes a GET call to /admin/raw_trip_data/:trip_id', function() {
    cy.request({
      url: 'http://localhost/agency/admin/raw_trip_data/:trip_id',
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

  // API call test: GET /admin/last_day_stats_by_provider
  it('Makes a GET call to /admin/last_day_stats_by_provider', function() {
    cy.request({
      url: 'http://localhost/agency/admin/last_day_stats_by_provider',
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
