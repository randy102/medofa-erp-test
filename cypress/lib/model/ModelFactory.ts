import { IModel } from '../index';

export abstract class ModelFactory<Option> {
  protected mockList: IModel[] = []

  constructor(options: Partial<Option>[]) {
    const Mock = this.getMockClass()
    for (const config of options) {
      this.mockList.push(new Mock(config))
    }
  }

  abstract getMockClass()

  async generate(): Promise<number[]> {
    let createdIds = []
    for(const mock of this.mockList){
      const created = await mock.generate()
      createdIds.push(created)
    }
    return createdIds
  }

  cleanup(): Promise<void[]> {
    return Promise.all(this.mockList?.map(mock => mock.cleanup(false)))
  }

  length(): number {
    return this.mockList.length
  }

  getMock(i: number): IModel {
    if (i >= this.length())
      return null
    return this.mockList[i]
  }

  getMockById(id: number): IModel {
    return this.mockList.find(mock => mock.getId() == id)
  }

  getById(id: number, fields: string[]): Promise<object> {
    return this.getMockById(id)?.get(fields)
  }
}