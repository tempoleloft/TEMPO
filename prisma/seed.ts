import { PrismaClient, Role, ProductKind, SessionStatus } from "@prisma/client"
import { hash } from "bcryptjs"
import { addDays, addHours, setHours, setMinutes, startOfWeek } from "date-fns"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // Clean existing data
  await prisma.creditLedger.deleteMany()
  await prisma.reservation.deleteMany()
  await prisma.purchase.deleteMany()
  await prisma.wallet.deleteMany()
  await prisma.session.deleteMany()
  await prisma.classType.deleteMany()
  await prisma.product.deleteMany()
  await prisma.teacherProfile.deleteMany()
  await prisma.clientProfile.deleteMany()
  await prisma.authSession.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()

  console.log("✓ Cleaned existing data")

  // ============================================================================
  // USERS
  // ============================================================================

  const passwordHash = await hash("password123", 12)

  // Admin
  const admin = await prisma.user.create({
    data: {
      email: "admin@tempo-leloft.com",
      passwordHash,
      role: Role.ADMIN,
      emailVerified: new Date(),
      clientProfile: {
        create: {
          firstName: "Admin",
          lastName: "Tempo",
        },
      },
      wallet: {
        create: {
          creditsBalance: 0,
        },
      },
    },
  })
  console.log("✓ Created admin:", admin.email)

  // Teachers
  const teacher1 = await prisma.user.create({
    data: {
      email: "marie@tempo-leloft.com",
      passwordHash,
      role: Role.TEACHER,
      emailVerified: new Date(),
      teacherProfile: {
        create: {
          displayName: "Marie Dupont",
          bio: "Professeure certifiée de Yoga Vinyasa et Hatha depuis 10 ans. Formée en Inde, elle apporte douceur et précision dans chaque cours.",
          photoUrl: "/images/teachers/marie.jpg",
          specialties: ["Yoga Vinyasa", "Yoga Hatha", "Méditation"],
        },
      },
      wallet: {
        create: {
          creditsBalance: 0,
        },
      },
    },
  })

  const teacher2 = await prisma.user.create({
    data: {
      email: "lucas@tempo-leloft.com",
      passwordHash,
      role: Role.TEACHER,
      emailVerified: new Date(),
      teacherProfile: {
        create: {
          displayName: "Lucas Martin",
          bio: "Ancien danseur professionnel, Lucas enseigne le Pilates avec une approche dynamique et musicale. Certifié Stott Pilates.",
          photoUrl: "/images/teachers/lucas.jpg",
          specialties: ["Pilates Mat", "Pilates Reformer", "Barre au Sol"],
        },
      },
      wallet: {
        create: {
          creditsBalance: 0,
        },
      },
    },
  })

  console.log("✓ Created teachers:", teacher1.email, teacher2.email)

  // Clients
  const client1 = await prisma.user.create({
    data: {
      email: "sophie@example.com",
      passwordHash,
      role: Role.CLIENT,
      emailVerified: new Date(),
      clientProfile: {
        create: {
          firstName: "Sophie",
          lastName: "Bernard",
          phone: "06 12 34 56 78",
        },
      },
      wallet: {
        create: {
          creditsBalance: 8,
        },
      },
    },
  })

  const client2 = await prisma.user.create({
    data: {
      email: "thomas@example.com",
      passwordHash,
      role: Role.CLIENT,
      emailVerified: new Date(),
      clientProfile: {
        create: {
          firstName: "Thomas",
          lastName: "Petit",
          phone: "06 98 76 54 32",
        },
      },
      wallet: {
        create: {
          creditsBalance: 3,
        },
      },
    },
  })

  console.log("✓ Created clients:", client1.email, client2.email)

  // ============================================================================
  // CLASS TYPES
  // ============================================================================

  const yogaVinyasa = await prisma.classType.create({
    data: {
      title: "Yoga Vinyasa",
      description:
        "Un flow dynamique qui synchronise mouvement et respiration. Idéal pour se renforcer et s'assouplir.",
      durationMin: 60,
      level: "Tous niveaux",
      colorTag: "#42101B", // Bordeaux
    },
  })

  const yogaHatha = await prisma.classType.create({
    data: {
      title: "Yoga Hatha",
      description:
        "Une pratique plus douce et posée, parfaite pour les débutants ou pour une session de récupération.",
      durationMin: 75,
      level: "Débutant",
      colorTag: "#DACBB6", // Taupe
    },
  })

  const pilatesMat = await prisma.classType.create({
    data: {
      title: "Pilates Mat",
      description:
        "Renforcement profond du centre du corps sur tapis. Travail précis et contrôlé.",
      durationMin: 55,
      level: "Tous niveaux",
      colorTag: "#120F0F", // Noir
    },
  })

  const pilatesReformer = await prisma.classType.create({
    data: {
      title: "Pilates Reformer",
      description:
        "Cours sur machine Reformer pour un travail encore plus ciblé et intense. Places limitées.",
      durationMin: 50,
      level: "Intermédiaire",
      colorTag: "#42101B", // Bordeaux
    },
  })

  console.log("✓ Created class types")

  // ============================================================================
  // PRODUCTS
  // ============================================================================

  await prisma.product.createMany({
    data: [
      {
        name: "Cours à l'unité",
        description: "Un seul cours, valable 30 jours",
        kind: ProductKind.SINGLE,
        credits: 1,
        priceCents: 2500, // 25€
        validityDays: 30,
        sortOrder: 1,
      },
      {
        name: "Carte 5 cours",
        description: "5 cours à utiliser en 3 mois",
        kind: ProductKind.PACK,
        credits: 5,
        priceCents: 11000, // 110€ (22€/cours)
        validityDays: 90,
        sortOrder: 2,
      },
      {
        name: "Carte 10 cours",
        description: "10 cours à utiliser en 6 mois – notre meilleure offre",
        kind: ProductKind.PACK,
        credits: 10,
        priceCents: 19000, // 190€ (19€/cours)
        validityDays: 180,
        sortOrder: 3,
      },
    ],
  })

  console.log("✓ Created products")

  // ============================================================================
  // SESSIONS (Planning for the coming week)
  // ============================================================================

  const teacherProfile1 = await prisma.teacherProfile.findUnique({
    where: { userId: teacher1.id },
  })
  const teacherProfile2 = await prisma.teacherProfile.findUnique({
    where: { userId: teacher2.id },
  })

  if (!teacherProfile1 || !teacherProfile2) {
    throw new Error("Teacher profiles not found")
  }

  // Get the start of next week
  const weekStart = startOfWeek(addDays(new Date(), 7), { weekStartsOn: 1 })

  // Helper to create session time
  const sessionTime = (dayOffset: number, hour: number, minute: number = 0) => {
    const date = addDays(weekStart, dayOffset)
    return setMinutes(setHours(date, hour), minute)
  }

  const sessions = [
    // Monday
    {
      classTypeId: yogaVinyasa.id,
      teacherId: teacherProfile1.id,
      startAt: sessionTime(0, 7, 30),
      capacity: 12,
      location: "Salle principale",
    },
    {
      classTypeId: pilatesMat.id,
      teacherId: teacherProfile2.id,
      startAt: sessionTime(0, 12, 15),
      capacity: 10,
      location: "Salle principale",
    },
    {
      classTypeId: yogaHatha.id,
      teacherId: teacherProfile1.id,
      startAt: sessionTime(0, 18, 30),
      capacity: 12,
      location: "Salle principale",
    },
    // Tuesday
    {
      classTypeId: pilatesReformer.id,
      teacherId: teacherProfile2.id,
      startAt: sessionTime(1, 8, 0),
      capacity: 6,
      location: "Studio Reformer",
    },
    {
      classTypeId: yogaVinyasa.id,
      teacherId: teacherProfile1.id,
      startAt: sessionTime(1, 19, 0),
      capacity: 12,
      location: "Salle principale",
    },
    // Wednesday
    {
      classTypeId: pilatesMat.id,
      teacherId: teacherProfile2.id,
      startAt: sessionTime(2, 7, 30),
      capacity: 10,
      location: "Salle principale",
    },
    {
      classTypeId: yogaHatha.id,
      teacherId: teacherProfile1.id,
      startAt: sessionTime(2, 12, 30),
      capacity: 12,
      location: "Salle principale",
    },
    // Thursday
    {
      classTypeId: pilatesReformer.id,
      teacherId: teacherProfile2.id,
      startAt: sessionTime(3, 8, 0),
      capacity: 6,
      location: "Studio Reformer",
    },
    {
      classTypeId: yogaVinyasa.id,
      teacherId: teacherProfile1.id,
      startAt: sessionTime(3, 18, 30),
      capacity: 12,
      location: "Salle principale",
    },
    // Friday
    {
      classTypeId: pilatesMat.id,
      teacherId: teacherProfile2.id,
      startAt: sessionTime(4, 12, 15),
      capacity: 10,
      location: "Salle principale",
    },
    // Saturday
    {
      classTypeId: yogaVinyasa.id,
      teacherId: teacherProfile1.id,
      startAt: sessionTime(5, 10, 0),
      capacity: 14,
      location: "Salle principale",
    },
    {
      classTypeId: pilatesReformer.id,
      teacherId: teacherProfile2.id,
      startAt: sessionTime(5, 11, 30),
      capacity: 6,
      location: "Studio Reformer",
    },
  ]

  for (const sessionData of sessions) {
    const classType = await prisma.classType.findUnique({
      where: { id: sessionData.classTypeId },
    })

    await prisma.session.create({
      data: {
        ...sessionData,
        endAt: addHours(sessionData.startAt, (classType?.durationMin || 60) / 60),
        status: SessionStatus.SCHEDULED,
        createdById: admin.id,
      },
    })
  }

  console.log("✓ Created", sessions.length, "sessions")

  // ============================================================================
  // SAMPLE PURCHASES & CREDITS
  // ============================================================================

  const pack10 = await prisma.product.findFirst({
    where: { credits: 10 },
  })

  if (pack10) {
    const purchase1 = await prisma.purchase.create({
      data: {
        userId: client1.id,
        productId: pack10.id,
        amountCents: pack10.priceCents,
        status: "PAID",
        creditsGranted: 10,
        expiresAt: addDays(new Date(), 180),
      },
    })

    await prisma.creditLedger.create({
      data: {
        userId: client1.id,
        delta: 10,
        reason: "PURCHASE",
        refType: "Purchase",
        refId: purchase1.id,
        notes: "Achat Carte 10 cours",
      },
    })
  }

  const pack5 = await prisma.product.findFirst({
    where: { credits: 5 },
  })

  if (pack5) {
    const purchase2 = await prisma.purchase.create({
      data: {
        userId: client2.id,
        productId: pack5.id,
        amountCents: pack5.priceCents,
        status: "PAID",
        creditsGranted: 5,
        expiresAt: addDays(new Date(), 90),
      },
    })

    await prisma.creditLedger.create({
      data: {
        userId: client2.id,
        delta: 5,
        reason: "PURCHASE",
        refType: "Purchase",
        refId: purchase2.id,
        notes: "Achat Carte 5 cours",
      },
    })
  }

  console.log("✓ Created sample purchases")

  console.log("")
  console.log("🎉 Seed completed!")
  console.log("")
  console.log("Test accounts:")
  console.log("  Admin:   admin@tempo-leloft.com / password123")
  console.log("  Teacher: marie@tempo-leloft.com / password123")
  console.log("  Teacher: lucas@tempo-leloft.com / password123")
  console.log("  Client:  sophie@example.com / password123")
  console.log("  Client:  thomas@example.com / password123")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
