import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.FROM_EMAIL || "Nina - Tempo Le Loft <contact@tempoleloft.com>"
const BASE_URL = process.env.NODE_ENV === "production" 
  ? "https://tempoleloft.com" 
  : (process.env.NEXTAUTH_URL || "http://localhost:3000")

export async function sendVerificationEmail(email: string, token: string, firstName?: string) {
  const verificationUrl = `${BASE_URL}/verify-email?token=${token}`
  const name = firstName || "vous"

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "✨ Bienvenue chez Tempo – Activez votre compte",
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
                    
                    <!-- Header bordeaux avec logo -->
                    <tr>
                      <td style="background-color: #42101B; padding: 40px 40px 30px 40px; text-align: center;">
                        <img src="${BASE_URL}/logo-email.png" alt="TEMPO Le Loft" width="220" style="max-width: 220px; height: auto;">
                      </td>
                    </tr>
                    
                    <!-- Contenu principal -->
                    <tr>
                      <td style="padding: 50px 40px;">
                        <h2 style="margin: 0 0 20px 0; font-size: 28px; color: #42101B; font-weight: 600;">
                          Bienvenue ${name} ! 🙏
                        </h2>
                        
                        <p style="margin: 0 0 25px 0; font-size: 16px; color: #555; line-height: 1.6;">
                          Nous sommes ravis de vous accueillir dans notre communauté. Votre espace bien-être vous attend.
                        </p>
                        
                        <p style="margin: 0 0 30px 0; font-size: 16px; color: #555; line-height: 1.6;">
                          Pour commencer à réserver vos cours, activez votre compte en cliquant sur le bouton ci-dessous :
                        </p>
                        
                        <!-- Bouton CTA -->
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center" style="padding: 10px 0 30px 0;">
                              <a href="${verificationUrl}" style="display: inline-block; padding: 18px 50px; background-color: #42101B; color: #F2F1ED; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; letter-spacing: 0.5px;">
                                Activer mon compte
                              </a>
                            </td>
                          </tr>
                        </table>
                        
                        <!-- Ce qui vous attend -->
                        <div style="background-color: #F9F8F6; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
                          <p style="margin: 0 0 15px 0; font-size: 14px; font-weight: 600; color: #42101B;">Ce qui vous attend :</p>
                          <table cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding: 5px 0; font-size: 14px; color: #666;">✓ &nbsp; Réservation de cours en quelques clics</td>
                            </tr>
                            <tr>
                              <td style="padding: 5px 0; font-size: 14px; color: #666;">✓ &nbsp; Accès à notre planning en temps réel</td>
                            </tr>
                            <tr>
                              <td style="padding: 5px 0; font-size: 14px; color: #666;">✓ &nbsp; Gestion de vos crédits et historique</td>
                            </tr>
                            <tr>
                              <td style="padding: 5px 0; font-size: 14px; color: #666;">✓ &nbsp; Notifications personnalisées</td>
                            </tr>
                          </table>
                        </div>
                        
                        <p style="margin: 0; font-size: 13px; color: #999; line-height: 1.5;">
                          Ce lien expire dans 24 heures. Si vous n'avez pas créé de compte, ignorez simplement cet email.
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
                  
                  <!-- Lien de secours discret -->
                  <p style="margin: 20px 0 0 0; font-size: 11px; color: #999; text-align: center;">
                    Problème avec le bouton ? <a href="${verificationUrl}" style="color: #42101B;">Cliquez ici</a>
                  </p>
                  
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    })
    
    return { success: true }
  } catch (error) {
    console.error("Email send error:", error)
    return { success: false, error: "Erreur lors de l'envoi de l'email" }
  }
}

