import { Module } from '@nestjs/common';
import { PaginationDto } from './dtos/pagination.dto';

@Module({
  imports: [],
  controllers: [],
  providers: [PaginationDto],
  exports: [PaginationDto],
})
export class CommonModule {}
