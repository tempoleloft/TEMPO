# Tempo – Le Loft

Plateforme de gestion de studio de yoga et pilates avec réservation, paiement et gestion de crédits.

## Stack Technique

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS + shadcn/ui
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth (Auth.js)
- **Paiements**: Stripe
- **Hébergement**: Vercel (front) + Neon/Supabase (DB)

## Installation

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configurer les variables d'environnement

Copiez `.env.example` vers `.env` et remplissez les valeurs :

```bash
cp .env.example .env
```

Variables requises :
- `DATABASE_URL` : URL de connexion PostgreSQL
- `NEXTAUTH_URL` : URL de l'application (ex: http://localhost:3000)
- `NEXTAUTH_SECRET` : Clé secrète pour NextAuth (générez avec `openssl rand -base64 32`)
- `STRIPE_SECRET_KEY` : Clé secrète Stripe
- `STRIPE_PUBLISHABLE_KEY` : Clé publique Stripe
- `STRIPE_WEBHOOK_SECRET` : Secret webhook Stripe

### 3. Initialiser la base de données

```bash
# Générer le client Prisma
npm run db:generate

# Créer les migrations
npm run db:migrate

# (Optionnel) Seed les données de démo
npm run db:seed
```

### 4. Lancer le serveur de développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## Structure du projet

```
├── app/                    # Pages Next.js (App Router)
│   ├── (auth)/            # Routes d'authentification
│   ├── (client)/          # Routes client (/app/*)
│   ├── (teacher)/         # Routes prof (/teacher/*)
│   ├── (admin)/           # Routes admin (/admin/*)
│   └── api/               # API routes
├── components/            # Composants React réutilisables
│   └── ui/               # Composants shadcn/ui
├── lib/                  # Utilitaires et configurations
│   ├── auth.ts          # Configuration NextAuth
│   ├── db.ts            # Client Prisma
│   └── stripe.ts        # Configuration Stripe
├── prisma/              # Schéma et migrations Prisma
│   └── schema.prisma
└── public/             # Assets statiques
```

## Commandes disponibles

- `npm run dev` : Serveur de développement
- `npm run build` : Build de production
- `npm run start` : Serveur de production
- `npm run lint` : Linter ESLint
- `npm run db:generate` : Générer le client Prisma
- `npm run db:push` : Pousser le schéma vers la DB (dev)
- `npm run db:migrate` : Créer une migration
- `npm run db:studio` : Ouvrir Prisma Studio
- `npm run db:seed` : Seed les données de démo

## Rôles utilisateurs

- **CLIENT** : Accès à son profil, réservations, crédits
- **TEACHER** : Accès à son planning et participants
- **ADMIN** : Accès complet (gestion cours, profs, clients, produits)

## Prochaines étapes

1. ✅ Scaffold Next.js + Tailwind + shadcn/ui
2. ⏳ Prisma schema + migrations
3. ⏳ Auth NextAuth + RBAC
4. ⏳ Thème bordeaux/blanc
5. ⏳ Stripe setup
6. ⏳ Planning public
7. ⏳ Booking transactionnel
8. ⏳ Dashboards Client/Teacher/Admin
