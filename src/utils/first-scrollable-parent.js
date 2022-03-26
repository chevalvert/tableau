export default (element, direction = 'both') => {
  if (!element) return

  let parent = element.parentNode

  while (parent) {
    const canScrollX = parent.scrollWidth > parent.clientWidth
    const canScrollY = parent.scrollHeight > parent.clientHeight

    switch (direction) {
      case 'x':
      case 'horizontal':
        if (canScrollX) return parent
        break

      case 'y':
      case 'vertical':
        if (canScrollY) return parent
        break

      case 'both':
      default:
        if (canScrollX || canScrollY) return parent
        break
    }

    // return parent
    parent = parent.parentNode
  }
}
