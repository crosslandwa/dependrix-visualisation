export const debouncedEventValue = (timeout, fn) => {
  let timer
  return (e) => {
    clearTimeout(timer)
    const value = e.target.value
    timer = setTimeout(() => fn(value), timeout)
  }
}
