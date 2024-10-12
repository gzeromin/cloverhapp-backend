import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { MemoService } from './memo.service';
import { ApiOperation } from '@nestjs/swagger';
import { Memo } from '@/entities/memo.entity';
import { CreateMemoDto } from './dto/create-memo.dto';
import { UpdateMemoDto } from './dto/update-memo.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '@/entities/user.entity';

@Controller('memo')
export class MemoController {
  constructor(private memoService: MemoService) {}
  private logger = new Logger('MemoController');

  @ApiOperation({
    summary: '',
  })
  @Get('/list/:date/:userId')
  getMemosByWeek(
    @Param('date') date: string,
    @Param('userId') userId: string,
  ): Promise<Memo[]> {
    return this.memoService.getMemosByWeek(date, userId);
  }

  @ApiOperation({
    summary: '',
  })
  @Post()
  createMemo(@Body() createMemoDto: CreateMemoDto): Promise<Memo> {
    return this.memoService.createMemo(createMemoDto);
  }

  @ApiOperation({
    summary: '',
  })
  @Patch()
  updateMemo(@Body() updateMemoDto: UpdateMemoDto): Promise<Memo> {
    return this.memoService.updateMemo(updateMemoDto);
  }

  @ApiOperation({
    summary: '',
  })
  @Delete('/:id')
  @UseGuards(AuthGuard())
  deleteMemo(@Param('id') id: string, @GetUser() user: User): Promise<void> {
    return this.memoService.deleteMemo(id, user);
  }
}
