import { Column, Entity } from 'typeorm';
import Common from './common.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Book extends Common {
  @ApiProperty({
    description: '도서 제목',
  })
  @Column()
  title: string;

  @ApiProperty({
    description: '도서 소개',
  })
  @Column({
    nullable: true,
  })
  contents: string | null;

  @ApiProperty({
    description: '도서 상세 URL',
  })
  @Column({
    nullable: true,
  })
  url: string | null;

  /**
   * ISBN10(10자리) 또는 ISBN13(13자리) 형식의 국제 표준 도서번호
   * (International Standard Book Number)
   * ISBN10 또는 ISBN13 중 하나 이상 포함
   * 두 값이 모두 제공될 경우 공백(' ')으로 구분
   */
  @ApiProperty({
    description: '국제 표준 도서번호',
  })
  @Column({
    nullable: true,
  })
  isbn: string | null;

  @ApiProperty({
    description: '도서 표지 미리보기 URL',
  })
  @Column({
    nullable: true,
  })
  thumbnail: string | null;

  @ApiProperty({
    description: '도서 출판사',
  })
  @Column({
    nullable: true,
  })
  publisher: string | null;

  @ApiProperty({
    description: '도서 저자 리스트',
  })
  @Column({
    type: 'jsonb',
    nullable: true,
  })
  authors: string[] | null;
}
