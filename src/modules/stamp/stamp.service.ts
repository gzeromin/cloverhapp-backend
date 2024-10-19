import { Stamp } from '@/entities/stamp.entity';
import { User } from '@/entities/user.entity';
import { FormException } from '@/exceptions/form.exception';
import formErrorUtils from '@/utils/form-error.utils';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateStampDto } from './dto/create-stamp.dto';
import { TagService } from '../tag/tag.service';
import { ConfigService } from '@nestjs/config';
import { s3DeleteFile } from '@/utils/multerS3.util';
import { UpdateStampDto } from './dto/update-stamp.dto';

@Injectable()
export class StampService {
  constructor(
    @InjectRepository(Stamp)
    private stampRepository: Repository<Stamp>,
    private readonly tagService: TagService,
    private configService: ConfigService,
  ) {}
  private logger = new Logger('StampService');

  async getAllStamps(page: string, count: string): Promise<Stamp[]> {
    const currentPage: number = (page || 0) as number;
    const perPage: number = (count || 15) as number;
    try {
      const stamps = await this.stampRepository.find({
        order: { createdAt: 'DESC' },
        skip: currentPage * perPage,
        take: perPage,
      });
      return stamps;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  async createStamp(
    stampData: CreateStampDto,
    user: User,
    url: string,
  ): Promise<Stamp> {
    try {
      const { name, description, droplet, type, status, Tags, notForSale } =
        stampData;
      const stamp: Stamp = this.stampRepository.create({
        name,
        description,
        droplet,
        type,
        status,
        url,
        notForSale,
        userId: user.id,
      });
      // 태그목록 추가
      if (Tags) {
        stamp.Tags = await this.tagService.saveTagList(Tags);
      }
      const createdStamp = await this.stampRepository.save(stamp);
      return createdStamp;
    } catch (error) {
      this.logger.error(error);
      // 스탬프 아이콘 삭제
      if (url) {
        await s3DeleteFile(this.configService, [url]);
      }
      if (error instanceof QueryFailedError) {
        const errorMessages = [(error.driverError as any).detail];
        const keys = ['name', 'description', 'droplet', 'type', 'status'];
        throw new FormException(
          formErrorUtils(keys, errorMessages, user.locale),
        );
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async updateStamp(stampData: UpdateStampDto, user: User): Promise<Stamp> {
    try {
      const { id, name, description, droplet, type, status, Tags, notForSale } =
        stampData;
      const stamp = await this.stampRepository.findOneBy({ id });
      stamp.name = name;
      stamp.description = description;
      stamp.droplet = droplet;
      stamp.type = type;
      stamp.status = status;
      stamp.notForSale = notForSale;
      // 태그목록 추가
      if (Tags) {
        stamp.Tags = await this.tagService.saveTagList(Tags);
      }
      return await this.stampRepository.save(stamp);
    } catch (error) {
      this.logger.error(error);
      if (error instanceof QueryFailedError) {
        const errorMessages = [(error.driverError as any).detail];
        const keys = ['name', 'description', 'droplet', 'type', 'status'];
        throw new FormException(
          formErrorUtils(keys, errorMessages, user.locale),
        );
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async getStampById(id: string): Promise<Stamp> {
    const found = await this.stampRepository.findOne({
      where: { id },
      relations: ['Register', 'Tags'],
    });

    if (!found) {
      throw new NotFoundException(`Can't find Stamp with id ${id}`);
    }

    return found;
  }

  async deleteStamp(id: string): Promise<Stamp> {
    const stamp = await this.stampRepository.findOneBy({
      id,
    });
    if (!stamp) {
      throw new NotFoundException(`Can't find Stamp with id ${id}`);
    }
    stamp.deleteFlag = true;
    return await this.stampRepository.save(stamp);
  }
}
