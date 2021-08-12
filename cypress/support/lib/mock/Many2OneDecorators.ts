export function Many2One(MockClass, fieldId) {
  return function (target, propertyKey: string) {
    if (!target['refFields']) {
      target['refFields'] = {}
    }
    target['refFields'][propertyKey] = [MockClass]
  }
}