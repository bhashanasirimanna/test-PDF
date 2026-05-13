import { Module } from '@nestjs/common';
import { AnnotationsController } from './annotations.controller';
import { AnnotationsService } from './annotations.service';
import { AnnotationsGateway } from './annotations.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [AnnotationsController],
  providers: [AnnotationsService, AnnotationsGateway],
})
export class AnnotationsModule {}