export async function sendWaitlistNotification(
  email: string,
  token: string,
  className: string,
  classDate: Date,
  firstName: string
) {
  const acceptUrl = `${BASE_URL}/accept-waitlist?token=${token}`
  const formattedDate = classDate.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  })

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Une place s'est libérée pour ${className} !`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #F2F1ED;
              }
              .container {
                background-color: white;
                border-radius: 8px;
                padding: 40px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
              }
              .logo {
                font-size: 32px;
                font-weight: bold;
                color: #42101B;
                margin-bottom: 10px;
              }
              .button {
                display: inline-block;
                padding: 16px 32px;
                background-color: #42101B;
                color: #F2F1ED !important;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 600;
                font-size: 16px;
                margin: 20px 0;
              }
              .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                font-size: 12px;
                color: #666;
                text-align: center;
              }
              .urgent {
                background-color: #fee2e2;
                border-left: 4px solid #dc2626;
                padding: 12px;
                margin: 20px 0;
                border-radius: 4px;
                font-size: 14px;
                color: #dc2626;
              }
              .class-info {
                background-color: #f9f9f9;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">TEMPO</div>
                <p style="color: #666; margin: 0;">Le Loft</p>
              </div>
              
              <h1 style="color: #42101B; margin-top: 0;">Bonne nouvelle, ${firstName} !</h1>
              
              <p>Une place s'est libérée pour le cours que vous aviez mis en liste d'attente.</p>
              
              <div class="class-info">
                <h2 style="color: #42101B; margin: 0 0 10px 0;">${className}</h2>
                <p style="margin: 0; color: #666;">${formattedDate}</p>
              </div>
              
              <div class="urgent">
                <strong>⚡ Attention :</strong> Vous avez <strong>10 minutes</strong> pour accepter cette place. Passé ce délai, elle sera proposée à la personne suivante.
              </div>
              
              <div style="text-align: center;">
                <a href="${acceptUrl}" class="button">Accepter cette place</a>
              </div>
              
              <p style="font-size: 14px; color: #666;">
                Si le bouton ne fonctionne pas, copiez et collez ce lien :<br>
                <a href="${acceptUrl}" style="color: #42101B; word-break: break-all;">${acceptUrl}</a>
              </p>
              
              <p style="font-size: 14px; color: #666;">
                Note : Un crédit sera débité de votre compte lors de l'acceptation.
              </p>
              
              <div class="footer">
                <p>Tempo – Le Loft<br>
                41 Rue du Temple, 75004 Paris</p>
                <p style="margin-top: 15px;">
                  <a href="https://www.instagram.com/tempo_leloft/" style="text-decoration: none;">
                    <img src="https://cdn-icons-png.flaticon.com/512/174/174855.png" alt="Instagram" width="28" height="28" style="border-radius: 6px;">
                  </a>
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    })
    
    return { success: true }
  } catch (error) {
    console.error("Waitlist notification email error:", error)
    return { success: false, error: "Erreur lors de l'envoi de l'email" }
  }
}

