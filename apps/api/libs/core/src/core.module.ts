import baseConfig from '@lib/core/config/base.config';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { CoreService } from './core.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      // the first one takes precedence.
      envFilePath: ['.env.production', '.env.development', '.env'],
      // use global, don't need to import in each module
      isGlobal: true,
      cache: true,
      load: [baseConfig],
    }),
  ],
  providers: [CoreService],
  exports: [CoreService],
})
export class CoreModule {}
