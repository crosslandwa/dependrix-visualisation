export const newerOf = (a, b) => {
  const versionA = parse(a)
  const versionB = parse(b)
  return (isNewerMajor(versionA, versionB) || isNewerMinor(versionA, versionB) || isNewerPatch(versionA, versionB))
    ? a
    : b
}

const parse = version => {
  const [major = 0, minor = 0, patch = 0] = ((version && version.match(/\d+/g)) || []).map(Number)
  return { major, minor, patch }
}

const isNewerMajor = (a, b) => a.major > b.major
const isNewerMinor = (a, b) => a.major === b.major && a.minor > b.minor
const isNewerPatch = (a, b) => a.major === b.major && a.minor === b.minor && a.patch > b.patch

export const versionLag = (test, latest) => {
  const testVersion = parse(test)
  const latestVersion = parse(latest)

  if (isNewerMajor(latestVersion, testVersion)) {
    return 'major'
  }

  if (isNewerMinor(latestVersion, testVersion)) {
    return 'minor'
  }

  if (isNewerPatch(latestVersion, testVersion)) {
    return 'patch'
  }

  return ''
}
