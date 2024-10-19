import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateHappDto } from './dto/create-happ.dto';
import { HappService } from './happ.service';
import { GetUser } from '@/modules/auth/get-user.decorator';
import { User } from 'src/entities/user.entity';
import { UpdateHappDto } from './dto/update-happ.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UpdateByDndDto } from './dto/update-by-dnd.dto';
import { CreateHappByDndDto } from './dto/create-happ-by-dnd.dto';
import { UpdateHappResDto } from './dto/updated-happ-res-dto';
import { Happ } from '@/entities/happ.entity';

@ApiTags('happ')
@Controller('happ')
export class HappController {
  constructor(private happService: HappService) {}
  private logger = new Logger('HappController');

  @Get('/page')
  getAllHapp(
    @Query('page') page: string,
    @Query('count') count: string,
  ): Promise<Happ[]> {
    return this.happService.getAllHapps(page, count);
  }

  @ApiOperation({
    summary: '',
  })
  @Get('/page/:userId')
  getDailyHappsPerPage(
    @Query('skip') skip: string,
    @Query('count') count: string,
    @Param('userId') userId: string,
  ): Promise<Happ[]> {
    return this.happService.getDailyHappsPerPage(skip, count, userId);
  }

  @ApiOperation({
    summary: '',
  })
  @Get('/list/:date/:userId')
  getHappsByDate(
    @Param('date') date: string,
    @Param('userId') userId: string,
  ): Promise<Happ[]> {
    return this.happService.getHappsByDate(date, userId);
  }

  @ApiOperation({
    summary: 'Get happ by Id',
  })
  @Get('/:id')
  getHappById(@Param('id') id: string): Promise<Happ> {
    return this.happService.getHappById(id);
  }

  @ApiOperation({
    summary: '',
  })
  @Post()
  @UseInterceptors(FilesInterceptor('happ-images', 10))
  @UsePipes(ValidationPipe)
  @UseGuards(AuthGuard())
  createHapp(
    @UploadedFiles() files: Express.MulterS3.File[],
    @Body('happ-data') happData: string,
    @GetUser() user: User,
  ): Promise<Happ[]> {
    const createHappDto: CreateHappDto = JSON.parse(happData);
    if (files && files.length > 0) {
      createHappDto.imageUrls = files.map((file) => file.location);
    }
    return this.happService.createHapp(createHappDto, user);
  }

  @ApiOperation({
    summary: 'Drag And Drop으로 스탬핑!',
  })
  @Post('/byDnd')
  @UsePipes(ValidationPipe)
  @UseGuards(AuthGuard())
  createHappByDnd(
    @Body() createHappByDndDto: CreateHappByDndDto,
    @GetUser() user: User,
  ): Promise<Happ> {
    return this.happService.createHappByDnd(createHappByDndDto, user);
  }

  @ApiOperation({
    summary: '',
  })
  @Patch()
  @UseInterceptors(FilesInterceptor('happ-images', 10))
  updateHapp(
    @UploadedFiles() files: Express.MulterS3.File[],
    @Body('happ-data') happData: string,
  ): Promise<UpdateHappResDto> {
    const updateHappDto: UpdateHappDto = JSON.parse(happData);
    console.log(updateHappDto);
    if (files && files.length > 0) {
      updateHappDto.uploadedImages = files.map((file) => file.location);
    }
    return this.happService.updateHapp(updateHappDto);
  }

  @ApiOperation({
    summary: 'Drag And Drop으로 Happ의 위치 변경',
  })
  @Patch('/byDnd')
  updateStartTime(
    @Body() updateByDndDto: UpdateByDndDto,
  ): Promise<UpdateHappResDto> {
    return this.happService.updateByDnd(updateByDndDto);
  }

  @ApiOperation({
    summary: 'Todo 완료',
  })
  @Patch('/todo-complete/:id')
  completeTodo(@Param('id') id: string): Promise<Happ> {
    return this.happService.completeTodo(id);
  }

  @ApiOperation({
    summary: '',
  })
  @Delete('/:id')
  @UseGuards(AuthGuard())
  deleteHapp(@Param('id') id: string, @GetUser() user: User): Promise<void> {
    return this.happService.deleteHapp(id, user);
  }
}
