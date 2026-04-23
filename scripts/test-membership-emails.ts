import * as dotenv from "dotenv"
import * as fs from "fs"
import * as path from "path"

// Manually load .env file
const envPath = path.join(process.cwd(), ".env")
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8")
  envContent.split("\n").forEach((line) => {
    const [key, ...valueParts] = line.split("=")
    if (key && valueParts.length > 0) {
      const value = valueParts.join("=").trim().replace(/^["']|["']$/g, "")
      process.env[key.trim()] = value
    }
  })
}

import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = process.env.FROM_EMAIL || "Nina - Tempo Le Loft <contact@tempoleloft.com>"
const BASE_URL = "https://tempoleloft.com"
const TEST_EMAIL = "benjamin@tempoleloft.com"

async function sendTestWelcomeEmail() {
  const firstName = "Benjamin"
  const planName = "Essentiel"
  const creditsPerMonth = 4
  const startDate = new Date()
  const commitmentEndDate = new Date()
  commitmentEndDate.setMonth(commitmentEndDate.getMonth() + 2)
  const commitmentMonths = 2
  const bonusCredits = 2

  const formattedStartDate = startDate.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
  const formattedEndDate = commitmentEndDate.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
  
  const totalCredits = creditsPerMonth * commitmentMonths + (bonusCredits || 0)
  const coursPerWeek = Math.round((creditsPerMonth * 12) / 52 * 10) / 10

  console.log("Sending welcome email...")
  
  await resend.emails.send({
    from: FROM_EMAIL,
    to: TEST_EMAIL,
    subject: `👑 [TEST] Bienvenue dans le Membership Tempo – ${planName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F2F1ED;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F2F1ED; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  
                  <!-- Header avec gradient -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #42101B 0%, #5a1a2a 50%, #2d0a10 100%); padding: 40px 40px 30px 40px; text-align: center;">
                      <img src="${BASE_URL}/logo-email.png" alt="TEMPO Le Loft" width="220" style="max-width: 220px; height: auto;">
                      <div style="margin-top: 20px; display: inline-block; background-color: rgba(255,255,255,0.15); padding: 8px 20px; border-radius: 20px;">
                        <span style="color: #FCD34D; font-size: 14px; font-weight: 600;">👑 MEMBERSHIP</span>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Contenu principal -->
                  <tr>
                    <td style="padding: 50px 40px;">
                      <div style="text-align: center; margin-bottom: 30px;">
                        <div style="display: inline-block; background-color: #F3E8FF; border-radius: 50%; padding: 20px;">
                          <span style="font-size: 40px;">🎉</span>
                        </div>
                      </div>
                      
                      <h2 style="margin: 0 0 20px 0; font-size: 28px; color: #42101B; font-weight: 600; text-align: center;">
                        Bienvenue ${firstName} !
                      </h2>
                      
                      <p style="margin: 0 0 25px 0; font-size: 16px; color: #555; line-height: 1.6; text-align: center;">
                        Vous faites maintenant partie de notre <strong style="color: #7C3AED;">communauté de membres</strong>. Merci pour votre confiance !
                      </p>
                      
                      <!-- Carte de membre -->
                      <div style="background: linear-gradient(135deg, #7C3AED 0%, #9333EA 100%); border-radius: 16px; padding: 30px; margin-bottom: 25px; color: white;">
                        <div style="margin-bottom: 20px;">
                          <span style="font-size: 14px; opacity: 0.9;">Votre formule</span>
                          <span style="float: right; font-size: 20px;">👑</span>
                        </div>
                        <h3 style="margin: 0 0 5px 0; font-size: 24px; font-weight: 700;">${planName}</h3>
                        <p style="margin: 0; font-size: 14px; opacity: 0.9;">${creditsPerMonth} crédits par mois</p>
                      </div>
                      
                      <!-- Récapitulatif -->
                      <div style="background-color: #F9F8F6; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
                        <h3 style="margin: 0 0 20px 0; font-size: 18px; color: #42101B; font-weight: 600;">
                          📋 Récapitulatif de votre abonnement
                        </h3>
                        <table cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
                              <span style="color: #888; font-size: 14px;">Date de début</span><br>
                              <span style="color: #42101B; font-size: 16px; font-weight: 500;">${formattedStartDate}</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
                              <span style="color: #888; font-size: 14px;">Fin d'engagement</span><br>
                              <span style="color: #42101B; font-size: 16px; font-weight: 500;">${formattedEndDate}</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
                              <span style="color: #888; font-size: 14px;">Durée d'engagement</span><br>
                              <span style="color: #42101B; font-size: 16px; font-weight: 500;">${commitmentMonths} mois</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 12px 0;">
                              <span style="color: #888; font-size: 14px;">Total de cours sur l'engagement</span><br>
                              <span style="color: #7C3AED; font-size: 20px; font-weight: 700;">${totalCredits} cours</span>
                              <span style="color: #888; font-size: 13px; display: block; margin-top: 4px;">
                                Soit environ ${coursPerWeek} cours par semaine jusqu'au ${formattedEndDate}
                              </span>
                            </td>
                          </tr>
                        </table>
                      </div>
                      
                      <!-- Bonus -->
                      <div style="background-color: #D1FAE5; border-radius: 12px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #10B981;">
                        <p style="margin: 0; font-size: 15px; color: #065F46;">
                          <strong>🎁 Bonus de bienvenue :</strong> ${bonusCredits} crédits offerts ajoutés à votre compte !
                        </p>
                      </div>
                      
                      <!-- Avantages -->
                      <div style="background-color: #F9F8F6; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
                        <p style="margin: 0 0 15px 0; font-size: 14px; font-weight: 600; color: #42101B;">✨ Vos avantages membre :</p>
                        <table cellpadding="0" cellspacing="0">
                          <tr><td style="padding: 6px 0; font-size: 14px; color: #666;">✓ &nbsp; Crédits automatiques chaque mois</td></tr>
                          <tr><td style="padding: 6px 0; font-size: 14px; color: #666;">✓ &nbsp; Tarif préférentiel garanti</td></tr>
                          <tr><td style="padding: 6px 0; font-size: 14px; color: #666;">✓ &nbsp; Crédits valables +1 mois après fin d'abonnement</td></tr>
                          <tr><td style="padding: 6px 0; font-size: 14px; color: #666;">✓ &nbsp; Gestion facile depuis votre espace client</td></tr>
                        </table>
                      </div>
                      
                      <!-- Bouton CTA -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 10px 0 20px 0;">
                            <a href="${BASE_URL}/app/planning" style="display: inline-block; padding: 18px 50px; background-color: #7C3AED; color: #ffffff; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px;">
                              Réserver mon premier cours
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 0; font-size: 14px; color: #666; line-height: 1.6; text-align: center;">
                        Merci de faire partie de la communauté Tempo ! 🙏
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #F9F8F6; padding: 30px 40px; text-align: center; border-top: 1px solid #eee;">
                      <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: 600; color: #42101B;">Tempo – Le Loft</p>
                      <p style="margin: 0 0 5px 0; font-size: 13px; color: #888;">41 Rue du Temple, 75004 Paris</p>
                      <p style="margin: 0 0 15px 0; font-size: 13px; color: #888;">
                        <a href="mailto:contact@tempoleloft.com" style="color: #42101B; text-decoration: none;">contact@tempoleloft.com</a>
                      </p>
                      <a href="https://www.instagram.com/tempo_leloft/" style="display: inline-block; text-decoration: none;">
                        <img src="https://cdn-icons-png.flaticon.com/512/174/174855.png" alt="Instagram" width="28" height="28" style="border-radius: 6px;">
                      </a>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  })
  
  console.log("✅ Welcome email sent!")
}

async function sendTestReminderEmail() {
  const firstName = "Benjamin"
  const planName = "Essentiel"
  const renewalDate = new Date()
  renewalDate.setDate(renewalDate.getDate() + 2)
  const priceCents = 6500

  const formattedRenewalDate = renewalDate.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
  const price = (priceCents / 100).toFixed(0)

  console.log("Sending reminder email...")
  
  await resend.emails.send({
    from: FROM_EMAIL,
    to: TEST_EMAIL,
    subject: `⏰ [TEST] Rappel – Votre abonnement ${planName} se renouvelle dans 2 jours`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F2F1ED;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F2F1ED; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background-color: #42101B; padding: 40px 40px 30px 40px; text-align: center;">
                      <img src="${BASE_URL}/logo-email.png" alt="TEMPO Le Loft" width="220" style="max-width: 220px; height: auto;">
                    </td>
                  </tr>
                  
                  <!-- Contenu -->
                  <tr>
                    <td style="padding: 50px 40px;">
                      <div style="text-align: center; margin-bottom: 30px;">
                        <div style="display: inline-block; background-color: #FEF3C7; border-radius: 50%; padding: 20px;">
                          <span style="font-size: 40px;">⏰</span>
                        </div>
                      </div>
                      
                      <h2 style="margin: 0 0 20px 0; font-size: 24px; color: #42101B; font-weight: 600; text-align: center;">
                        Renouvellement dans 2 jours
                      </h2>
                      
                      <p style="margin: 0 0 25px 0; font-size: 16px; color: #555; line-height: 1.6;">
                        Bonjour ${firstName},
                      </p>
                      
                      <p style="margin: 0 0 25px 0; font-size: 16px; color: #555; line-height: 1.6;">
                        Nous voulions vous informer que votre abonnement <strong style="color: #7C3AED;">${planName}</strong> sera automatiquement renouvelé dans 2 jours.
                      </p>
                      
                      <!-- Détails -->
                      <div style="background-color: #F9F8F6; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
                        <h3 style="margin: 0 0 20px 0; font-size: 18px; color: #42101B; font-weight: 600;">
                          📅 Détails du renouvellement
                        </h3>
                        <table cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
                              <span style="color: #888; font-size: 14px;">Formule</span><br>
                              <span style="color: #42101B; font-size: 16px; font-weight: 600;">${planName}</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
                              <span style="color: #888; font-size: 14px;">Date de renouvellement</span><br>
                              <span style="color: #42101B; font-size: 16px; font-weight: 500;">${formattedRenewalDate}</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 12px 0;">
                              <span style="color: #888; font-size: 14px;">Montant</span><br>
                              <span style="color: #42101B; font-size: 18px; font-weight: 600;">${price}€</span>
                            </td>
                          </tr>
                        </table>
                      </div>
                      
                      <!-- Message positif -->
                      <div style="background-color: #D1FAE5; border-radius: 12px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #10B981;">
                        <p style="margin: 0; font-size: 15px; color: #065F46;">
                          <strong>💚 Nous espérons que vous êtes satisfait(e)</strong> de votre expérience chez Tempo ! Si vous avez des questions ou des retours, n'hésitez pas à nous contacter.
                        </p>
                      </div>
                      
                      <!-- Option annulation -->
                      <div style="background-color: #FEF3C7; border-radius: 12px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #F59E0B;">
                        <p style="margin: 0; font-size: 14px; color: #92400E;">
                          <strong>💡 Vous souhaitez annuler ?</strong><br>
                          Vous pouvez annuler votre abonnement à tout moment depuis votre espace client. L'annulation prendra effet à la fin de votre période en cours.
                        </p>
                      </div>
                      
                      <!-- Bouton -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 10px 0 10px 0;">
                            <a href="${BASE_URL}/app/compte" style="display: inline-block; padding: 18px 50px; background-color: #42101B; color: #F2F1ED; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px;">
                              Gérer mon abonnement
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 20px 0 0 0; font-size: 14px; color: #666; line-height: 1.6; text-align: center;">
                        Merci de votre fidélité ! 🙏<br>L'équipe Tempo
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #F9F8F6; padding: 30px 40px; text-align: center; border-top: 1px solid #eee;">
                      <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: 600; color: #42101B;">Tempo – Le Loft</p>
                      <p style="margin: 0 0 5px 0; font-size: 13px; color: #888;">41 Rue du Temple, 75004 Paris</p>
                      <p style="margin: 0 0 15px 0; font-size: 13px; color: #888;">
                        <a href="mailto:contact@tempoleloft.com" style="color: #42101B; text-decoration: none;">contact@tempoleloft.com</a>
                      </p>
                      <a href="https://www.instagram.com/tempo_leloft/" style="display: inline-block; text-decoration: none;">
                        <img src="https://cdn-icons-png.flaticon.com/512/174/174855.png" alt="Instagram" width="28" height="28" style="border-radius: 6px;">
                      </a>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  })
  
  console.log("✅ Reminder email sent!")
}

async function sendTestRenewalEmail() {
  const firstName = "Benjamin"
  const planName = "Essentiel"
  const creditsPerMonth = 4
  const newPeriodStart = new Date()
  const newPeriodEnd = new Date()
  newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1)

  const formattedStartDate = newPeriodStart.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
  const formattedEndDate = newPeriodEnd.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  console.log("Sending renewal confirmation email...")
  
  await resend.emails.send({
    from: FROM_EMAIL,
    to: TEST_EMAIL,
    subject: `✅ [TEST] Abonnement renouvelé – ${creditsPerMonth} crédits ajoutés !`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F2F1ED;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F2F1ED; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  
                  <!-- Header avec gradient -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #42101B 0%, #5a1a2a 50%, #2d0a10 100%); padding: 40px 40px 30px 40px; text-align: center;">
                      <img src="${BASE_URL}/logo-email.png" alt="TEMPO Le Loft" width="220" style="max-width: 220px; height: auto;">
                      <div style="margin-top: 20px; display: inline-block; background-color: rgba(255,255,255,0.15); padding: 8px 20px; border-radius: 20px;">
                        <span style="color: #FCD34D; font-size: 14px; font-weight: 600;">👑 MEMBERSHIP</span>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Contenu -->
                  <tr>
                    <td style="padding: 50px 40px;">
                      <div style="text-align: center; margin-bottom: 30px;">
                        <div style="display: inline-block; background-color: #D1FAE5; border-radius: 50%; padding: 20px;">
                          <span style="font-size: 40px;">✓</span>
                        </div>
                      </div>
                      
                      <h2 style="margin: 0 0 20px 0; font-size: 28px; color: #42101B; font-weight: 600; text-align: center;">
                        Abonnement renouvelé !
                      </h2>
                      
                      <p style="margin: 0 0 25px 0; font-size: 16px; color: #555; line-height: 1.6;">
                        Bonjour ${firstName},
                      </p>
                      
                      <p style="margin: 0 0 25px 0; font-size: 16px; color: #555; line-height: 1.6;">
                        Merci pour votre fidélité ! Votre abonnement <strong style="color: #7C3AED;">${planName}</strong> a été renouvelé avec succès.
                      </p>
                      
                      <!-- Crédits ajoutés -->
                      <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); border-radius: 16px; padding: 30px; margin-bottom: 25px; color: white; text-align: center;">
                        <p style="margin: 0 0 10px 0; font-size: 16px; opacity: 0.9;">Crédits ajoutés ce mois</p>
                        <p style="margin: 0; font-size: 48px; font-weight: 700;">+${creditsPerMonth}</p>
                        <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">crédits disponibles</p>
                      </div>
                      
                      <!-- Récapitulatif -->
                      <div style="background-color: #F9F8F6; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
                        <h3 style="margin: 0 0 20px 0; font-size: 18px; color: #42101B; font-weight: 600;">
                          📋 Détails du renouvellement
                        </h3>
                        <table cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
                              <span style="color: #888; font-size: 14px;">Formule</span><br>
                              <span style="color: #42101B; font-size: 16px; font-weight: 600;">${planName}</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
                              <span style="color: #888; font-size: 14px;">Début de période</span><br>
                              <span style="color: #42101B; font-size: 16px; font-weight: 500;">${formattedStartDate}</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 12px 0;">
                              <span style="color: #888; font-size: 14px;">Prochain renouvellement</span><br>
                              <span style="color: #42101B; font-size: 16px; font-weight: 500;">${formattedEndDate}</span>
                            </td>
                          </tr>
                        </table>
                      </div>
                      
                      <!-- Bouton -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 10px 0 20px 0;">
                            <a href="${BASE_URL}/app/planning" style="display: inline-block; padding: 18px 50px; background-color: #7C3AED; color: #ffffff; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px;">
                              Réserver un cours
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 0; font-size: 14px; color: #666; line-height: 1.6; text-align: center;">
                        On se retrouve au studio ! 🙏<br>L'équipe Tempo
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #F9F8F6; padding: 30px 40px; text-align: center; border-top: 1px solid #eee;">
                      <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: 600; color: #42101B;">Tempo – Le Loft</p>
                      <p style="margin: 0 0 5px 0; font-size: 13px; color: #888;">41 Rue du Temple, 75004 Paris</p>
                      <p style="margin: 0 0 15px 0; font-size: 13px; color: #888;">
                        <a href="mailto:contact@tempoleloft.com" style="color: #42101B; text-decoration: none;">contact@tempoleloft.com</a>
                      </p>
                      <a href="https://www.instagram.com/tempo_leloft/" style="display: inline-block; text-decoration: none;">
                        <img src="https://cdn-icons-png.flaticon.com/512/174/174855.png" alt="Instagram" width="28" height="28" style="border-radius: 6px;">
                      </a>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  })
  
  console.log("✅ Renewal confirmation email sent!")
}

async function main() {
  console.log("🚀 Sending test membership emails to:", TEST_EMAIL)
  console.log("")
  
  await sendTestWelcomeEmail()
  await sendTestReminderEmail()
  await sendTestRenewalEmail()
  
  console.log("")
  console.log("🎉 All test emails sent!")
}

main().catch(console.error)
