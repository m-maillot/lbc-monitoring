import { Advertisement } from '../../src/domain/entities/Advertisement';
import { ILogger } from '../../src/domain/ports/ILogger';

export class BufferedLogger implements ILogger {
  private buffer: string[] = [];

  info(message: string): void {
    this.buffer.push(message);
  }

  error(message: string): void {
    this.buffer.push(`❌ ${message}`);
  }

  logNewAdvertisements(searchName: string, ads: Advertisement[]): void {
    this.buffer.push(`\n🆕 ${ads.length} nouvelle(s) annonce(s) pour "${searchName}":\n`);

    ads.forEach((ad, index) => {
      this.buffer.push(`📦 Annonce #${index + 1}`);
      this.buffer.push(`   Titre: ${ad.subject}`);
      this.buffer.push(`   Prix: ${ad.price}€`);
      this.buffer.push(`   Localisation: ${ad.location}`);
      this.buffer.push(`   Catégorie: ${ad.category}`);

      if (ad.description) {
        const truncatedDescription = ad.description.length > 200
          ? ad.description.substring(0, 200) + '...'
          : ad.description;
        this.buffer.push(`   Description: ${truncatedDescription}`);
      }

      this.buffer.push(`   🔗 Lien: ${ad.url}`);

      if (ad.firstImageUrl) {
        this.buffer.push(`   🖼️  Image: ${ad.firstImageUrl}`);
      }

      if (ad.date) {
        this.buffer.push(`   📅 Date de publication: ${ad.date}`);
      }

      if (ad.distance !== undefined) {
        this.buffer.push(`   📍 Distance: ${ad.distance.toFixed(1)} km`);
      }

      this.buffer.push('--------------------------------------------------------------------------------');
    });
  }

  logNoNewAdvertisements(searchName: string): void {
    this.buffer.push(`\n✅ Aucune nouvelle annonce pour "${searchName}"\n`);
  }

  getOutput(): string {
    return this.buffer.join('\n');
  }

  clear(): void {
    this.buffer = [];
  }
}
