# Configuration OAuth (Google & Apple)

## Google OAuth

### Étape 1 : Créer un projet Google Cloud

1. Allez sur [console.cloud.google.com](https://console.cloud.google.com)
2. Créez un nouveau projet ou sélectionnez un existant
3. Activez **Google+ API** ou **Google Identity Services**

### Étape 2 : Configurer l'écran de consentement OAuth

1. Dans le menu, allez dans **APIs & Services > OAuth consent screen**
2. Choisissez **External** (pour tous les utilisateurs Google)
3. Remplissez les informations :
   - **App name** : Tempo Le Loft
   - **User support email** : contact@tempoleloft.com
   - **Developer contact** : contact@tempoleloft.com
4. Ajoutez les scopes : `email`, `profile`, `openid`
5. Cliquez **Save and Continue**

### Étape 3 : Créer les credentials OAuth

1. Allez dans **APIs & Services > Credentials**
2. Cliquez **+ Create Credentials > OAuth client ID**
3. Type : **Web application**
4. Nom : `Tempo Le Loft Web`
5. **Authorized JavaScript origins** :
   - `http://localhost:3000` (dev)
   - `https://tempoleloft.com` (prod)
6. **Authorized redirect URIs** :
   - `http://localhost:3000/api/auth/callback/google` (dev)
   - `https://tempoleloft.com/api/auth/callback/google` (prod)
7. Cliquez **Create**
8. Copiez le **Client ID** et **Client Secret**

### Étape 4 : Ajouter au .env

```bash
GOOGLE_CLIENT_ID="123456789-xxxxxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxxxxxxxxxxxxxx"
```

---

## Apple OAuth (Optionnel)

> ⚠️ Nécessite un compte Apple Developer payant (99€/an)

### Étape 1 : Créer un App ID

1. Allez sur [developer.apple.com](https://developer.apple.com)
2. **Certificates, Identifiers & Profiles > Identifiers**
3. Créez un nouvel **App ID**
4. Activez **Sign in with Apple**

### Étape 2 : Créer un Service ID

1. **Identifiers > + > Services IDs**
2. Nom : `Tempo Le Loft`
3. Identifier : `com.tempoleloft.signin`
4. Activez **Sign in with Apple**
5. Configurez :
   - **Domains** : `tempoleloft.com`
   - **Return URLs** : `https://tempoleloft.com/api/auth/callback/apple`

### Étape 3 : Créer une Key

1. **Keys > + > Create a Key**
2. Nom : `Tempo Sign in with Apple`
3. Activez **Sign in with Apple**
4. Téléchargez le fichier `.p8`

### Étape 4 : Générer le Client Secret

Apple utilise un JWT comme client secret. Vous devrez le générer avec le fichier `.p8`.

```bash
# Utilisez un outil comme apple-signin-auth
npm install apple-signin-auth
```

### Étape 5 : Ajouter au .env

```bash
APPLE_CLIENT_ID="com.tempoleloft.signin"
APPLE_CLIENT_SECRET="eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Notes importantes

### Informations récupérées automatiquement

| Provider | Email | Prénom | Nom | Photo |
|----------|-------|--------|-----|-------|
| Google | ✅ | ✅ | ✅ | ✅ |
| Apple | ✅ | ✅* | ✅* | ❌ |

*Apple ne fournit le nom que lors de la première connexion

### Téléphone

Le numéro de téléphone n'est **jamais** fourni par Google ou Apple. L'utilisateur sera invité à le renseigner après sa première connexion OAuth.

### Sécurité

- Ne jamais exposer les `CLIENT_SECRET` côté client
- Utiliser des `redirect URIs` exactes (pas de wildcards)
- Vérifier les domaines autorisés

---

## Test en local

Pour tester Google OAuth en local :

1. Configurez les credentials avec `http://localhost:3000`
2. Ajoutez votre compte Google comme **Test user** dans l'écran de consentement
3. Redémarrez le serveur après avoir ajouté les variables d'environnement

Pour Apple, le test local est plus complexe car Apple nécessite HTTPS.
