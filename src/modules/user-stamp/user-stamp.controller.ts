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
  UseGuards,
} from '@nestjs/common';
import { UserStampService } from './user-stamp.service';
import { GetUser } from '@/modules/auth/get-user.decorator';
import { User } from '@/entities/user.entity';
import { SaveUserStampDto } from './dto/save-user-stamp.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateUserStampDto } from './dto/update-user-stamp.dto';
import { UpdateIsDisplayDto } from './dto/update-is-display.dto';
import { UserStamp } from '@/entities/user-stamp.entity';

@ApiTags('user-stamp')
@Controller('user-stamp')
export class UserStampController {
  constructor(private userStampService: UserStampService) {}
  private logger = new Logger('UserStampController');

  @Get()
  @UseGuards(AuthGuard())
  getAllUserStamps(@GetUser() user: User) {
    return this.userStampService.getAllUserStamps(user.id);
  }

  @Get('/display')
  @UseGuards(AuthGuard())
  getDisplayUserStamps(@GetUser() user: User) {
    return this.userStampService.getDisplayUserStamps(user.id);
  }

  @Get('/page')
  @UseGuards(AuthGuard())
  getUserStampsPerPage(
    @Query('page') page: string,
    @Query('count') count: string,
    @GetUser() user: User,
  ) {
    return this.userStampService.getUserStampsPerPage(user.id, page, count);
  }

  @Get('/:id')
  getUserStampById(@Param('id') id: string) {
    return this.userStampService.getUserStampById(id);
  }

  @Post()
  @UseGuards(AuthGuard())
  saveStamp(@GetUser() user: User, @Body() data: SaveUserStampDto) {
    return this.userStampService.saveUserStamp(user, data);
  }

  @Post('/:id')
  @UseGuards(AuthGuard())
  updateStamp(@Param('id') id: string, @Body() data: UpdateUserStampDto) {
    return this.userStampService.updateUserStamp(id, data);
  }

  @Patch('/is-display')
  @UseGuards(AuthGuard())
  setVisible(@Body() updateIsDisplayDto: UpdateIsDisplayDto) {
    return this.userStampService.updateIsDisplay(updateIsDisplayDto);
  }

  @ApiOperation({
    summary: '',
  })
  @Delete('/:id')
  deleteStamp(@Param('id') id: string): Promise<UserStamp> {
    return this.userStampService.deleteUserStamp(id);
  }
}
