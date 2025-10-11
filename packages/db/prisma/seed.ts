import { connectDatabase, disconnectDatabase, prisma } from '../';
import { PartnerType, ProductType, LLMModel } from '../generated/prisma';

async function main() {
  console.log('🌱 Starting database seeding...');

  await connectDatabase();

  try {
    await prisma.evaluation.deleteMany();
    await prisma.objective.deleteMany();
    await prisma.product.deleteMany();
    await prisma.partner.deleteMany();
    console.log('🧹 Cleaned existing data');
  } catch (error) {
    console.log('⚠️ Skipping cleanup (collections may not exist yet)');
  }

  const remarkable = await prisma.partner.create({
    data: {
      name: 'Remarkable',
      description:
        'Premium digital paper tablet for note-taking and document annotation',
      partnerType: PartnerType.TECH,
      website: 'https://remarkable.com',
      addressLine1: 'Olav Vs gate 7',
      city: 'Oslo',
      country: 'Norway',
      postalCode: '0161',
      industry: 'Consumer Electronics',
      isActive: true,
    },
  });

  const vabaliSpa = await prisma.partner.create({
    data: {
      name: 'Vabali Spa',
      description: 'Premium wellness and spa experience in the heart of Berlin',
      partnerType: PartnerType.SERVICE,
      website: 'https://vabali.de',
      addressLine1: 'Seydlitzstraße 6',
      city: 'Berlin',
      country: 'Germany',
      postalCode: '10557',
      industry: 'Wellness & Spa',
      isActive: true,
    },
  });

  const friedrichsbad = await prisma.partner.create({
    data: {
      name: 'Friedrichsbad Spa',
      description:
        'Historic Roman-Irish bathhouse with over 145 years of bathing tradition in Baden-Baden',
      partnerType: PartnerType.SERVICE,
      website: 'https://friedrichsbad.eu',
      addressLine1: 'Römerplatz 1',
      city: 'Baden-Baden',
      country: 'Germany',
      postalCode: '76530',
      industry: 'Historic Spa & Wellness',
      isActive: true,
    },
  });

  console.log('✅ Created partners: Remarkable, Vabali Spa & Friedrichsbad');

  const remarkable2 = await prisma.product.create({
    data: {
      name: 'reMarkable 2',
      description:
        "The world's thinnest tablet for paper-like reading, writing and sketching",
      productType: ProductType.PHYSICAL_PRODUCT,
      price: 279.0,
      currency: 'EUR',
      country: 'Norway',
      isActive: true,
      partnerId: remarkable.id,
    },
  });

  const remarkablePaperPro = await prisma.product.create({
    data: {
      name: 'reMarkable Paper Pro',
      description:
        'Next-generation paper tablet with color E Ink display and improved performance',
      productType: ProductType.PHYSICAL_PRODUCT,
      price: 649.0,
      currency: 'EUR',
      country: 'Norway',
      isActive: true,
      partnerId: remarkable.id,
    },
  });

  const vabaliBerlin = await prisma.product.create({
    data: {
      name: 'Vabali Spa Berlin',
      description:
        'Premium wellness and spa experience in Berlin with Balinese-inspired design',
      productType: ProductType.SERVICE_LOCATION,
      price: 29.5,
      currency: 'EUR',
      city: 'Berlin',
      country: 'Germany',
      isActive: true,
      partnerId: vabaliSpa.id,
    },
  });

  const vabaliHamburg = await prisma.product.create({
    data: {
      name: 'Vabali Spa Hamburg',
      description:
        'Wellness oasis in Hamburg with extensive sauna world and relaxation areas',
      productType: ProductType.SERVICE_LOCATION,
      price: 27.5,
      currency: 'EUR',
      city: 'Hamburg',
      country: 'Germany',
      isActive: true,
      partnerId: vabaliSpa.id,
    },
  });

  const vabaliDusseldorf = await prisma.product.create({
    data: {
      name: 'Vabali Spa Düsseldorf',
      description:
        'Tranquil spa retreat in Düsseldorf offering authentic wellness experiences',
      productType: ProductType.SERVICE_LOCATION,
      price: 28.0,
      currency: 'EUR',
      city: 'Düsseldorf',
      country: 'Germany',
      isActive: true,
      partnerId: vabaliSpa.id,
    },
  });

  const friedrichsbadBath = await prisma.product.create({
    data: {
      name: 'Friedrichsbad Roman-Irish Bath',
      description:
        'Historic Renaissance-style bathhouse offering the authentic Roman-Irish bathing ritual with thermal waters, UNESCO World Heritage site',
      productType: ProductType.SERVICE_LOCATION,
      price: 38.0,
      currency: 'EUR',
      city: 'Baden-Baden',
      country: 'Germany',
      isActive: true,
      partnerId: friedrichsbad.id,
    },
  });

  console.log('✅ Created products for all partners');

  // Market competition
  const vabaliBerlinMarketRanking = await prisma.objective.create({
    data: {
      title: 'Top Spa Businesses in Germany',
      question:
        'What are the best 15 spa and wellness businesses in Germany? Please rank them by facilities, service quality, and overall customer experience.',
      llmModels: [LLMModel.GPT_4O, LLMModel.GPT_4O_MINI],
      partnerId: vabaliSpa.id,
      productId: vabaliBerlin.id,
      isActive: true,
    },
  });

  const vabaliDusseldorfMarketRanking = await prisma.objective.create({
    data: {
      title: 'Top Spa Businesses in Germany',
      question:
        'What are the best 15 spa and wellness businesses in Germany? Please rank them by facilities, service quality, and overall customer experience.',
      llmModels: [LLMModel.GPT_4O, LLMModel.GPT_4O_MINI],
      partnerId: vabaliSpa.id,
      productId: vabaliDusseldorf.id,
      isActive: true,
    },
  });

  const vabaliHamburgMarketRanking = await prisma.objective.create({
    data: {
      title: 'Top Spa Businesses in Germany',
      question:
        'What are the best 15 spa and wellness businesses in Germany? Please rank them by facilities, service quality, and overall customer experience.',
      llmModels: [LLMModel.GPT_4O, LLMModel.GPT_4O_MINI],
      partnerId: vabaliSpa.id,
      productId: vabaliHamburg.id,
      isActive: true,
    },
  });

  const friedrichsbadMarketPosition = await prisma.objective.create({
    data: {
      title: 'Premier Historic Spa Destinations in Germany',
      question:
        'What are the best 15 spa and wellness businesses in Germany? Please rank them by facilities, service quality, and overall customer experience.',
      llmModels: [LLMModel.GPT_4O, LLMModel.GPT_4O_MINI],
      partnerId: friedrichsbad.id,
      productId: friedrichsbadBath.id,
      isActive: true,
    },
  });

  // Brand perception
  const vabaliBrandPerception = await prisma.objective.create({
    data: {
      title: 'Vabali Spa Brand Attractiveness',
      question:
        'How attractive and innovative is the Vabali Spa brand compared to other wellness and spa solutions in Germany? What makes it stand out in the market?',
      llmModels: [LLMModel.GPT_4O, LLMModel.GPT_4O_MINI],
      partnerId: vabaliSpa.id,
      productId: vabaliBerlin.id,
      isActive: true,
    },
  });

  // Customer satisfaction
  const remarkableCustomerSatisfaction = await prisma.objective.create({
    data: {
      title: 'ReMarkable Customer Experience',
      question:
        'What do customers think about reMarkable tablets? How would you rate the overall customer satisfaction and experience quality in the digital note-taking sector?',
      llmModels: [LLMModel.GPT_4O, LLMModel.GPT_4O_MINI],
      partnerId: remarkable.id,
      productId: remarkablePaperPro.id,
      isActive: true,
    },
  });

  // Product quality assessment
  const remarkableProductQuality = await prisma.objective.create({
    data: {
      title: 'Digital Note-taking Tablet Quality',
      question:
        'How would you evaluate the quality of the reMarkable 2 digital paper tablet compared to competitors like iPad, Samsung Galaxy Tab, and other e-ink tablets in the market?',
      llmModels: [LLMModel.GPT_4O, LLMModel.GPT_4O_MINI],
      partnerId: remarkable.id,
      productId: remarkable2.id,
      isActive: true,
    },
  });

  console.log('✅ Created partner-specific evaluation objectives');
  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await disconnectDatabase();
  });
