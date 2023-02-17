import type { QueueModuleOptions } from '@lib/queue/model/interface/queue-module-options.interface';
import { ConfigurableModuleBuilder } from '@nestjs/common';

export const {
  ConfigurableModuleClass: QueueConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<QueueModuleOptions>().build();
