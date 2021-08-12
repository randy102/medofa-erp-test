import { BaseConfig } from "./BaseConfig";


export function One2Many(MockClass) {
  return function (target: BaseConfig, propertyKey: string) {
    if (!target['refFields']) {
      target['refFields'] = {}
    }
    target['refFields'][propertyKey] = [MockClass, '']
  }
}