import { validateModel } from '..'

const failTestAsValidationFailureExpected = fail => () => fail('Expected validation error but model returned returned')

describe('Dependrix model validation', () => {
  it('returns a promise that resolves with the supplied model if it is valid', done => {
    const model = {
      projects: {
        'a-project': {
          version: '1.0.0',
          dependencies: []
        }
      }
    }
    validateModel(model)
      .then(returned => expect(returned).toEqual(model))
      .then(done, done.fail)
  })

  it('returns an error when project names contain invalid characters', done => {
    const model = { projects: { '0badProjectName': {} } }
    validateModel(model)
      .then(failTestAsValidationFailureExpected(done.fail))
      .catch(error => {
        expect(error.message).toContain('"additionalProperty":"0badProjectName"')
      }).then(done)
  })
})
