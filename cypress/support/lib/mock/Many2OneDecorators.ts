export function Many2One(target: any, propertyKey: string) {
  console.log(target)
  if (!target['dependFields']) {
    target['dependFields'] = []
  }
  target['dependFields'].push(propertyKey)
}