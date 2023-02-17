import { WebLogger } from '@shared/chitility';

const logger = new WebLogger('AbcContext');
logger.error('123', { context: 1, x: 2 }, { a: 2 });
