export default (objects = [], key) => objects.reduce((o, obj) => {
  const group = obj[key]

  if (!o[group]) o[group] = []
  o[group].push(obj)

  return o
}, {})
