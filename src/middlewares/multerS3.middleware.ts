import { S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import multerS3 from 'multer-s3';
import { basename, extname } from 'path';

export const multerOptionsFactory = (
  configService: ConfigService,
  folderName: string,
): MulterOptions => {
  return {
    storage: multerS3({
      s3: new S3Client({
        region: configService.get('AWS_S3_REGION'),
        credentials: {
          accessKeyId: configService.get('AWS_ACCESS_KEY_ID'),
          secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
        },
      }),
      bucket: configService.get('AWS_S3_BUCKET'),
      acl: 'public-read',
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key(_req, file, callback) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const extension = extname(file.originalname);
        const filename = basename(file.originalname, extension);
        callback(
          null,
          `cloverhapp/${folderName}/${filename}-${uniqueSuffix}${extension}`,
        );
      },
    }),
    // 파일 크기 제한
    /**
     * @note 이미지 파일과 동영상 파일 업로드 시 용량 제한을 분리하도록 하는 로직 필요
     */
    limits: {
      fileSize: 10 * 1024 * 1024, // 10mb
    },
  };
};
