import { ISeenAdsStore } from '../../domain/ports/ISeenAdsStore';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { dirname } from 'path';

export class FileSeenAdsStore implements ISeenAdsStore {
  private seenAds: Set<number> = new Set();
  private loaded: boolean = false;

  constructor(private readonly storePath: string) {}

  async hasBeenSeen(adId: number): Promise<boolean> {
    await this.ensureLoaded();
    return this.seenAds.has(adId);
  }

  async markAsSeen(adId: number): Promise<void> {
    await this.ensureLoaded();
    this.seenAds.add(adId);
    await this.persist();
  }

  private async ensureLoaded(): Promise<void> {
    if (this.loaded) return;

    if (existsSync(this.storePath)) {
      try {
        const content = await readFile(this.storePath, 'utf-8');
        const data = JSON.parse(content);
        this.seenAds = new Set(data.seenAds || []);
      } catch (error) {
        console.error(`Erreur lors du chargement du store: ${error}`);
        this.seenAds = new Set();
      }
    }

    this.loaded = true;
  }

  private async persist(): Promise<void> {
    try {
      const dir = dirname(this.storePath);
      if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true });
      }

      const data = {
        seenAds: Array.from(this.seenAds),
        lastUpdate: new Date().toISOString(),
      };

      await writeFile(this.storePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      console.error(`Erreur lors de la sauvegarde du store: ${error}`);
    }
  }
}
