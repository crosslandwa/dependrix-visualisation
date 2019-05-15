import Dependrix from '..'
const fs = require('fs')

describe('Dependrix', () => {
  describe('creates an application', () => {
    const dependrix = Dependrix({ artifacts: {}, dependencies: {} })

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
      dependrix.then(html => html.substring(html.indexOf('<head>'), html.indexOf('</head>') + 7))
        .then(html => {
          expect(html).toMatch(/<script type="application\/json" id="modelled-dependencies">\s*{\s+"artifacts": {},\s+"dependencies":\s+{}\s+}\s+<\/script>\s*<\/head>/)
        }).then(done, done.fail)
    })
  })
})
