import Dependrix from '..'

describe('Dependrix', () => {
  describe('creates an application', () => {
    const dependrix = Dependrix({ projects: {} })

    it('with the JS application inlined', done => {
      dependrix.then(html => {
        expect(html).toContain('<html lang="en">')
        expect(html).toContain('<title>Dependrix</title>')
        expect(html).toMatch(/<script>\s*\(function \(\) {/)
      }).then(done, done.fail)
    })

    it('with source mapping stripped out', done => {
      dependrix.then(html => {
        expect(html).not.toContain('sourceMappingURL')
      }).then(done, done.fail)
    })

    it('with the supplied JSON injected into a <script> in the <head>', done => {
      dependrix
        .then(html => html.substring(html.indexOf('<head>'), html.indexOf('</head>') + 7))
        .then(headElementContent => {
          expect(headElementContent).toMatch(/<script type="application\/json" id="modelled-dependencies">\s*{\s+"projects": {}\s+}\s+<\/script>\s*<\/head>/)
        }).then(done, done.fail)
    })
  })

  it('returns an error if the supplied JSON does not satisfy the model schema', done => {
    Dependrix({ modelIsMissingProjects: {} })
      .then(html => done.fail('Expected validation error but built HTML returned'))
      .catch(error => {
        expect(error.message).toContain('Supplied model failed validation')
      }).then(done)
  })
})
