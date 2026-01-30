# Configuration Email (Resend)

## 1. Créer un compte Resend

1. Allez sur [resend.com](https://resend.com)
2. Créez un compte gratuit (100 emails/jour)
3. Vérifiez votre email

## 2. Obtenir votre clé API

1. Dans le dashboard Resend, allez dans **API Keys**
2. Cliquez sur **Create API Key**
3. Donnez un nom (ex: "Tempo Production")
4. Copiez la clé (commence par `re_...`)

## 3. Configurer votre domaine (optionnel mais recommandé)

Pour utiliser votre propre domaine (ex: `noreply@tempo-leloft.com`) :

1. Allez dans **Domains**
2. Ajoutez votre domaine `tempo-leloft.com`
3. Ajoutez les enregistrements DNS demandés
4. Attendez la vérification (quelques minutes)

## 4. Mettre à jour votre `.env`

```bash
# Email (Resend)
RESEND_API_KEY="re_VotreCleAPI"
FROM_EMAIL="Tempo Le Loft <onboarding@resend.dev>"
# OU avec votre domaine :
FROM_EMAIL="Tempo Le Loft <noreply@tempo-leloft.com>"
```

## 5. Tester

1. Créez un nouveau compte client
2. Vérifiez votre boîte email (et spams)
3. Cliquez sur le lien de validation

## Emails envoyés

- **Validation de compte** : après inscription
- **Réinitialisation de mot de passe** : depuis "Mot de passe oublié"

## En développement

Pour tester sans envoyer de vrais emails, vous pouvez utiliser le mode "development" de Resend qui affiche les emails dans la console.
