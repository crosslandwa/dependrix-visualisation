import { validateModel } from '..'

const failTestAsValidationFailureExpected = fail => () => fail('Expected validation error but model returned returned')
const expectErrorMessageToContain = message => error => expect(error.message).toContain(message)

describe('Dependrix model validation', () => {
  it('returns a promise that resolves with the supplied model if it is valid', done => {
    const model = {
      projects: {
        'a-project': {
          version: '1.0.0',
          dependencies: [
            {
              id: 'lib-a',
              version: '1',
              scope: 'some-scope'
            }
          ]
        }
      },
      analysis: {
        title: 'my analysis'
      }
    }
    validateModel(model)
      .then(returned => expect(returned).toEqual(model))
      .then(done, done.fail)
  })

  it('returns an error when projects are not supplied', done => {
    const model = { noProjects: { } }
    validateModel(model)
      .then(failTestAsValidationFailureExpected(done.fail))
      .catch(expectErrorMessageToContain("should have required property 'projects'"))
      .then(done)
  })

  it('returns an error when project names contain invalid characters', done => {
    const model = { projects: { '0badProjectName': {} } }
    validateModel(model)
      .then(failTestAsValidationFailureExpected(done.fail))
      .catch(expectErrorMessageToContain("property name '0badProjectName' is invalid"))
      .then(done)
  })

  it('returns an error when project does not define version', done => {
    const model = { projects: { 'myProject': { } } }
    validateModel(model)
      .then(failTestAsValidationFailureExpected(done.fail))
      .catch(expectErrorMessageToContain("should have required property 'version'"))
      .then(done)
  })

  it('returns an error when project does not define dependencies', done => {
    const model = { projects: { 'myProject': { version: '1' } } }
    validateModel(model)
      .then(failTestAsValidationFailureExpected(done.fail))
      .catch(expectErrorMessageToContain("should have required property 'dependencies'"))
      .then(done)
  })

  it('returns an error when dependency does not specify id', done => {
    const model = {
      projects: {
        'myProject': {
          version: '1',
          dependencies: [
            {}
          ]
        }
      }
    }
    validateModel(model)
      .then(failTestAsValidationFailureExpected(done.fail))
      .catch(expectErrorMessageToContain("should have required property 'id'"))
      .then(done)
  })

  it('returns an error when dependency does not specify version', done => {
    const model = {
      projects: {
        'myProject': {
          version: '1',
          dependencies: [
            {
              id: 'lib-a'
            }
          ]
        }
      }
    }
    validateModel(model)
      .then(failTestAsValidationFailureExpected(done.fail))
      .catch(expectErrorMessageToContain("should have required property 'version'"))
      .then(done)
  })

  it('returns an error when dependency specifies invalid ID', done => {
    const model = {
      projects: {
        'myProject': {
          version: '1',
          dependencies: [
            {
              id: '0-bad-lib',
              version: '1'
            }
          ]
        }
      }
    }
    validateModel(model)
      .then(failTestAsValidationFailureExpected(done.fail))
      .catch(expectErrorMessageToContain('should match pattern \\"^[a-zA-Z_$][0-9a-zA-Z_$-]*$\\"'))
      .then(done)
  })
})
