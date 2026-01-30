import { db } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function ProfsPage() {
  const teachers = await db.teacherProfile.findMany({
    include: {
      user: true,
    },
    orderBy: { displayName: "asc" },
  })

  return (
    <div>
      {/* Hero */}
      <section className="bg-tempo-bordeaux text-tempo-creme py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">
            Nos Professeurs
          </h1>
          <p className="text-xl opacity-80 max-w-2xl mx-auto">
            Une équipe passionnée et certifiée, dédiée à vous accompagner 
            dans votre pratique avec bienveillance et expertise.
          </p>
        </div>
      </section>

      {/* Teachers Grid */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {teachers.map((teacher) => (
              <Card key={teacher.id} className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/3 bg-tempo-taupe/30 aspect-square md:aspect-auto flex items-center justify-center">
                    {teacher.photoUrl ? (
                      <img 
                        src={teacher.photoUrl} 
                        alt={teacher.displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl font-bold text-tempo-bordeaux/20">
                        {teacher.displayName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="md:w-2/3">
                    <CardHeader>
                      <CardTitle className="text-tempo-bordeaux">
                        {teacher.displayName}
                      </CardTitle>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {teacher.specialties.map((specialty) => (
                          <Badge key={specialty} variant="secondary">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {teacher.bio || "Professeur certifié au studio Tempo – Le Loft."}
                      </p>
                    </CardContent>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {teachers.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>Aucun professeur à afficher pour le moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-tempo-taupe/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-tempo-bordeaux mb-6">
            Prêt à pratiquer avec nous ?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Découvrez notre planning et choisissez le cours qui vous correspond.
          </p>
          <Button asChild size="lg" className="bg-tempo-bordeaux hover:bg-tempo-noir">
            <Link href="/planning">Voir le planning</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
