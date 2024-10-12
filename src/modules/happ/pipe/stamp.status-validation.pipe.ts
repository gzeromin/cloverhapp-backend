import { ArgumentMetadata, PipeTransform } from '@nestjs/common';
import { StampStatus } from '@/enums/stamp-status.enum';

export class UserStampValidationPipe implements PipeTransform {
  readonly StatusOptions = [StampStatus.PRIVATE, StampStatus.PUBLIC];

  transform(value: any, metadata: ArgumentMetadata) {
    // value = value.toUpperCase();

    // if (!this.isStatusValid(value)) {
    //   throw new BadRequestException(`${value} isn't in the status options`);
    // }
    return value;
  }

  private isStatusValid(status: any) {
    const index = this.StatusOptions.indexOf(status);
    return index !== -1;
  }
}
