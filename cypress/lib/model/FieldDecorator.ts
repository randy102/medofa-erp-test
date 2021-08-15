import { FieldMetadata } from './FieldMetadata';

export type FieldDefault = number | string | ((option) => number | string)

export type FieldConfig = {
  key: string
  cls?: any,
  def?: FieldDefault
}

export function Field(config?: FieldConfig) {
  return function (target, propertyKey: string) {
    if (!target.fieldMetadata) target.fieldMetadata = []
    target.fieldMetadata.push(new FieldMetadata(config, propertyKey))
  }
}