import { SeedModel } from './SeedModel';
import { FieldMetadata } from './FieldMetadata';
import { FieldDefault } from './FieldDecorator';
import { clone } from '../helper';

export class SeedOption {
  fieldMetadata: FieldMetadata[]

  constructor(option?: any) {
    Object.assign(this, option)
    if (this.fieldMetadata) {
      this.initMRecord()
      this.initORecord()
    }
  }

  private initMRecord() {
    for (const field of this.fieldMetadata) {
      if (field.isO2M(this)) {
        const { FieldClass, fieldName } = field
        this[fieldName] = this[fieldName].map(f => new FieldClass(f))
      }
    }
  }

  private initORecord() {
    for (const field of this.fieldMetadata) {
      const { FieldClass, defaultValue: rawDefaultVal, fieldName } = field
      const defaultValue = this.getDefaultValue(rawDefaultVal)

      if (field.isNormal() && !this[fieldName] && defaultValue) {
        this[fieldName] = defaultValue
      }

      if (field.isM2O()) {
        if (!this[fieldName]) {
          this[fieldName] = new FieldClass(defaultValue)
        } else if (Number.isInteger(this[fieldName])) {
          this[fieldName] = new FieldClass(this[fieldName])
        }
      } else if (field.isO2M(this)) {
        this[fieldName].forEach(f => (f as SeedOption).initORecord())
      }
    }
  }

  async generateORecord() {
    if (!this.fieldMetadata) return
    for (const field of this.fieldMetadata) {
      const { fieldName } = field
      if (field.isM2O()) {
        await (this[fieldName] as SeedModel<any>).generate()
      } else if (field.isO2M(this)) {
        for (const opt of this[fieldName]) {
          await (opt as SeedOption).generateORecord()
        }
      }
    }
  }

  async cleanupORecord() {
    if (!this.fieldMetadata) return
    for (const field of this.fieldMetadata) {
      const { fieldName } = field
      if (field.isM2O()) {
        await (this[fieldName] as SeedModel<any>).cleanup()
      } else if (field.isO2M(this)) {
        for (const opt of this[fieldName]) {
          await (opt as SeedOption).cleanupORecord()
        }
      }
    }
  }

  getSeedData() {
    const data = {}
    for (const field of this.fieldMetadata) {
      const { key, fieldName } = field

      if (field.isNormal()) {
        data[key] = this[fieldName]
      } else if (field.isO2M(this)) {
        data[key] = SeedOption.formatO2MData(this[fieldName].map(f => f.getSeedData()))
      } else {
        data[key] = (this[fieldName] as SeedModel<any>).getId()
      }
    }
    return data
  }

  private static formatO2MData(record: any[]) {
    return record.map(r => [0, 0, r])
  }

  private getDefaultValue(def: FieldDefault) {
    if (typeof def === 'function') {
      return def(clone(this))
    }
    return def
  }


}