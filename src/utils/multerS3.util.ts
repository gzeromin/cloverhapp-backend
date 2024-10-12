import { S3Client, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

export const s3DeleteFile = async (
  configService: ConfigService,
  filePaths: string[],
): Promise<void> => {
  const s3 = new S3Client({
    region: configService.get('AWS_S3_REGION'),
    credentials: {
      accessKeyId: configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
    },
  });

  const bucket = configService.get('AWS_S3_BUCKET');
  // filePaths 배열을 S3 Key 형식으로 변환
  const keys = filePaths.map((filePath) => ({
    Key: filePath.replace(/^https?:\/\/[^\/]+\.amazonaws\.com\//, ''),
  }));
  const command = new DeleteObjectsCommand({
    Bucket: bucket,
    Delete: {
      Objects: keys, // 여러 파일 Key를 포함
    },
  });

  try {
    await s3.send(command);
  } catch (error) {
    throw new Error('S3 파일 삭제 중 오류가 발생했습니다.');
  }
};
