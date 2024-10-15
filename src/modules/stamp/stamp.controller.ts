import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { StampService } from './stamp.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Stamp } from '@/entities/stamp.entity';
import { User } from '@/entities/user.entity';
import { GetUser } from '../auth/get-user.decorator';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateStampDto } from './dto/create-stamp.dto';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import validationErrorUtils from '@/utils/validation-error.utils';
import { FormException } from '@/exceptions/form.exception';
import { s3DeleteFile } from '@/utils/multerS3.util';
import { ConfigService } from '@nestjs/config';

@ApiTags('stamp')
@Controller('stamp')
export class StampController {
  constructor(
    private stampService: StampService,
    private configService: ConfigService,
  ) {}
  private logger = new Logger('StampController');

  @ApiOperation({
    summary: '스탬프 리스트 보기',
  })
  @Get()
  getAllStamps(
    @Query('page') page: string,
    @Query('count') count: string,
  ): Promise<Stamp[]> {
    return this.stampService.getAllStamps(page, count);
  }

  @ApiOperation({
    summary: '스탬프 업로드',
  })
  @Post()
  @UseGuards(AuthGuard())
  @UseInterceptors(FileInterceptor('stamp-icon'))
  async createStamp(
    @GetUser() user: User,
    @UploadedFile() file: Express.MulterS3.File,
    @Body() body: { 'stamp-data': string },
  ): Promise<Stamp> {
    const stampData: CreateStampDto = plainToClass(
      CreateStampDto,
      JSON.parse(body['stamp-data']),
    );
    const errors = await validate(stampData);
    if (errors.length > 0) {
      // 스탬프 아이콘 삭제
      if (file) {
        await s3DeleteFile(this.configService, [file.location]);
      }
      throw new FormException(validationErrorUtils(errors, user.locale));
    }
    return this.stampService.createStamp(stampData, user, file.location);
  }

  @ApiOperation({
    summary: 'Get stamp by Id',
  })
  @Get('/:id')
  getStampById(@Param('id') id: string): Promise<Stamp> {
    return this.stampService.getStampById(id);
  }

  @ApiOperation({
    summary: '',
  })
  @Delete('/:id')
  deleteStamp(@Param('id') id: string): Promise<void> {
    return this.stampService.deleteStamp(id);
  }
}
