import { ILogger } from '../../domain/ports/ILogger';
import { Advertisement } from '../../domain/entities/Advertisement';

export class ConsoleLogger implements ILogger {
  info(message: string): void {
    console.log(message);
  }

  error(message: string): void {
    console.error(message);
  }

  logNewAdvertisements(searchName: string, ads: Advertisement[]): void {
    console.log(`\n🆕 ${ads.length} nouvelle(s) annonce(s) pour "${searchName}":\n`);
    console.log('='.repeat(80));

    ads.forEach((ad, index) => {
      console.log(`\n📦 Annonce #${index + 1}`);
      console.log(`   Titre: ${ad.title}`);
      console.log(`   Prix: ${ad.price}€`);

      // Display location with distance if available
      if (ad.distanceKm !== undefined) {
        console.log(`   📍 Localisation: ${ad.location} (à ${ad.distanceKm} km)`);
      } else {
        console.log(`   📍 Localisation: ${ad.location}`);
      }

      console.log(`   Catégorie: ${ad.category}`);
      console.log(`   Description: ${this.truncateDescription(ad.description)}`);
      console.log(`   🔗 Lien: ${ad.url}`);
      if (ad.imageUrl) {
        console.log(`   🖼️  Image: ${ad.imageUrl}`);
      }
      console.log(`   📅 Date de publication: ${ad.publicationDate.toLocaleString('fr-FR')}`);
      console.log('-'.repeat(80));
    });

    console.log('');
  }

  logNoNewAdvertisements(searchName: string): void {
    console.log(`   ℹ️  Aucune nouvelle annonce pour "${searchName}"\n`);
  }

  private truncateDescription(description: string, maxLength: number = 200): string {
    if (description.length <= maxLength) {
      return description;
    }
    return description.substring(0, maxLength) + '...';
  }
}
