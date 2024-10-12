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

@ApiTags('stamp')
@Controller('stamp')
export class StampController {
  constructor(private stampService: StampService) {}
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
  createStamp(
    @GetUser() user: User,
    @UploadedFile() file: Express.MulterS3.File,
    @Body('stamp-data') stampData: string,
  ): Promise<Stamp> {
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
