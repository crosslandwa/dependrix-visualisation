export const debouncedEventValue = (timeout, fn) => {
  let timer
  return (e) => {
    clearTimeout(timer)
    const value = e.target.value
    timer = setTimeout(() => fn(value), timeout)
  }
}

export const debounced = (timeout, fn) => {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), timeout)
  }
}
