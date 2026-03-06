import { MonitorAdvertisements } from './application/usecases/MonitorAdvertisements';
import { LbcAdvertisementRepository } from './infrastructure/adapters/LbcAdvertisementRepository';
import { ConsoleLogger } from './infrastructure/adapters/ConsoleLogger';
import { JsonSearchConfigurationRepository } from './infrastructure/adapters/JsonSearchConfigurationRepository';
import { FileSeenAdsStore } from './infrastructure/adapters/FileSeenAdsStore';
import { BrevoEmailNotifier } from './infrastructure/adapters/BrevoEmailNotifier';
import { IEmailNotifier } from './domain/ports/IEmailNotifier';
import { ILogger } from './domain/ports/ILogger';
import { join } from 'path';

export interface MonitorOptions {
  configPath?: string;
  storePath?: string;
  logger?: ILogger;
}

export async function runMonitoring(options: MonitorOptions = {}) {
  const configPath = options.configPath || process.env.CONFIG_PATH || join(process.cwd(), 'config', 'searches.json');
  const storePath = options.storePath || process.env.STORE_PATH || join(process.cwd(), 'data', 'seen-ads.json');
  const logger = options.logger || new ConsoleLogger();

  const advertisementRepository = new LbcAdvertisementRepository();
  const searchConfigRepository = new JsonSearchConfigurationRepository(configPath);
  const seenAdsStore = new FileSeenAdsStore(storePath);

  // Configure email notifier if environment variables are set
  let emailNotifier: IEmailNotifier | undefined;
  if (process.env.BREVO_API_KEY && process.env.EMAIL_TO) {
    emailNotifier = new BrevoEmailNotifier({
      apiKey: process.env.BREVO_API_KEY,
      fromEmail: process.env.EMAIL_FROM || 'noreply@lbc-monitoring.com',
      fromName: process.env.EMAIL_FROM_NAME || 'LBC Monitoring',
      toEmail: process.env.EMAIL_TO,
    });
    logger.info('📧 Notifications par email activées\n');
  } else {
    logger.info('📧 Notifications par email désactivées (variables BREVO_API_KEY et EMAIL_TO non définies)\n');
  }

  const monitorUseCase = new MonitorAdvertisements(
    advertisementRepository,
    searchConfigRepository,
    seenAdsStore,
    logger,
    emailNotifier
  );

  await monitorUseCase.execute();
}

async function main() {
  try {
    await runMonitoring();
    process.exit(0);
  } catch (error) {
    console.error(`❌ Erreur fatale: ${error}`);
    process.exit(1);
  }
}

// Only run main if this file is executed directly
if (require.main === module) {
  main();
}