export async function sendClassCancellationEmail(
  email: string,
  firstName: string,
  className: string,
  teacherName: string,
  classDate: Date
) {
  const formattedDate = classDate.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
  const formattedTime = classDate.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  })

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `⚠️ Cours annulé – ${className} du ${formattedDate}`,
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
                    
                    <!-- Header bordeaux avec logo -->
                    <tr>
                      <td style="background-color: #42101B; padding: 40px 40px 30px 40px; text-align: center;">
                        <img src="${BASE_URL}/logo-email.png" alt="TEMPO Le Loft" width="220" style="max-width: 220px; height: auto;">
                      </td>
                    </tr>
                    
                    <!-- Contenu principal -->
                    <tr>
                      <td style="padding: 50px 40px;">
                        <h2 style="margin: 0 0 20px 0; font-size: 24px; color: #42101B; font-weight: 600;">
                          Cours annulé
                        </h2>
                        
                        <p style="margin: 0 0 25px 0; font-size: 16px; color: #555; line-height: 1.6;">
                          Bonjour ${firstName},
                        </p>
                        
                        <p style="margin: 0 0 25px 0; font-size: 16px; color: #555; line-height: 1.6;">
                          Nous sommes sincèrement désolés de vous informer que le cours suivant a dû être annulé :
                        </p>
                        
                        <!-- Détails du cours -->
                        <div style="background-color: #FEE2E2; border-radius: 12px; padding: 25px; margin-bottom: 25px; border-left: 4px solid #DC2626;">
                          <table cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td style="padding: 8px 0;">
                                <span style="color: #666; font-size: 14px;">Cours :</span><br>
                                <span style="color: #42101B; font-size: 18px; font-weight: 600;">${className}</span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0;">
                                <span style="color: #666; font-size: 14px;">Professeur :</span><br>
                                <span style="color: #42101B; font-size: 16px; font-weight: 500;">${teacherName}</span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0;">
                                <span style="color: #666; font-size: 14px;">Date :</span><br>
                                <span style="color: #42101B; font-size: 16px; font-weight: 500;">${formattedDate} à ${formattedTime}</span>
                              </td>
                            </tr>
                          </table>
                        </div>
                        
                        <!-- Remboursement -->
                        <div style="background-color: #D1FAE5; border-radius: 12px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #10B981;">
                          <p style="margin: 0; font-size: 15px; color: #065F46;">
                            <strong>✓ Bonne nouvelle :</strong> Votre crédit a été automatiquement recrédité sur votre compte.
                          </p>
                        </div>
                        
                        <p style="margin: 0 0 25px 0; font-size: 16px; color: #555; line-height: 1.6;">
                          Toute l'équipe de Tempo vous présente ses excuses pour ce désagrément. 
                          N'hésitez pas à réserver un autre cours sur notre planning.
                        </p>
                        
                        <!-- Bouton CTA -->
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center" style="padding: 10px 0 20px 0;">
                              <a href="${BASE_URL}/planning" style="display: inline-block; padding: 18px 50px; background-color: #42101B; color: #F2F1ED; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; letter-spacing: 0.5px;">
                                Voir le planning
                              </a>
                            </td>
                          </tr>
                        </table>
                        
                        <p style="margin: 0; font-size: 14px; color: #666; line-height: 1.6; text-align: center;">
                          Merci pour votre compréhension.<br>
                          À très bientôt au studio ! 🙏
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
    
    return { success: true }
  } catch (error) {
    console.error("Class cancellation email error:", error)
    return { success: false, error: "Erreur lors de l'envoi de l'email" }
  }
}

