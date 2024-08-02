import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';


@Injectable()
export class SeedService {
  constructor(private readonly productService: ProductsService){}
  private async insertNewProducts(){
    await this.productService.deleteAllProduct();
    const products = initialData.products;
    const insertPromises = [];
    products.forEach((product) => {
      insertPromises.push(this.productService.create(product));
    });
    await Promise.all(insertPromises);


    return true;
  }
  async runSeed(){
    this.insertNewProducts();
    return 'This action adds a new seed';
  }

}
