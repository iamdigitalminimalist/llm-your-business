import {
  PartnerType,
  ProductType,
  ObjectiveCategory,
  ObjectiveScope,
  LLMModel,
  EvaluationStatus,
} from '../generated/prisma';
import { prisma, connectDatabase, disconnectDatabase } from '../lib/db';

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

  // 2. Create Vabali Spa Partner
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

  console.log('✅ Created partners: Remarkable & Vabali Spa');

  // 3. Create Remarkable Products
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

  // 4. Create Vabali Spa Locations (Berlin, Hamburg, Düsseldorf)
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

  console.log('✅ Created products for both partners');

  // 5. Create Generic Objectives (Decoupled from Partners)

  // Generic market competition ranking
  const marketRanking = await prisma.objective.create({
    data: {
      title: 'Top Businesses',
      question:
        'What are the best 15 businesses in the {industry} industry within {scope}? Please rank them by facilities, service quality, and overall experience.',
      category: ObjectiveCategory.MARKET_COMPETITION,
      scope: ObjectiveScope.NATIONAL,
      isActive: true,
    },
  });

  // Generic brand perception
  const brandPerception = await prisma.objective.create({
    data: {
      title: 'Brand Attractiveness',
      question:
        'How attractive and innovative is the {partner_name} brand compared to other {industry} solutions? What makes it stand out in the market within {scope}?',
      category: ObjectiveCategory.BRAND_PERCEPTION,
      scope: ObjectiveScope.NATIONAL,
      isActive: true,
    },
  });

  // Generic customer satisfaction
  const customerSatisfaction = await prisma.objective.create({
    data: {
      title: 'Customer Experience',
      question:
        'What do customers think about {partner_name}? How would you rate the overall customer satisfaction and experience quality in the {industry} sector?',
      category: ObjectiveCategory.CUSTOMER_SATISFACTION,
      scope: ObjectiveScope.LOCAL,
      isActive: true,
    },
  });

  // Generic product quality assessment
  const productQuality = await prisma.objective.create({
    data: {
      title: 'Product Quality',
      question:
        'How would you evaluate the quality of {partner_name} products/services compared to competitors in the {industry} market within {scope}?',
      category: ObjectiveCategory.PRODUCT_QUALITY,
      scope: ObjectiveScope.NATIONAL,
      isActive: true,
    },
  });

  console.log('✅ Created generic evaluation objectives');

  // 6. Create Sample Evaluation (demonstrating dynamic context replacement)
  // When used with Vabali Spa, the placeholders would be replaced:
  // {industry} -> "Wellness & Spa"
  // {scope} -> "Germany" (from partner.country)
  // {partner_name} -> "Vabali Spa"

  const sampleEvaluation = await prisma.evaluation.create({
    data: {
      llmModel: LLMModel.GPT_4O,
      prompt:
        'What are the best 15 businesses in the Wellness & Spa industry within Germany? Please rank them by facilities, service quality, and overall experience.',
      response: `Here are the top 15 wellness and spa businesses in Germany:

1. **Vabali Spa** (Berlin, Hamburg, Düsseldorf) - Exceptional Balinese design, premium experience
2. **Therme Erding** (Munich area) - Europe's largest thermal spa complex
3. **Friedrichsbad** (Baden-Baden) - Historic Roman-Irish bathhouse
4. **Claudius Therme** (Cologne) - Modern thermal spa with mineral-rich waters
5. **Liquidrom** (Berlin) - Unique floating sound experience
...

Vabali Spa leads with its authentic atmosphere and consistent quality across all German locations.`,
      score: 10.0,
      mentionFound: true,
      status: EvaluationStatus.COMPLETED,
      objectiveId: marketRanking.id,
      partnerId: vabaliSpa.id,
      productId: vabaliBerlin.id,
    },
  });

  console.log('✅ Created sample evaluation demonstrating context replacement');
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