export async function sendTeacherWelcomeEmail(email: string, token: string, displayName: string) {
  const setupUrl = `${BASE_URL}/reset-password?token=${token}`

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "🎉 Bienvenue dans l'équipe Tempo – Configurez votre compte",
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
                    
                    <!-- Header bordeaux avec logo -->
                    <tr>
                      <td style="background-color: #42101B; padding: 40px 40px 30px 40px; text-align: center;">
                        <img src="${BASE_URL}/logo-email.png" alt="TEMPO Le Loft" width="220" style="max-width: 220px; height: auto;">
                      </td>
                    </tr>
                    
                    <!-- Contenu principal -->
                    <tr>
                      <td style="padding: 50px 40px;">
                        <h2 style="margin: 0 0 20px 0; font-size: 28px; color: #42101B; font-weight: 600;">
                          Bienvenue ${displayName} ! 🙏
                        </h2>
                        
                        <p style="margin: 0 0 25px 0; font-size: 16px; color: #555; line-height: 1.6;">
                          Nous sommes ravis de vous accueillir dans l'équipe des professeurs de <strong>Tempo – Le Loft</strong> !
                        </p>
                        
                        <p style="margin: 0 0 25px 0; font-size: 16px; color: #555; line-height: 1.6;">
                          Votre compte professeur a été créé. Pour finaliser votre inscription et accéder à votre espace, veuillez définir votre mot de passe :
                        </p>
                        
                        <!-- Bouton CTA -->
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center" style="padding: 10px 0 30px 0;">
                              <a href="${setupUrl}" style="display: inline-block; padding: 18px 50px; background-color: #42101B; color: #F2F1ED; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; letter-spacing: 0.5px;">
                                Configurer mon mot de passe
                              </a>
                            </td>
                          </tr>
                        </table>
                        
                        <!-- Ce qui vous attend -->
                        <div style="background-color: #F9F8F6; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
                          <p style="margin: 0 0 15px 0; font-size: 14px; font-weight: 600; color: #42101B;">Votre espace professeur vous permet de :</p>
                          <table cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding: 5px 0; font-size: 14px; color: #666;">✓ &nbsp; Consulter votre planning de cours</td>
                            </tr>
                            <tr>
                              <td style="padding: 5px 0; font-size: 14px; color: #666;">✓ &nbsp; Voir la liste des participants inscrits</td>
                            </tr>
                            <tr>
                              <td style="padding: 5px 0; font-size: 14px; color: #666;">✓ &nbsp; Gérer les présences</td>
                            </tr>
                          </table>
                        </div>
                        
                        <p style="margin: 0; font-size: 13px; color: #999; line-height: 1.5;">
                          Ce lien expire dans 24 heures. Si vous avez des questions, contactez-nous à contact@tempoleloft.com
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
                  
                  <!-- Lien de secours discret -->
                  <p style="margin: 20px 0 0 0; font-size: 11px; color: #999; text-align: center;">
                    Problème avec le bouton ? <a href="${setupUrl}" style="color: #42101B;">Cliquez ici</a>
                  </p>
                  
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    })
    
    return { success: true }
  } catch (error) {
    console.error("Teacher welcome email error:", error)
    return { success: false, error: "Erreur lors de l'envoi de l'email" }
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${BASE_URL}/reset-password?token=${token}`

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "🔐 Réinitialisation de votre mot de passe – Tempo",
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
                    
                    <!-- Header bordeaux avec logo -->
                    <tr>
                      <td style="background-color: #42101B; padding: 40px 40px 30px 40px; text-align: center;">
                        <img src="${BASE_URL}/logo-email.png" alt="TEMPO Le Loft" width="220" style="max-width: 220px; height: auto;">
                      </td>
                    </tr>
                    
                    <!-- Contenu principal -->
                    <tr>
                      <td style="padding: 50px 40px;">
                        <h2 style="margin: 0 0 20px 0; font-size: 24px; color: #42101B; font-weight: 600;">
                          Réinitialisation de mot de passe
                        </h2>
                        
                        <p style="margin: 0 0 25px 0; font-size: 16px; color: #555; line-height: 1.6;">
                          Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour en créer un nouveau :
                        </p>
                        
                        <!-- Bouton CTA -->
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center" style="padding: 10px 0 30px 0;">
                              <a href="${resetUrl}" style="display: inline-block; padding: 18px 50px; background-color: #42101B; color: #F2F1ED; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; letter-spacing: 0.5px;">
                                Réinitialiser mon mot de passe
                              </a>
                            </td>
                          </tr>
                        </table>
                        
                        <!-- Warning -->
                        <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; border-radius: 8px; padding: 16px; margin-bottom: 25px;">
                          <p style="margin: 0; font-size: 14px; color: #92400E;">
                            <strong>⚠️ Important :</strong> Si vous n'avez pas demandé cette réinitialisation, ignorez simplement cet email. Votre mot de passe restera inchangé.
                          </p>
                        </div>
                        
                        <p style="margin: 0; font-size: 13px; color: #999; line-height: 1.5;">
                          Ce lien expire dans 1 heure pour des raisons de sécurité.
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
                  
                  <!-- Lien de secours discret -->
                  <p style="margin: 20px 0 0 0; font-size: 11px; color: #999; text-align: center;">
                    Problème avec le bouton ? <a href="${resetUrl}" style="color: #42101B;">Cliquez ici</a>
                  </p>
                  
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    })
    
    return { success: true }
  } catch (error) {
    console.error("Email send error:", error)
    return { success: false, error: "Erreur lors de l'envoi de l'email" }
  }
}

export async function sendBookingConfirmationEmail(
  email: string,
  firstName: string,
  className: string,
  teacherName: string,
  classDate: Date
) {
  const formattedDate = classDate.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
  const formattedTime = classDate.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  })

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `✅ Réservation confirmée – ${className}`,
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
                    
                    <!-- Header bordeaux avec logo -->
                    <tr>
                      <td style="background-color: #42101B; padding: 40px 40px 30px 40px; text-align: center;">
                        <img src="${BASE_URL}/logo-email.png" alt="TEMPO Le Loft" width="220" style="max-width: 220px; height: auto;">
                      </td>
                    </tr>
                    
                    <!-- Contenu principal -->
                    <tr>
                      <td style="padding: 50px 40px;">
                        <div style="text-align: center; margin-bottom: 30px;">
                          <div style="display: inline-block; background-color: #D1FAE5; border-radius: 50%; padding: 15px;">
                            <span style="font-size: 32px;">✓</span>
                          </div>
                        </div>
                        
                        <h2 style="margin: 0 0 20px 0; font-size: 24px; color: #42101B; font-weight: 600; text-align: center;">
                          Réservation confirmée !
                        </h2>
                        
                        <p style="margin: 0 0 25px 0; font-size: 16px; color: #555; line-height: 1.6;">
                          Bonjour ${firstName},
                        </p>
                        
                        <p style="margin: 0 0 25px 0; font-size: 16px; color: #555; line-height: 1.6;">
                          Votre réservation a bien été enregistrée. Nous avons hâte de vous accueillir au studio !
                        </p>
                        
                        <!-- Détails du cours -->
                        <div style="background-color: #F9F8F6; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
                          <h3 style="margin: 0 0 20px 0; font-size: 18px; color: #42101B; font-weight: 600;">
                            📅 Détails de votre cours
                          </h3>
                          <table cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
                                <span style="color: #888; font-size: 14px;">Cours</span><br>
                                <span style="color: #42101B; font-size: 16px; font-weight: 600;">${className}</span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
                                <span style="color: #888; font-size: 14px;">Professeur</span><br>
                                <span style="color: #42101B; font-size: 16px; font-weight: 500;">${teacherName}</span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
                                <span style="color: #888; font-size: 14px;">Date</span><br>
                                <span style="color: #42101B; font-size: 16px; font-weight: 500;">${formattedDate}</span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 10px 0;">
                                <span style="color: #888; font-size: 14px;">Heure</span><br>
                                <span style="color: #42101B; font-size: 16px; font-weight: 500;">${formattedTime}</span>
                              </td>
                            </tr>
                          </table>
                        </div>
                        
                        <!-- Rappel annulation -->
                        <div style="background-color: #FEF3C7; border-radius: 12px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #F59E0B;">
                          <p style="margin: 0; font-size: 14px; color: #92400E;">
                            <strong>⏰ Rappel :</strong> Vous pouvez annuler votre réservation jusqu'à <strong>24 heures avant</strong> le début du cours. Passé ce délai, votre crédit ne pourra pas être remboursé.
                          </p>
                        </div>
                        
                        <!-- Accès au studio -->
                        <div style="background-color: #F9F8F6; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
                          <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #42101B; font-weight: 600;">
                            📍 Accès au studio
                          </h3>
                          <p style="margin: 0 0 10px 0; font-size: 15px; color: #42101B; font-weight: 500;">
                            41 Rue du Temple, 75004 Paris
                          </p>
                          <p style="margin: 0 0 10px 0; font-size: 14px; color: #555;">
                            Sous le porche, 1ère porte en bois à gauche<br>
                            2ème étage – <strong>Code : 7842</strong>
                          </p>
                          <p style="margin: 0; font-size: 14px; color: #888;">
                            Métro Rambuteau (ligne 11)
                          </p>
                          <p style="margin: 15px 0 0 0; font-size: 14px; color: #555;">
                            📞 <a href="tel:0634396579" style="color: #42101B; text-decoration: none;">06 34 39 65 79</a>
                          </p>
                        </div>
                        
                        <!-- Bouton CTA -->
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center" style="padding: 10px 0 20px 0;">
                              <a href="${BASE_URL}/app/reservations" style="display: inline-block; padding: 18px 50px; background-color: #42101B; color: #F2F1ED; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; letter-spacing: 0.5px;">
                                Voir mes réservations
                              </a>
                            </td>
                          </tr>
                        </table>
                        
                        <p style="margin: 0; font-size: 14px; color: #666; line-height: 1.6; text-align: center;">
                          À très bientôt au studio ! 🙏
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
    
    return { success: true }
  } catch (error) {
    console.error("Booking confirmation email error:", error)
    return { success: false, error: "Erreur lors de l'envoi de l'email" }
  }
}

export async function sendGuestConfirmationEmail(
  email: string,
  guestFirstName: string,
  className: string,
  teacherName: string,
  classDate: Date,
  inviterName: string
) {
  const formattedDate = classDate.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
  const formattedTime = classDate.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  })

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `🎉 Vous êtes invité(e) au cours ${className} !`,
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
                    
                    <!-- Header bordeaux avec logo -->
                    <tr>
                      <td style="background-color: #42101B; padding: 40px 40px 30px 40px; text-align: center;">
                        <img src="${BASE_URL}/logo-email.png" alt="TEMPO Le Loft" width="220" style="max-width: 220px; height: auto;">
                      </td>
                    </tr>
                    
                    <!-- Contenu principal -->
                    <tr>
                      <td style="padding: 50px 40px;">
                        <div style="text-align: center; margin-bottom: 30px;">
                          <div style="display: inline-block; background-color: #FEF3C7; border-radius: 50%; padding: 15px;">
                            <span style="font-size: 32px;">🎉</span>
                          </div>
                        </div>
                        
                        <h2 style="margin: 0 0 20px 0; font-size: 24px; color: #42101B; font-weight: 600; text-align: center;">
                          Vous êtes invité(e) !
                        </h2>
                        
                        <p style="margin: 0 0 25px 0; font-size: 16px; color: #555; line-height: 1.6;">
                          Bonjour ${guestFirstName},
                        </p>
                        
                        <p style="margin: 0 0 25px 0; font-size: 16px; color: #555; line-height: 1.6;">
                          <strong style="color: #42101B;">${inviterName}</strong> vous a invité(e) à l'accompagner pour un cours au studio Tempo – Le Loft. Nous avons hâte de vous accueillir !
                        </p>
                        
                        <!-- Détails du cours -->
                        <div style="background-color: #F9F8F6; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
                          <h3 style="margin: 0 0 20px 0; font-size: 18px; color: #42101B; font-weight: 600;">
                            📅 Détails du cours
                          </h3>
                          <table cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
                                <span style="color: #888; font-size: 14px;">Cours</span><br>
                                <span style="color: #42101B; font-size: 16px; font-weight: 600;">${className}</span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
                                <span style="color: #888; font-size: 14px;">Professeur</span><br>
                                <span style="color: #42101B; font-size: 16px; font-weight: 500;">${teacherName}</span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
                                <span style="color: #888; font-size: 14px;">Date</span><br>
                                <span style="color: #42101B; font-size: 16px; font-weight: 500;">${formattedDate}</span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 10px 0;">
                                <span style="color: #888; font-size: 14px;">Heure</span><br>
                                <span style="color: #42101B; font-size: 16px; font-weight: 500;">${formattedTime}</span>
                              </td>
                            </tr>
                          </table>
                        </div>
                        
                        <!-- Accès au studio -->
                        <div style="background-color: #F9F8F6; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
                          <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #42101B; font-weight: 600;">
                            📍 Accès au studio
                          </h3>
                          <p style="margin: 0 0 10px 0; font-size: 15px; color: #42101B; font-weight: 500;">
                            41 Rue du Temple, 75004 Paris
                          </p>
                          <p style="margin: 0 0 10px 0; font-size: 14px; color: #555;">
                            Sous le porche, 1ère porte en bois à gauche<br>
                            2ème étage – <strong>Code : 7842</strong>
                          </p>
                          <p style="margin: 0; font-size: 14px; color: #888;">
                            Métro Rambuteau (ligne 11)
                          </p>
                          <p style="margin: 15px 0 0 0; font-size: 14px; color: #555;">
                            📞 <a href="tel:0634396579" style="color: #42101B; text-decoration: none;">06 34 39 65 79</a>
                          </p>
                        </div>
                        
                        <!-- Info pratique -->
                        <div style="background-color: #E0F2FE; border-radius: 12px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #0EA5E9;">
                          <p style="margin: 0; font-size: 14px; color: #0369A1;">
                            <strong>💡 Bon à savoir :</strong> Nous fournissons tapis et accessoires. Venez simplement avec une tenue confortable !
                          </p>
                        </div>
                        
                        <p style="margin: 0; font-size: 14px; color: #666; line-height: 1.6; text-align: center;">
                          À très bientôt au studio ! 🙏
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
    
    return { success: true }
  } catch (error) {
    console.error("Guest confirmation email error:", error)
    return { success: false, error: "Erreur lors de l'envoi de l'email" }
  }
}

// =============================================================================
// MEMBERSHIP EMAILS
// =============================================================================

export async function sendMembershipWelcomeEmail(
  email: string,
  firstName: string,
  planName: string,
  creditsPerMonth: number,
  startDate: Date,
  commitmentEndDate: Date,
  commitmentMonths: number,
  bonusCredits?: number
) {
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

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `👑 Bienvenue dans le Membership Tempo – ${planName}`,
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
                        
                        ${bonusCredits ? `
                        <!-- Bonus -->
                        <div style="background-color: #D1FAE5; border-radius: 12px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #10B981;">
                          <p style="margin: 0; font-size: 15px; color: #065F46;">
                            <strong>🎁 Bonus de bienvenue :</strong> ${bonusCredits} crédit${bonusCredits > 1 ? 's' : ''} offert${bonusCredits > 1 ? 's' : ''} ajouté${bonusCredits > 1 ? 's' : ''} à votre compte !
                          </p>
                        </div>
                        ` : ''}
                        
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
    
    return { success: true }
  } catch (error) {
    console.error("Membership welcome email error:", error)
    return { success: false, error: "Erreur lors de l'envoi de l'email" }
  }
}

export async function sendMembershipRenewalReminderEmail(
  email: string,
  firstName: string,
  planName: string,
  renewalDate: Date,
  priceCents: number
) {
  const formattedRenewalDate = renewalDate.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
  const price = (priceCents / 100).toFixed(0)

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `⏰ Rappel – Votre abonnement ${planName} se renouvelle dans 2 jours`,
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
    
    return { success: true }
  } catch (error) {
    console.error("Membership renewal reminder email error:", error)
    return { success: false, error: "Erreur lors de l'envoi de l'email" }
  }
}

export async function sendMembershipRenewalConfirmationEmail(
  email: string,
  firstName: string,
  planName: string,
  creditsPerMonth: number,
  newPeriodStart: Date,
  newPeriodEnd: Date
) {
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

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `✅ Abonnement renouvelé – ${creditsPerMonth} crédits ajoutés !`,
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
    
    return { success: true }
  } catch (error) {
    console.error("Membership renewal confirmation email error:", error)
    return { success: false, error: "Erreur lors de l'envoi de l'email" }
  }
}
