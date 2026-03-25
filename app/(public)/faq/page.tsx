import { Button } from "@/components/ui/button"
import Link from "next/link"

const faqs = [
  {
    question: "Puis-je utiliser mes crédits pour tous les cours ?",
    answer: "Oui, vos crédits sont valables pour tous nos cours proposés au studio."
  },
  {
    question: "Comment fonctionne l'annulation ?",
    answer: "Vous pouvez annuler gratuitement jusqu'à 24h avant le cours. Votre crédit vous sera automatiquement restitué."
  },
  {
    question: "Que se passe-t-il si ma carte expire ?",
    answer: "Les crédits non utilisés à l'expiration de votre carte sont perdus. Pensez à les utiliser avant la date d'expiration indiquée dans votre espace."
  },
  {
    question: "Proposez-vous un cours d'essai ?",
    answer: "Votre premier cours à l'unité fait office de cours découverte. Profitez-en pour tester notre studio avant de vous engager."
  },
  {
    question: "Dois-je apporter mon propre tapis ?",
    answer: "Non, nous fournissons tous les équipements nécessaires : tapis, briques, sangles, coussins et couvertures. Vous n'avez qu'à venir avec une tenue confortable."
  },
  {
    question: "Quel niveau faut-il pour participer aux cours ?",
    answer: "Nos cours sont accessibles à tous les niveaux. Les professeurs adaptent les postures et proposent des variations selon votre niveau. N'hésitez pas à les informer si c'est votre première fois."
  },
  {
    question: "Y a-t-il des vestiaires ?",
    answer: "Oui, nous disposons de vestiaires avec des casiers sécurisés pour ranger vos affaires pendant le cours."
  },
  {
    question: "Comment réserver un cours ?",
    answer: "Créez votre compte sur notre site, achetez des crédits, puis réservez directement depuis le planning en ligne. Vous recevrez une confirmation par email."
  },
  {
    question: "Combien de temps à l'avance puis-je réserver ?",
    answer: "Vous pouvez réserver jusqu'à 2 semaines à l'avance, selon la disponibilité des cours."
  },
  {
    question: "Comment accéder au studio ?",
    answer: "Le studio se situe au 41 Rue du Temple, 75004 Paris. Passez sous le porche, prenez la 1ère porte en bois à gauche, puis montez au 2ème étage."
  }
]

export default function FAQPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-tempo-bordeaux text-tempo-creme py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">Questions fréquentes</h1>
          <p className="text-xl opacity-80 max-w-2xl mx-auto">
            Retrouvez les réponses aux questions les plus courantes.
          </p>
        </div>
      </section>

      {/* FAQ List */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-tempo-bordeaux mb-2">
                  {faq.question}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 px-6 bg-tempo-taupe/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-tempo-bordeaux mb-6">
            Vous n'avez pas trouvé votre réponse ?
          </h2>
          <p className="text-muted-foreground mb-8">
            Contactez-nous directement, nous serons ravis de vous aider.
          </p>
          <Button asChild size="lg" className="bg-tempo-bordeaux text-tempo-creme hover:bg-tempo-noir">
            <Link href="/contact">Nous contacter</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
