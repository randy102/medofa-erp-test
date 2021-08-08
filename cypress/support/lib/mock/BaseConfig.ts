export class BaseConfig<Depend> {
  depends: Partial<Depend>
  val?: object
  one2manyFields: object

  constructor(obj) {
    Object.assign(this, obj)
    if (this.one2manyFields) {
      for (const field of Object.keys(this.one2manyFields)) {
        this[field] = new this.one2manyFields[field](this[field])
      }
    }
  }
}