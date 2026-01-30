# Configuration de Stripe pour Tempo Le Loft

## 1. Créer un compte Stripe

1. Rendez-vous sur [stripe.com](https://stripe.com) et créez un compte
2. Vous serez en mode **Test** par défaut (ce qui est parfait pour le développement)

## 2. Récupérer vos clés API

1. Dans le Dashboard Stripe, allez dans **Developers > API keys**
2. Copiez les clés suivantes :
   - **Publishable key** (commence par `pk_test_...`)
   - **Secret key** (commence par `sk_test_...`)

## 3. Configurer le Webhook

### En local (développement)

1. Installez le CLI Stripe :
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe

   # ou téléchargez depuis https://stripe.com/docs/stripe-cli
   ```

2. Connectez-vous :
   ```bash
   stripe login
   ```

3. Écoutez les webhooks en local :
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

4. Le CLI affichera un **webhook signing secret** (commence par `whsec_...`)

### En production (Vercel)

1. Dans le Dashboard Stripe, allez dans **Developers > Webhooks**
2. Cliquez sur **Add endpoint**
3. URL : `https://votre-domaine.vercel.app/api/webhooks/stripe`
4. Sélectionnez les événements :
   - `checkout.session.completed`
   - `checkout.session.expired`
5. Cliquez sur **Add endpoint**
6. Copiez le **Signing secret** (dans les détails de l'endpoint)

## 4. Ajouter les variables d'environnement

### En local (.env)

```bash
STRIPE_SECRET_KEY="sk_test_votre_cle_secrete"
STRIPE_PUBLISHABLE_KEY="pk_test_votre_cle_publique"
STRIPE_WEBHOOK_SECRET="whsec_votre_secret_webhook"
```

### Sur Vercel

1. Allez dans **Settings > Environment Variables**
2. Ajoutez les 3 variables ci-dessus
3. N'oubliez pas d'utiliser les clés **live** pour la production :
   - `sk_live_...` au lieu de `sk_test_...`
   - `pk_live_...` au lieu de `pk_test_...`

## 5. Tester les paiements

### Cartes de test Stripe

| Numéro | Comportement |
|--------|-------------|
| `4242 4242 4242 4242` | Paiement réussi |
| `4000 0000 0000 9995` | Paiement refusé |
| `4000 0025 0000 3155` | Requiert authentification 3D Secure |

- **Date d'expiration** : N'importe quelle date future (ex: 12/34)
- **CVC** : N'importe quels 3 chiffres (ex: 123)
- **Code postal** : N'importe quel code (ex: 75001)

## 6. Vérifier que tout fonctionne

1. Connectez-vous en tant que client sur votre app
2. Allez sur **Acheter des cours**
3. Cliquez sur **Acheter** sur un produit
4. Utilisez la carte de test `4242 4242 4242 4242`
5. Après le paiement, vérifiez :
   - ✅ Redirection vers la page avec message de succès
   - ✅ Crédits ajoutés au compte
   - ✅ Achat visible dans l'historique
   - ✅ Événement visible dans le Dashboard Stripe

## 7. Passage en production

Quand vous êtes prêt :

1. Activez votre compte Stripe (KYC, informations bancaires)
2. Basculez en mode **Live** dans le Dashboard
3. Remplacez les clés **test** par les clés **live** dans Vercel
4. Créez un nouveau webhook avec l'URL de production
5. Testez avec un vrai paiement (vous pouvez vous rembourser)

## Dépannage

### Le webhook ne fonctionne pas

```bash
# Vérifiez les logs du webhook
stripe logs tail --filter-path=/api/webhooks/stripe
```

### Erreur "Invalid signature"

- Vérifiez que `STRIPE_WEBHOOK_SECRET` est correct
- En local, assurez-vous que `stripe listen` est lancé

### Les crédits ne sont pas ajoutés

- Vérifiez les logs de votre serveur Next.js
- Vérifiez dans Stripe que l'événement `checkout.session.completed` est envoyé
