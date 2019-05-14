import Dependrix from '..'

describe('Dependrix', () => {
  it('creates an application', done => {
    const html = Dependrix({}).then(html => {
      expect(html).toContain('<html lang="en">')
      expect(html).toContain('<title>Dependrix</title>')
      expect(html).toMatch(/<script>\s*\(function \(\) {/)
      expect(html).not.toContain('sourceMappingURL')
    }).then(done, done.fail)
  })
})
