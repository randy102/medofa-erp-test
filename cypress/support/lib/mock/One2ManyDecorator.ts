import { BaseConfig } from "./BaseConfig";


export function One2Many(FieldClass) {
  return function (target: BaseConfig<any>, propertyKey: string) {
    if (!target['one2manyFields']) {
      target['one2manyFields'] = {}
    }
    target['one2manyFields'][propertyKey] = FieldClass
  }
}