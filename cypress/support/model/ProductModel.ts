import { Field, Model, ModelConfig, SeedOption } from '../lib';
import { randomString } from '../utils';

export class ProductOption extends SeedOption {
  @Field({ key: 'name', def: () => randomString() })
  name: string
}

export class ProductModel extends Model<ProductOption> {
  protected getModelConfig(): ModelConfig {
    return { modelName: 'product.template', optionClass: ProductOption };
  }

}