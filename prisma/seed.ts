import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Create a test user
  const user = await prisma.user.upsert({
    where: { USEN_ID: 1 },
    update: {},
    create: {
      USEN_ID: 1,
      USEC_URLPP: 'https://example.com/photo.jpg',
      USEC_LNAME: 'Testeur',
      // Ajoute les autres champs obligatoires si besoin
      // Examples to complete according to your schema:
      // USEC_FNAME: 'Jean',
      // USEC_EMAIL: 'testeur@example.com',
      // USEC_PASSWORD: 'hashedpassword',
    },
  });

  // Create a test accommodation
  const accommodation = await prisma.accommodation.upsert({
    where: { ACCN_ID: 1 },
    update: {},
    create: {
      ACCN_ID: 1,
      ACCC_NAME: 'Model apartment',
      // Ajoute les autres champs obligatoires si besoin
      // Examples to complete according to your schema:
      // ACCC_ADDRESS: '123 rue de Paris',
      // ACCC_CITY: 'Paris',
    },
  });

  // Create a test event
  await prisma.event.create({
    data: {
      EVEC_LIB: 'Annual meeting',
      EVED_START: new Date('2025-06-01T09:00:00Z'),
      EVED_END: new Date('2025-06-01T11:00:00Z'),
      USEN_ID: user.USEN_ID,
      ACCN_ID: accommodation.ACCN_ID,
      // Ajoute les autres champs obligatoires si besoin
    },
  });
  console.log('Seed completed: user, accommodation, event created');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
