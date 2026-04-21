import { IAdvertisementRepository } from '../../domain/ports/IAdvertisementRepository';
import { ISearchConfigurationRepository } from '../../domain/ports/ISearchConfigurationRepository';
import { ILogger } from '../../domain/ports/ILogger';
import { ISeenAdsStore } from '../../domain/ports/ISeenAdsStore';
import { IEmailNotifier } from '../../domain/ports/IEmailNotifier';
import { Advertisement } from '../../domain/entities/Advertisement';

export class MonitorAdvertisements {
  constructor(
    private advertisementRepository: IAdvertisementRepository,
    private searchConfigRepository: ISearchConfigurationRepository,
    private seenAdsStore: ISeenAdsStore,
    private logger: ILogger,
    private emailNotifier?: IEmailNotifier
  ) {}

  async execute(searchNames?: string[]): Promise<void> {
    this.logger.info('🔍 Démarrage de la surveillance des annonces LBC...\n');

    const allConfigs = await this.searchConfigRepository.getAll();
    const searchConfigs = searchNames
      ? allConfigs.filter((c) => searchNames.includes(c.name))
      : allConfigs;

    if (searchConfigs.length === 0) {
      this.logger.error('❌ Aucune configuration de recherche trouvée');
      return;
    }

    for (const config of searchConfigs) {
      this.logger.info(`📋 Recherche: "${config.name}"`);

      try {
        const advertisements = await this.advertisementRepository.search(config);
        const newAds: Advertisement[] = [];

        for (const ad of advertisements) {
          const seen = await this.seenAdsStore.hasBeenSeen(ad.id);
          if (!seen) {
            newAds.push(ad);
            await this.seenAdsStore.markAsSeen(ad.id);
          }
        }

        if (newAds.length > 0) {
          this.logger.logNewAdvertisements(config.name, newAds);

          // Send email notification if configured
          if (this.emailNotifier) {
            try {
              await this.emailNotifier.sendNewAdvertisements(config.name, newAds);
            } catch (error) {
              this.logger.error(`❌ Erreur lors de l'envoi de l'email pour "${config.name}": ${error}`);
            }
          }
        } else {
          this.logger.logNoNewAdvertisements(config.name);
        }
      } catch (error) {
        this.logger.error(`❌ Erreur lors de la recherche "${config.name}": ${error}`);
      }

      this.logger.info(''); // Ligne vide entre les recherches
    }

    this.logger.info('✅ Surveillance terminée\n');
  }
}
