import { Advertisement } from '../../domain/entities/Advertisement';

export function generateEmailHtml(searchName: string, ads: Advertisement[]): string {
  const adsHtml = ads
    .map(
      (ad, index) => `
    <div style="margin-bottom: 30px; padding: 20px; background-color: #f9f9f9; border-radius: 8px; border-left: 4px solid #FF6E14;">
      <h2 style="color: #333; margin-top: 0;">📦 Annonce #${index + 1}</h2>

      ${ad.imageUrl ? `
      <div style="margin-bottom: 15px;">
        <img src="${ad.imageUrl}" alt="${ad.title}" style="max-width: 100%; height: auto; border-radius: 4px;" />
      </div>
      ` : ''}

      <h3 style="color: #FF6E14; margin: 10px 0;">
        <a href="${ad.url}" style="color: #FF6E14; text-decoration: none;">${ad.title}</a>
      </h3>

      <div style="margin: 15px 0;">
        <p style="margin: 5px 0; color: #666;">
          <strong style="color: #333;">💰 Prix:</strong> ${ad.price}€
        </p>
        <p style="margin: 5px 0; color: #666;">
          <strong style="color: #333;">📍 Localisation:</strong> ${ad.location}${ad.distanceKm !== undefined ? ` <span style="color: #FF6E14; font-weight: bold;">(à ${ad.distanceKm} km)</span>` : ''}
        </p>
        <p style="margin: 5px 0; color: #666;">
          <strong style="color: #333;">📂 Catégorie:</strong> ${ad.category}
        </p>
        <p style="margin: 5px 0; color: #666;">
          <strong style="color: #333;">📅 Date de publication:</strong> ${ad.publicationDate.toLocaleString('fr-FR')}
        </p>
      </div>

      <div style="margin: 15px 0; padding: 15px; background-color: white; border-radius: 4px;">
        <p style="margin: 0; color: #333; line-height: 1.6;">
          <strong>Description:</strong><br/>
          ${ad.description.substring(0, 300)}${ad.description.length > 300 ? '...' : ''}
        </p>
      </div>

      <div style="margin-top: 15px;">
        <a href="${ad.url}"
           style="display: inline-block; padding: 12px 24px; background-color: #FF6E14; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">
          Voir l'annonce sur LeBonCoin →
        </a>
      </div>
    </div>
  `
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nouvelles annonces LBC</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; background-color: #ffffff;">

  <div style="text-align: center; margin-bottom: 30px; padding: 30px 20px; background: linear-gradient(135deg, #FF6E14 0%, #FF8A3D 100%); border-radius: 8px;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🔔 Nouvelles annonces LeBonCoin</h1>
    <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Recherche: <strong>${searchName}</strong></p>
  </div>

  <div style="margin-bottom: 20px; padding: 15px; background-color: #e8f4f8; border-radius: 8px; border-left: 4px solid #0288d1;">
    <p style="margin: 0; color: #01579b;">
      <strong>🆕 ${ads.length} nouvelle${ads.length > 1 ? 's' : ''} annonce${ads.length > 1 ? 's' : ''}</strong> trouvée${ads.length > 1 ? 's' : ''} !
    </p>
  </div>

  ${adsHtml}

  <div style="margin-top: 40px; padding: 20px; background-color: #f5f5f5; border-radius: 8px; text-align: center;">
    <p style="margin: 0; color: #666; font-size: 14px;">
      📧 Ce mail a été généré automatiquement par votre système de surveillance LBC
    </p>
    <p style="margin: 5px 0 0 0; color: #999; font-size: 12px;">
      ${new Date().toLocaleString('fr-FR')}
    </p>
  </div>

</body>
</html>
  `;
}
