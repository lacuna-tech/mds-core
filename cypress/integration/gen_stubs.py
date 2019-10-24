template_test = """
// {method} {path}

it('Makes a {method} call to {path}', function() {{
  cy.request({{
    url: 'http://localhost/agency{path}',
    auth: {{
      bearer: "." + Base64.encode("{{\\"scope\\": \\"admin:all test:all\\"}}") + ".",
    }},
    method: '{method}'
  }})
  .then((resp) => {{
    expect(resp.status).to.eq(200)
    expect(resp.headers['content-type']).to.eq('application/json; charset=utf-8');
    expect(resp.headers['server']).to.eq('istio-envoy');
    expect(resp.body).to.deep.eq({{ normal: 'payload' }});
  }})
}})
"""

with open('/Users/maxjohansen/work/mds-core/packages/mds-daily/api.ts', 'r') as f:
  lines = f.read().split('\n')
  for lineIndex, line in enumerate(lines):
    trimmed = line.strip()
    if trimmed.startswith('app.'):
      method = trimmed[trimmed.index('app.') + len('app.'):trimmed.index('(')]
      if method != 'use':
        method = method.upper()
        if trimmed[-1] == '(':
          nextLine = lines[lineIndex + 1].strip()
          path = nextLine[nextLine.index('pathsFor(') + len('pathsFor(') + 1:nextLine.index(')') - 1]
        else:
          path = trimmed[trimmed.index('pathsFor(') + len('pathsFor(') + 1:trimmed.index(')') - 1]
        test_function = template_test.format(method=method, path=path)
        print(test_function)