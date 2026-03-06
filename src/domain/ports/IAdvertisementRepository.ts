import { Advertisement } from '../entities/Advertisement';
import { SearchConfiguration } from '../entities/SearchConfiguration';

export interface IAdvertisementRepository {
  search(config: SearchConfiguration): Promise<Advertisement[]>;
}
