import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Validation du format de date YYYY-MM-DD
function isValidDate(dateStr: string): boolean {
  if (!dateStr || typeof dateStr !== "string") return false;

  // Vérifier format YYYY-MM-DD avec mois valide (01-12)
  const regex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
  if (!regex.test(dateStr)) return false;

  // Vérifier que c'est une date réelle (pas de 31 février, etc.)
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date.getTime());
}

// Validation du format d'heure HH:mm
function isValidTime(timeStr: string): boolean {
  if (!timeStr || typeof timeStr !== "string") return false;

  const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return regex.test(timeStr);
}

// Vérification du token Zapier
function verifyToken(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return false;

  const token = authHeader.substring(7);
  const expectedToken = process.env.ZAPIER_API_TOKEN?.trim();

  return token === expectedToken;
}

export async function POST(request: NextRequest) {
  try {
    // Vérification authentification
    if (!verifyToken(request)) {
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    }

    const body = await request.json();
    const {
      sessionDate,
      sessionTime,
      firstName,
      lastName,
      email,
      phone,
      source,
      numeroReservation,
      classType,
    } = body;

    // === VALIDATION DES CHAMPS REQUIS ===
    if (!sessionDate || !sessionTime || !firstName || !lastName || !source) {
      return NextResponse.json(
        {
          error: "Champs manquants",
          details:
            "sessionDate, sessionTime, firstName, lastName et source sont requis",
          received: { sessionDate, sessionTime, firstName, lastName, source },
        },
        { status: 400 }
      );
    }

    // === VALIDATION FORMAT DATE ===
    if (!isValidDate(sessionDate)) {
      return NextResponse.json(
        {
          error: "Format de date invalide",
          details: `sessionDate doit être au format YYYY-MM-DD avec un mois valide (01-12). Reçu: "${sessionDate}"`,
          hint: "Vérifiez le script Zapier qui génère la date - le mois est peut-être 'undefined'",
        },
        { status: 400 }
      );
    }

    // === VALIDATION FORMAT HEURE ===
    if (!isValidTime(sessionTime)) {
      return NextResponse.json(
        {
          error: "Format d'heure invalide",
          details: `sessionTime doit être au format HH:mm (ex: 09:30, 14:00). Reçu: "${sessionTime}"`,
        },
        { status: 400 }
      );
    }

    // Normaliser la source en majuscules
    const normalizedSource = source.toUpperCase();

    // === IDEMPOTENCE : Vérifier si participant existe déjà ===
    if (numeroReservation) {
      const existingByReservation = await db.walkInParticipant.findFirst({
        where: {
          source: normalizedSource as any,
          numeroReservation: numeroReservation,
        },
        include: {
          session: {
            include: {
              classType: true,
            },
          },
        },
      });

      if (existingByReservation) {
        return NextResponse.json({
          success: true,
          message: "Participant déjà enregistré (idempotent)",
          data: {
            participantId: existingByReservation.id,
            sessionId: existingByReservation.sessionId,
            sessionName: existingByReservation.session.classType?.name,
            sessionDate: existingByReservation.session.startAt,
            participant: `${existingByReservation.firstName} ${existingByReservation.lastName}`,
            source: existingByReservation.source,
            numeroReservation: existingByReservation.numeroReservation,
            alreadyExisted: true,
          },
        });
      }
    }

    // === TROUVER LA SESSION par date + heure ===
    const searchDate = new Date(sessionDate);
    const startOfDay = new Date(searchDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(searchDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const sessions = await db.session.findMany({
      where: {
        startAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        classType: true,
        reservations: {
          where: { status: "BOOKED" },
          include: { guestReservations: true },
        },
        walkInParticipants: true,
      },
    });

    // Filtrer par heure exacte
    const [hours, minutes] = sessionTime.split(":").map(Number);
    const session = sessions.find((s) => {
      const sessionDateTime = new Date(s.startAt);
      return (
        sessionDateTime.getUTCHours() === hours &&
        sessionDateTime.getUTCMinutes() === minutes
      );
    });

    if (!session) {
      console.log(
        `Zapier: Session non trouvée - ${sessionDate} à ${sessionTime} (classType ignoré: ${classType})`
      );
      return NextResponse.json(
        {
          error: "Cours non trouvé",
          details: `Aucune session trouvée le ${sessionDate} à ${sessionTime}`,
          availableSessions: sessions.map((s) => ({
            time: new Date(s.startAt).toISOString(),
            name: s.classType?.name,
          })),
        },
        { status: 404 }
      );
    }

    // === VÉRIFIER CAPACITÉ ===
    const guestCount = session.reservations.reduce(
      (acc, r) => acc + (r.guestReservations?.length || 0),
      0
    );
    const totalBooked =
      session.reservations.length +
      guestCount +
      session.walkInParticipants.filter((w) => w.status !== "CANCELLED").length;

    if (totalBooked >= session.capacity) {
      return NextResponse.json(
        {
          error: "Cours complet",
          details: `Le cours est complet (${totalBooked}/${session.capacity} places)`,
        },
        { status: 409 }
      );
    }

    // === CRÉER LE PARTICIPANT ===
    const walkIn = await db.walkInParticipant.create({
      data: {
        sessionId: session.id,
        firstName,
        lastName,
        email: email || null,
        phone: phone || null,
        source: normalizedSource as any,
        numeroReservation: numeroReservation || null,
        status: "BOOKED",
      },
    });

    console.log(
      `Zapier: Participant ajouté - ${firstName} ${lastName} pour ${session.classType?.name} le ${sessionDate} à ${sessionTime}`
    );

    return NextResponse.json({
      success: true,
      message: "Participant ajouté avec succès",
      data: {
        participantId: walkIn.id,
        sessionId: session.id,
        sessionName: session.classType?.name,
        sessionDate: session.startAt,
        participant: `${firstName} ${lastName}`,
        source: normalizedSource,
        numeroReservation: numeroReservation || null,
        spotsRemaining: session.capacity - totalBooked - 1,
      },
    });
  } catch (error: any) {
    console.error("Zapier add-participant error:", error);

    // Gestion spécifique des erreurs Prisma
    if (error.code === "P2002") {
      return NextResponse.json(
        {
          error: "Conflit",
          details: "Un participant avec ces informations existe déjà",
        },
        { status: 409 }
      );
    }

    if (error.name === "PrismaClientValidationError") {
      return NextResponse.json(
        { error: "Données invalides", details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erreur serveur", details: error.message },
      { status: 500 }
    );
  }
}

// GET pour lister les sessions disponibles
export async function GET(request: NextRequest) {
  if (!verifyToken(request)) {
    return NextResponse.json({ error: "Token invalide" }, { status: 401 });
  }

  const sessions = await db.session.findMany({
    where: {
      startAt: { gte: new Date() },
    },
    include: {
      classType: true,
      reservations: {
        where: { status: "BOOKED" },
        include: { guestReservations: true },
      },
      walkInParticipants: true,
    },
    orderBy: { startAt: "asc" },
    take: 50,
  });

  return NextResponse.json({
    success: true,
    sessions: sessions.map((s) => {
      const guestCount = s.reservations.reduce(
        (acc, r) => acc + (r.guestReservations?.length || 0),
        0
      );
      const booked =
        s.reservations.length +
        guestCount +
        s.walkInParticipants.filter((w) => w.status !== "CANCELLED").length;
      return {
        sessionId: s.id,
        classType: s.classType?.name,
        date: s.startAt.toISOString().split("T")[0],
        time: s.startAt.toISOString().split("T")[1].substring(0, 5),
        dateTime: s.startAt.toISOString(),
        capacity: s.capacity,
        booked,
        spotsRemaining: s.capacity - booked,
      };
    }),
  });
}
