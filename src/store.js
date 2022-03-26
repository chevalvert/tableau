import { writable } from 'utils/state'

const Store = {
  columns: writable(['untitled']),
  colors: writable({}),
  items: writable([]),

  authenticated: writable(false),
  dirty: writable(false),

  filter: writable(
    window.location.hash
      .substr(1)
      .split(',')
      .filter(Boolean)
      .map(name => name.toLowerCase())
  )
}

window.Store = Store
export default Store
