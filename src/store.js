import { derived, writable } from 'utils/state'

const Store = {
  columns: writable(['items']),
  colors: writable({}),

  authenticated: writable(false),
  items: writable([]),
  dirty: writable(false),

  highlighted: undefined
}

// Allow highlighting items via https://…/?query with query being the color name
Store.highlighted = derived(Store.colors, (colors = {}) => {
  const hash = window.location.href.match(/\?(.*)\/?/)
  if (!hash || !hash[1]) return

  const match = name => encodeURIComponent(name).toUpperCase() === hash[1].toUpperCase()

  for (const hex in colors) {
    const name = colors[hex]
    if (name && match(name)) {
      return { color: hex, match }
    }
  }
})

window.Store = Store
export default Store
