import { MockItem } from '../mock';

export abstract class MockFactory<Config> {
  protected mockList: MockItem<Config>[] = []

  constructor(configs: Config[]) {
    const Mock = this.getMockClass()
    for (const config of configs) {
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

  getMock(i: number): MockItem {
    if (i >= this.length())
      return null
    return this.mockList[i]
  }

  getMockById(id: number): MockItem {
    return this.mockList.find(mock => mock.getId() == id)
  }

  getById(id: number, fields: string[]): Promise<object> {
    return this.getMockById(id)?.get(fields)
  }
}