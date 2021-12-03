import { readable, writable } from 'utils/state'

const Store = {
  columns: readable(['en cours', 'en pause', 'à venir', '?']),
  colors: writable({}),

  authenticated: writable(false),
  items: writable([]),
  dirty: writable(false)
}

window.Store = Store
export default Store
