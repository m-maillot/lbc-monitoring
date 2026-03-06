import { SearchConfiguration } from '../entities/SearchConfiguration';

export interface ISearchConfigurationRepository {
  getAll(): Promise<SearchConfiguration[]>;
}
