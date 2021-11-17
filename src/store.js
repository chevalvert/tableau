import { readable, writable } from 'utils/state'

const Store = {
  columns: readable(['en cours', 'à venir', '?']),
  colors: readable([
    '#ff6188',
    '#fc9867',
    '#ffd866',
    '#a9dc76',
    '#78dce8',
    '#ab9df2'
  ]),

  authenticated: writable(false),
  items: writable([]),
  dirty: writable(false)
}

window.Store = Store
export default Store
