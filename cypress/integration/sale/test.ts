import { ProductModel, SaleOrderModel } from '../../support/model';

const product = new ProductModel()
const saleOrder = new SaleOrderModel({
  other: 431,
  orderLines: [
    { product: 3, qty: 19, price: 434000 },
    { product: product, qty: 19, price: 434000 },
    { qty: 19, price: 434000 },
  ]
})
console.log(saleOrder)
saleOrder.generate()
describe('TEst', function () {
  it('should haha', function () {

  });
});