import { Happ } from '@/entities/happ.entity';
import { PickType } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateHappDto extends PickType(Happ, [
  'id',
  'UserStamp',
  'startTime',
  'endTime',
  'memo',
  'imageUrls',
  'money',
  'moneyUnit',
  'water',
  'todo',
  'status',
  'Tags',
  'Friends',
  'Book',
  'bookPercent',
] as const) {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  uploadedImages: string[];

  copy: Date[];
}
