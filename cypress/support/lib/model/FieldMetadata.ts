import { FieldConfig, FieldDefault } from './FieldDecorator';
import { Model } from './Model';


export class FieldMetadata {
  FieldClass: any
  defaultValue: FieldDefault
  key: string
  fieldName: string

  constructor(conf: FieldConfig, fieldName: string) {
    const { def, cls, key } = conf || {}
    this.FieldClass = cls
    this.defaultValue = def
    this.key = key
    this.fieldName = fieldName
  }

  isNormal(): boolean {
    return !this.FieldClass
  }

  isM2O(): boolean {
    return this.FieldClass && this.FieldClass.prototype instanceof Model
  }

  isO2M(option): boolean {
    return this.FieldClass && Array.isArray(option[this.fieldName])
  }
}