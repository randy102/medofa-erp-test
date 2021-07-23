import { MockFactory } from './MockFactory';
import { SaleOrderConfig, SaleOrderMock } from '../mock';


export class SaleOrderFactory extends MockFactory<SaleOrderConfig> {
  getMockClass() {
    return SaleOrderMock
  }
}