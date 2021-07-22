import MockFactory from './mock_factory';
import SaleOrderMock, { SaleOrderConfig } from '../mock/sale_order_mock';

export default class SaleOrderFactory extends MockFactory<SaleOrderConfig> {
  getMockClass() {
    return SaleOrderMock
  }
}