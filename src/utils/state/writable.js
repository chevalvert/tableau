import { Readable } from './readable'
import clone from 'clone'

class Writable extends Readable {
  set (value, force) {
    if (!force && this.current === value) return
    this.previous = this.current

    this.current = value
    let node = this._first
    while (node) {
      node.fn.call(node.ctx, this.current, this.previous)
      node.once && this.unsubscribe(node)
      node = node.next
    }
  }

  update (cb, force) {
    const value = cb(clone(this.current, false))
    this.set(value !== undefined ? value : this.current, force)
  }
}

export { Writable }
export default function writable (v) {
  return new Writable(v)
}
