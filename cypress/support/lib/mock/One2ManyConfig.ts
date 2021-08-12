export class One2ManyConfig {
  refFields?: { [field: string]: [any, string] }

  constructor(obj) {
    Object.assign(this, obj)
  }

  convertRefToMock(data: object) {
    if (!this.refFields) return

    for (const field of Object.keys(this.refFields)) {
      const [FieldClass, fieldId] = this.refFields[field]
      if (FieldClass.prototype instanceof One2ManyConfig) {
        (this[field] as One2ManyConfig[]).forEach(f => f.convertRefToMock(data))
      } else {
        this[field] ||= data[fieldId]
      }
    }
  }

  getRefFieldCount() {
    if (!this.refFields) return 0

    const total = 0
    for (const [field, [FieldClass, fieldId]] of Object.entries(this.refFields)) {
      const [FieldClass, fieldId] = this.refFields[field]
    }

  }
}