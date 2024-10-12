import { Stamp } from '@/entities/stamp.entity';
import { User } from '@/entities/user.entity';
import { FormException } from '@/exceptions/form.exception';
import formErrorUtils from '@/utils/form-error.utils';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateStampDto } from './dto/create-stamp.dto';
import { Tag } from '@/entities/tag.entity';

@Injectable()
export class StampService {
  constructor(
    @InjectRepository(Stamp)
    private stampRepository: Repository<Stamp>,
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
  ) {}

  async getAllStamps(page: string, count: string): Promise<Stamp[]> {
    const currentPage: number = (page || 0) as number;
    const perPage: number = (count || 5) as number;
    try {
      const stamps = await this.stampRepository.find({
        where: { notForSale: false },
        order: { createdAt: 'DESC' },
        skip: currentPage * perPage,
        take: perPage,
      });
      return stamps;
    } catch (error) {
      console.log(error);
    }
  }

  async createStamp(
    stampData: string,
    user: User,
    url: string,
  ): Promise<Stamp> {
    const {
      name,
      description,
      droplet,
      type,
      status,
      Tags,
      notForSale,
    }: CreateStampDto = JSON.parse(stampData);

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
    try {
      if (Tags) {
        // 태그목록 추가
        const newTags = await Promise.all(
          Tags.map(async (e) => {
            if (!e.id) {
              return await this.tagRepository.save(e);
            }
            return e;
          }),
        );
        stamp.Tags = newTags;
      }
      const createdStamp = await this.stampRepository.save(stamp);
      return createdStamp;
    } catch (error) {
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
    const found = await this.stampRepository.findOneBy({ id });

    if (!found) {
      throw new NotFoundException(`Can't find Stamp with id ${id}`);
    }

    return found;
  }

  async deleteStamp(id: string): Promise<void> {
    const result = await this.stampRepository.delete({
      id,
    });

    if (result.affected === 0) {
      throw new NotFoundException(`Can't find Stamp with id ${id}`);
    }
  }
}
