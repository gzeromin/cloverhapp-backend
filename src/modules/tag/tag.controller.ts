import { Controller, Get, Logger, Query } from '@nestjs/common';
import { TagService } from './tag.service';

@Controller('tag')
export class TagController {
  constructor(private tagService: TagService) {}
  private logger = new Logger('TagController');

  @Get()
  getTags(@Query('page') page: string, @Query('term') term: string) {
    return this.tagService.getTag(page, term);
  }
}
