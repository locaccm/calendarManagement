import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Création d'un usager de test
  const user = await prisma.user.upsert({
    where: { USEN_ID: 1 },
    update: {},
    create: {
      USEN_ID: 1,
      USEC_URLPP: 'https://example.com/photo.jpg',
      USEC_LNAME: 'Testeur',
      // Ajoute les autres champs obligatoires si besoin
      // Exemples à compléter selon ton schéma :
      // USEC_FNAME: 'Jean',
      // USEC_EMAIL: 'testeur@example.com',
      // USEC_PASSWORD: 'hashedpassword',
    },
  });

  // Création d'un logement de test
  const accommodation = await prisma.accommodation.upsert({
    where: { ACCN_ID: 1 },
    update: {},
    create: {
      ACCN_ID: 1,
      ACCC_NAME: 'Appartement témoin',
      // Ajoute les autres champs obligatoires si besoin
      // Exemples à compléter selon ton schéma :
      // ACCC_ADDRESS: '123 rue de Paris',
      // ACCC_CITY: 'Paris',
    },
  });

  // Création d'un événement de test
  await prisma.event.create({
    data: {
      EVEC_LIB: 'Réunion annuelle',
      EVED_START: new Date('2025-06-01T09:00:00Z'),
      EVED_END: new Date('2025-06-01T11:00:00Z'),
      USEN_ID: user.USEN_ID,
      ACCN_ID: accommodation.ACCN_ID,
      // Ajoute les autres champs obligatoires si besoin
    },
  });
  console.log('Seed terminé : usager, logement, événement créés');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
