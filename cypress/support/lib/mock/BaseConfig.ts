import { One2ManyConfig } from "./One2ManyConfig";
import { MockItem } from "./MockItem";
import { BaseMock, RefFieldInitiator } from "./BaseMock";

export type M2ORecord<Mock> = number | Mock
export type O2MRecord<Config> = number[] | Partial<Config>[]

export class BaseConfig {
  raw?: object = {}
  refFields: { [field: string]: [any, string] }

  constructor(obj) {
    Object.assign(this, obj)
    if (!this.refFields) return
    this.initFields()
  }

  private initFields() {
    for (const field of Object.keys(this.refFields)) {
      const [FieldClass] = this.refFields[field]
      const fieldConfig = this[field]
      // Is One2Many field
      if (Array.isArray(fieldConfig)) {
        this[field] = fieldConfig.map(conf => new FieldClass(conf))
      }
    }
  }

  convertRefToMock(initiator: RefFieldInitiator) {
    if (!this.refFields) return

    for (const field of Object.keys(this.refFields)) {
      if (!this[field] || this[field].length == 0) continue

      const [FieldClass, fieldId] = this.refFields[field]

      // is One2many
      if (Array.isArray(this[field])) {
        // is list of One2many config object
        if (this[field].all(f => f instanceof One2ManyConfig)) {
          (this[field] as One2ManyConfig[]).forEach(f => f.convertRefToMock(initiator))
        }
        // is list of existed ids
        else if (this[field].all(f => typeof f == 'number')) {
          this[field] = this[field].map(f => new FieldClass(f))
        }
      }
      // is Many2one
      else {
        // is existed id number
        if (typeof this[field] == 'number') {
          this[field] = new FieldClass(this[field])
        }
      }
      // else is mock item
    }
  }

  private getRefFieldCount() {

  }
}