import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FriendService } from './friend.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '@/modules/auth/get-user.decorator';
import { User } from '@/entities/user.entity';
import { AcceptRequestDto } from './dto/accept-request.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('friend')
@Controller('friend')
export class FriendController {
  constructor(private friendService: FriendService) {}
  private logger = new Logger('FriendController');

  @Get()
  @UseGuards(AuthGuard())
  getFriendsByUser(
    @GetUser() user: User,
    @Query('page') page: string,
    @Query('term') term: string,
  ) {
    return this.friendService.getFriendsByUserId(user.id, page, term);
  }

  @Get('/one')
  getOneFriend(
    @Query('userId') userId: string,
    @Query('friendId') friendId: string,
  ) {
    return this.friendService.getOneFriend(userId, friendId);
  }

  @Post('/accept-request')
  acceptRequest(@Body() acceptRequestDto: AcceptRequestDto): Promise<number> {
    return this.friendService.acceptFriendRequest(acceptRequestDto);
  }

  @Get('/:userId')
  getFriendsByUserId(
    @Param('userId') userId: string,
    @Query('page') page: string,
    @Query('count') count: string,
  ) {
    return this.friendService.getFriendsByUserId(userId, page, count);
  }

  @Delete('/:friendId')
  @UseGuards(AuthGuard())
  deleteFriend(@GetUser() user: User, @Param('friendId') friendId: string) {
    return this.friendService.deleteFriend(user, friendId);
  }
}
