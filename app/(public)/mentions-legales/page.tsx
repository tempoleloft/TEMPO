export default function MentionsLegalesPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-tempo-bordeaux text-tempo-creme py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">Mentions légales</h1>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto prose prose-lg">
          
          <h2 className="text-2xl font-bold text-tempo-bordeaux mb-4">Éditeur du site</h2>
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <p className="text-muted-foreground mb-2">
              <strong>Raison sociale :</strong> [À compléter]
            </p>
            <p className="text-muted-foreground mb-2">
              <strong>Forme juridique :</strong> [À compléter]
            </p>
            <p className="text-muted-foreground mb-2">
              <strong>Capital social :</strong> [À compléter]
            </p>
            <p className="text-muted-foreground mb-2">
              <strong>Siège social :</strong> 41 Rue du Temple, 75004 Paris
            </p>
            <p className="text-muted-foreground mb-2">
              <strong>SIRET :</strong> [À compléter]
            </p>
            <p className="text-muted-foreground mb-2">
              <strong>RCS :</strong> [À compléter]
            </p>
            <p className="text-muted-foreground mb-2">
              <strong>Numéro de TVA :</strong> [À compléter]
            </p>
            <p className="text-muted-foreground mb-2">
              <strong>Directeur de la publication :</strong> [À compléter]
            </p>
            <p className="text-muted-foreground mb-2">
              <strong>Email :</strong> contact@tempoleloft.com
            </p>
            <p className="text-muted-foreground">
              <strong>Téléphone :</strong> 06 34 39 65 79
            </p>
          </div>

          <h2 className="text-2xl font-bold text-tempo-bordeaux mb-4">Hébergement</h2>
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <p className="text-muted-foreground mb-2">
              <strong>Hébergeur :</strong> Vercel Inc.
            </p>
            <p className="text-muted-foreground mb-2">
              <strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, USA
            </p>
            <p className="text-muted-foreground">
              <strong>Site web :</strong> https://vercel.com
            </p>
          </div>

          <h2 className="text-2xl font-bold text-tempo-bordeaux mb-4">Propriété intellectuelle</h2>
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <p className="text-muted-foreground">
              L'ensemble du contenu de ce site (textes, images, vidéos, logos, icônes, sons, logiciels, etc.) est la propriété exclusive de Tempo – Le Loft ou de ses partenaires. Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-tempo-bordeaux mb-4">Protection des données personnelles</h2>
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <p className="text-muted-foreground mb-4">
              Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, vous disposez d'un droit d'accès, de rectification, de suppression et d'opposition aux données personnelles vous concernant.
            </p>
            <p className="text-muted-foreground mb-4">
              Les données collectées sur ce site sont utilisées uniquement pour :
            </p>
            <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1">
              <li>La gestion de votre compte client</li>
              <li>La réservation et le suivi de vos cours</li>
              <li>L'envoi d'informations relatives à nos services</li>
              <li>Le traitement de vos paiements</li>
            </ul>
            <p className="text-muted-foreground">
              Pour exercer vos droits ou pour toute question relative à vos données personnelles, contactez-nous à : contact@tempoleloft.com
            </p>
          </div>

          <h2 className="text-2xl font-bold text-tempo-bordeaux mb-4">Cookies</h2>
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <p className="text-muted-foreground">
              Ce site utilise des cookies nécessaires à son bon fonctionnement. Ces cookies permettent de mémoriser vos préférences et d'assurer la sécurité de votre connexion. En poursuivant votre navigation sur ce site, vous acceptez l'utilisation de ces cookies.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-tempo-bordeaux mb-4">Conditions générales de vente</h2>
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <h3 className="font-semibold text-tempo-noir mb-2">Crédits et packs</h3>
            <p className="text-muted-foreground mb-4">
              Les crédits achetés sont personnels et non remboursables. Ils sont valables pour la durée indiquée lors de l'achat. Les crédits non utilisés à l'expiration sont perdus.
            </p>
            
            <h3 className="font-semibold text-tempo-noir mb-2">Réservation et annulation de cours</h3>
            <p className="text-muted-foreground mb-4">
              Les réservations peuvent être annulées gratuitement jusqu'à 24 heures avant le début du cours. Passé ce délai, le crédit est définitivement déduit.
            </p>
            
            <h3 className="font-semibold text-tempo-noir mb-2">Règlement intérieur</h3>
            <p className="text-muted-foreground">
              En réservant un cours, vous acceptez de respecter le règlement intérieur du studio, notamment en arrivant à l'heure et en respectant les consignes des professeurs.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-tempo-bordeaux mb-4">Conditions des abonnements (Membership)</h2>
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <h3 className="font-semibold text-tempo-noir mb-2">Engagement et paiement</h3>
            <p className="text-muted-foreground mb-4">
              Tout abonnement souscrit constitue un engagement ferme et définitif pour la durée choisie. Le paiement s'effectue par prélèvement automatique mensuel à la date anniversaire de la souscription. <strong>Aucun remboursement, aucun report ni aucune suspension de l'abonnement ne sera accordé</strong>, quelle qu'en soit la raison (absence, maladie, déménagement, etc.).
            </p>

            <h3 className="font-semibold text-tempo-noir mb-2">Types d'abonnement</h3>
            <p className="text-muted-foreground mb-4">
              <strong>Abonnement à renouvellement automatique :</strong> À la fin de la période d'engagement, l'abonnement est automatiquement reconduit pour une nouvelle période identique, sauf annulation par le client. L'annulation doit être effectuée <strong>avant la date de renouvellement</strong> depuis l'espace client. Toute demande d'annulation effectuée après la date de renouvellement ne pourra être prise en compte et l'abonnement sera dû dans son intégralité.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Abonnement à durée fixe :</strong> L'abonnement prend fin automatiquement à l'issue de la période souscrite, sans renouvellement. Aucune annulation anticipée n'est possible.
            </p>

            <h3 className="font-semibold text-tempo-noir mb-2">Crédits d'abonnement</h3>
            <p className="text-muted-foreground mb-4">
              Les crédits sont attribués mensuellement à chaque prélèvement. Ils sont valables jusqu'à la fin de l'abonnement, avec un délai de grâce d'un mois supplémentaire pour les utiliser. <strong>Les crédits non utilisés à l'expiration de ce délai sont définitivement perdus</strong> et ne peuvent donner lieu à aucun remboursement ni compensation.
            </p>

            <h3 className="font-semibold text-tempo-noir mb-2">Annulation de l'abonnement</h3>
            <p className="text-muted-foreground mb-4">
              Pour les abonnements à renouvellement automatique, l'annulation doit être effectuée par le client depuis son espace personnel sur le site, avant la date de renouvellement. L'annulation prend effet à la fin de la période en cours. <strong>Aucun remboursement au prorata ne sera effectué.</strong>
            </p>

            <h3 className="font-semibold text-tempo-noir mb-2">Modification des tarifs</h3>
            <p className="text-muted-foreground">
              Tempo – Le Loft se réserve le droit de modifier ses tarifs à tout moment. Les nouveaux tarifs s'appliqueront aux nouveaux abonnements et aux renouvellements. Le client sera informé par email de toute modification tarifaire au moins 30 jours avant son application.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-tempo-bordeaux mb-4">Limitation de responsabilité</h2>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p className="text-muted-foreground">
              Tempo – Le Loft s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur ce site. Toutefois, Tempo – Le Loft ne peut garantir l'exactitude, la précision ou l'exhaustivité des informations mises à disposition sur ce site.
            </p>
          </div>

        </div>
      </section>
    </div>
  )
}
