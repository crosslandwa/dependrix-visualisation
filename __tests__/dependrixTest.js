import Dependrix from '..'

describe('Dependrix', () => {
  it('creates an application', done => {
    const html = Dependrix({}).then(html => {
      expect(html).toContain('<html lang="en">')
      expect(html).toContain('<title>Dependrix</title>')
    }).then(done, done.fail)
  })
})
