import request from 'browser-request'

export const makeGETRequest = (url, headers = {}) => new Promise(
  (resolve, reject) => request.get(
    { url, headers },
    (error, response, body) => (error || response.statusCode >= 400 || response.statusCode < 200)
      ? reject(new Error(error || `Failed request for ${url}`))
      : resolve(body)
  )
)
