import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { ProductImage } from './entities/product-image.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');
  constructor(
    @InjectRepository(Product)
    private readonly productRespository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRespository: Repository<ProductImage>,

    private readonly dataSource: DataSource,
  ) {}
  private handleExceptions(error: any) {
    if (error?.code === '23505') {
      throw new BadRequestException(error?.detail);
    }
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
  async create(createProductDto: CreateProductDto) {
    try {
      const product = this.productRespository.create({
        ...createProductDto,
        images: createProductDto.images?.map((image) =>
          this.productImageRespository.create({ url: image }),
        ),
      });
      await this.productRespository.save(product);
      return { ...product, images: createProductDto?.images };
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    try {
      const { limit = 10, offset = 0 } = paginationDto;
      const products = await this.productRespository.find({
        take: limit,
        skip: offset,
        relations: {
          images: true,
        },
      });
      return products.map((product) => {
        return {
          ...product,
          images: product.images.map((image) => image.url),
        };
      });
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async findOne(id: string) {
    try {
      const queryBuilder = this.productRespository.createQueryBuilder();
      const product = await queryBuilder
        .where(`title =:title or slug =:slug`, {
          title: id.toUpperCase(),
          slug: id.toLowerCase(),
        })
        .leftJoinAndSelect('Product.images', 'productImages')
        .getOne();

      if (!product) {
        throw new BadRequestException('Product not found');
      }
      return product;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const { images, ...toUpdate } = updateProductDto;
    try {
      const product = await this.productRespository.preload({
        id: id,
        ...toUpdate,
      });
      if (!product) {
        throw new NotFoundException('Product not found');
      }
      const queryyRunner = this.dataSource.createQueryRunner();
      await queryyRunner.connect();
      await queryyRunner.startTransaction();

      if (images) {
        await queryyRunner.manager.delete(ProductImage, { product: { id } });
        product.images = images.map((image) => {
          return this.productImageRespository.create({ url: image });
        });
      } else {
        product.images = await this.productImageRespository.findBy({
          product: { id },
        });
      }
      await queryyRunner.manager.save(product);
      await queryyRunner.commitTransaction();
      await queryyRunner.release();
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async remove(id: string) {
    const product = await this.productRespository.findOne({ where: { id } });
    if (!product) {
      throw new BadRequestException('Product not found');
    }
    return this.productRespository.remove(product);
  }
  async deleteAllProduct() {
    const query = this.productRespository.createQueryBuilder('product');
    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleExceptions(error);
    }
  }
}
