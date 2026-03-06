import { IEmailNotifier } from '../../domain/ports/IEmailNotifier';
import { Advertisement } from '../../domain/entities/Advertisement';
import { generateEmailHtml } from '../templates/emailTemplate';

interface BrevoConfig {
  apiKey: string;
  fromEmail: string;
  fromName: string;
  toEmail: string;
}

export class BrevoEmailNotifier implements IEmailNotifier {
  constructor(private config: BrevoConfig) {}

  async sendNewAdvertisements(searchName: string, ads: Advertisement[]): Promise<void> {
    if (ads.length === 0) {
      return;
    }

    const htmlContent = generateEmailHtml(searchName, ads);
    const subject = `🔔 ${ads.length} nouvelle${ads.length > 1 ? 's' : ''} annonce${ads.length > 1 ? 's' : ''} - ${searchName}`;

    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': this.config.apiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: {
            name: this.config.fromName,
            email: this.config.fromEmail,
          },
          to: [
            {
              email: this.config.toEmail,
            },
          ],
          subject: subject,
          htmlContent: htmlContent,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur Brevo (${response.status}): ${errorText}`);
      }

      console.log(`✅ Email envoyé pour "${searchName}" (${ads.length} annonce${ads.length > 1 ? 's' : ''})`);
    } catch (error) {
      console.error(`❌ Erreur lors de l'envoi de l'email pour "${searchName}":`, error);
      throw error;
    }
  }
}
