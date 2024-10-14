import { DoubleRequestException } from '@/exceptions/double-request.exception';
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class RequestThrottleInterceptor implements NestInterceptor {
  private requestMap = new Map<string, number>();
  private logger = new Logger('RequestThrottleInterceptor');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const requestKey = this.getRequestKey(request);
    const currentTime = Date.now();

    // 중복 요청 체크 (2초 이내에 동일한 요청)
    if (this.requestMap.has(requestKey)) {
      const lastRequestTime = this.requestMap.get(requestKey);
      if (lastRequestTime && currentTime - lastRequestTime < 2000) {
        this.logger.log(`중복된 요청 ${requestKey}`);
        throw new DoubleRequestException('중복된 요청입니다.');
      }
    }

    // 새로운 요청 시간 저장
    this.requestMap.set(requestKey, currentTime);

    return next.handle().pipe(
      tap(() => {
        // 2초 후에 요청 기록 제거
        setTimeout(() => {
          this.requestMap.delete(requestKey);
        }, 2000);
      }),
    );
  }

  // 요청을 고유하게 식별할 수 있는 키를 생성
  private getRequestKey(request: any): string {
    // 예: 사용자의 IP, URL, 메소드, 바디 등 조합
    const { ip, method, originalUrl, body } = request;
    return `${ip}-${method}-${originalUrl}-${JSON.stringify(body)}`;
  }
}
