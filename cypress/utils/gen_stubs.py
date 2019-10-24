import os

template_test = """  // API call test: {method} {path}
  describe('{method} {path}', () => {{
    it('Makes a {method} call to {path}', function() {{
      const urlParams = {url_params_dict}
      const {{{url_params_keys}}} = urlParams
      cy.request({{
        url: `http://localhost/agency{augmented_path}`,
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
  }})
"""

template_test_file = """// {package} API Tests

describe('{package} API Tests', () => {{

{tests}
}})
"""

def parse_path_args(path):
  url_params = {}
  chunks = path.split('/')
  augmented_path = ''
  for chunk in chunks:
    if chunk.startswith(':'):
      arg = chunk.replace(':', '').replace('?', '')
      url_params[arg] = 'some_value'
      augmented_path += '${{{arg}}}/'.format(arg=arg)
    else:
      augmented_path += chunk + '/'
  return url_params, augmented_path

def parse_file(file_path):
  test_functions = []
  with open(file_path, 'r') as f:
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
          url_params, augmented_path = parse_path_args(path)
          url_params_keys = ','.join(url_params.keys())
          test_function = template_test.format(method=method, path=path, url_params_dict=url_params, augmented_path=augmented_path, url_params_keys=url_params_keys)
          test_functions.append(test_function)
  return test_functions

def compute_test_files(mds_core_path):
  mds_packages_path = os.path.join(mds_core_path, 'packages')

  mds_packages = [package for package in os.listdir(mds_packages_path) if package.startswith('mds-')]
  packages_to_test_files = {}
  for package in mds_packages:
    package_path = os.path.join(mds_packages_path, package)
    api_file_path = os.path.join(package_path, 'api.ts')
    if os.path.exists(api_file_path) and os.path.isfile(api_file_path):
      test_functions = parse_file(api_file_path)
      packages_to_test_files[package] = '\n'.join(test_functions)
  return packages_to_test_files

def pretty_print_package(mds_package):
  prefix, name = mds_package.split('-', 1)
  return '{} {}'.format(prefix.upper(), name.capitalize())

def write_test_files(mds_core_path):
  for package, test_file_string in compute_test_files(mds_core_path).items():
    mds_cypress_integration_path = os.path.join(mds_core_path, 'cypress', 'integration')
    test_file_path = os.path.join(mds_cypress_integration_path, '{}.api.spec.js'.format(package))
    with open(test_file_path, 'w') as test_file:
      test_file.write(template_test_file.format(package=pretty_print_package(package), tests=test_file_string))
    test_file.close()

def clean_test_files(mds_core_path):
  for package, test_file_string in compute_test_files(mds_core_path).items():
    mds_cypress_integration_path = os.path.join(mds_core_path, 'cypress', 'integration')
    test_file_path = os.path.join(mds_cypress_integration_path, '{}.api.spec.js'.format(package))
    if os.path.exists(test_file_path) and os.path.isfile(test_file_path):
      os.remove(test_file_path)