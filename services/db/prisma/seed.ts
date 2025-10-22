import { connectDatabase, disconnectDatabase, prisma } from '../';
import { $Enums } from '../generated/prisma';

async function main() {
  console.log('🌱 Starting database seeding...');

  await connectDatabase();

  try {
    // Clean existing data
    await prisma.insight.deleteMany();
    await prisma.answer.deleteMany();
    await prisma.target.deleteMany();
    await prisma.execution.deleteMany();
    await prisma.question.deleteMany();
    await prisma.objective.deleteMany();
    await prisma.product.deleteMany();
    await prisma.partner.deleteMany();
    console.log('🧹 Cleaned existing data');
  } catch (error) {
    console.log('⚠️ Skipping cleanup (collections may not exist yet)');
  }

  // Create Website Builder Partners (Market Leaders)
  const wix = await prisma.partner.create({
    data: {
      name: 'Wix',
      description:
        'Leading cloud-based website development platform with drag-and-drop functionality',
      partnerType: $Enums.PartnerType.TECH_COMPANY,
      website: 'https://wix.com',
      country: 'US',
      industry: 'Website Building',
      isActive: true,
    },
  });

  const webflow = await prisma.partner.create({
    data: {
      name: 'Webflow',
      description:
        'Professional website builder with advanced design capabilities and CMS',
      partnerType: $Enums.PartnerType.TECH_COMPANY,
      website: 'https://webflow.com',
      country: 'US',
      industry: 'Website Building',
      isActive: true,
    },
  });

  const elementor = await prisma.partner.create({
    data: {
      name: 'Elementor',
      description:
        'Leading WordPress page builder with drag-and-drop visual editor',
      partnerType: $Enums.PartnerType.TECH_COMPANY,
      website: 'https://elementor.com',
      country: 'US',
      industry: 'Website Building',
      isActive: true,
    },
  });

  const shopify = await prisma.partner.create({
    data: {
      name: 'Shopify',
      description:
        'Leading e-commerce platform for online stores and retail point-of-sale systems',
      partnerType: $Enums.PartnerType.TECH_COMPANY,
      website: 'https://shopify.com',
      country: 'CA',
      industry: 'E-commerce',
      isActive: true,
    },
  });

  const squarespace = await prisma.partner.create({
    data: {
      name: 'Squarespace',
      description:
        'All-in-one website builder with beautiful templates and integrated e-commerce',
      partnerType: $Enums.PartnerType.TECH_COMPANY,
      website: 'https://squarespace.com',
      country: 'US',
      industry: 'Website Building',
      isActive: true,
    },
  });

  console.log(
    '✅ Created website builder partners: Wix, Webflow, Elementor, Shopify, Squarespace'
  );

  // Create Products
  const wixWebsiteBuilder = await prisma.product.create({
    data: {
      name: 'Wix Website Builder',
      description:
        'Drag-and-drop website builder with AI-powered design assistance',
      productType: $Enums.ProductType.WEBSITE_BUILDER,
      isActive: true,
      partnerId: wix.id,
    },
  });

  const webflowBuilder = await prisma.product.create({
    data: {
      name: 'Webflow Designer',
      description:
        'Professional web design platform with visual CSS editing and CMS',
      productType: $Enums.ProductType.WEBSITE_BUILDER,
      isActive: true,
      partnerId: webflow.id,
    },
  });

  const elementorBuilder = await prisma.product.create({
    data: {
      name: 'Elementor Pro',
      description:
        'Advanced WordPress page builder with professional widgets and templates',
      productType: $Enums.ProductType.WEBSITE_BUILDER,
      isActive: true,
      partnerId: elementor.id,
    },
  });

  const shopifyStore = await prisma.product.create({
    data: {
      name: 'Shopify Online Store',
      description:
        'Complete e-commerce solution with payment processing and inventory management',
      productType: $Enums.ProductType.ECOMMERCE_PLATFORM,
      isActive: true,
      partnerId: shopify.id,
    },
  });

  const squarespaceBuilder = await prisma.product.create({
    data: {
      name: 'Squarespace Website Builder',
      description:
        'Beautiful, responsive website builder with integrated blogging and e-commerce',
      productType: $Enums.ProductType.WEBSITE_BUILDER,
      isActive: true,
      partnerId: squarespace.id,
    },
  });

  console.log('✅ Created website builder products');

  // Create Static Objectives (these are template objectives)
  const top5Objective = await prisma.objective.create({
    data: {
      type: $Enums.ObjectiveType.TOP_5_RECOMMENDATIONS,
      title: 'Top 5 Recommendations',
      description:
        'Analyze and rank the top 5 solutions in a specific category based on features, usability, pricing, and overall value. Provide detailed reasoning for each ranking position and highlight key differentiators.',
      expectedAnswerFormat:
        'Provide a numbered list from 1-5 with each item including: name, brief description, key strengths, and why it deserves its ranking position.',
      models: [$Enums.LLMModel.GPT_4O],
      isActive: true,
    },
  });

  const competitorAnalysis = await prisma.objective.create({
    data: {
      type: $Enums.ObjectiveType.COMPETITOR_ANALYSIS,
      title: 'Competitor Analysis',
      description:
        'Comprehensive competitive landscape analysis including market positioning, strengths, weaknesses, and competitive advantages. Compare direct and indirect competitors in the market.',
      expectedAnswerFormat:
        'Provide structured analysis with competitor names, market position, key strengths, weaknesses, and competitive differentiation.',
      models: [$Enums.LLMModel.GPT_4O],
      isActive: true,
    },
  });

  const prosAndCons = await prisma.objective.create({
    data: {
      type: $Enums.ObjectiveType.PROS_AND_CONS,
      title: 'Pros and Cons Analysis',
      description:
        'Balanced evaluation of advantages and disadvantages for specific solutions or products. Include both user perspective and business considerations.',
      expectedAnswerFormat:
        'Provide clear pros and cons lists with explanations for each point, concluding with overall assessment.',
      models: [$Enums.LLMModel.GPT_4O],
      isActive: true,
    },
  });

  console.log('✅ Created static objectives');

  // Sample personas for testing
  const personas = {
    techSavvy:
      'a tech-savvy developer who needs advanced customization options',
    creative:
      'a creative designer who values beautiful templates and visual flexibility',
    entrepreneur: 'a wannabe entrepreneur starting their first online business',
  };

  console.log('✅ Created sample personas:', Object.values(personas));

  // Create Template Questions for Top 5 Recommendations
  const q1 = await prisma.question.create({
    data: {
      template:
        'What are the top 5 [product_type] for [persona] in [location]?',
      placeholders: ['product_type', 'persona', 'location'],
      objectiveId: top5Objective.id,
    },
  });

  const q2 = await prisma.question.create({
    data: {
      template:
        'As a [persona], what are the best 5 [product_type] solutions available?',
      placeholders: ['persona', 'product_type'],
      objectiveId: top5Objective.id,
    },
  });

  const q3 = await prisma.question.create({
    data: {
      template: 'Which 5 [product_type] would you recommend for [use_case]?',
      placeholders: ['product_type', 'use_case'],
      objectiveId: top5Objective.id,
    },
  });

  const q4 = await prisma.question.create({
    data: {
      template:
        'What are the top 5 most popular [product_type] for [persona] with [budget] budget?',
      placeholders: ['product_type', 'persona', 'budget'],
      objectiveId: top5Objective.id,
    },
  });

  const q5 = await prisma.question.create({
    data: {
      template:
        'Can you recommend 5 [product_type] that are best for [use_case] in [location]?',
      placeholders: ['product_type', 'use_case', 'location'],
      objectiveId: top5Objective.id,
    },
  });

  // Add persona-specific questions
  const q6 = await prisma.question.create({
    data: {
      template:
        'What are the best 5 [product_type] for a tech-savvy developer who needs advanced customization?',
      placeholders: ['product_type'],
      objectiveId: top5Objective.id,
    },
  });

  const q7 = await prisma.question.create({
    data: {
      template:
        'Which 5 [product_type] are ideal for a creative designer who values beautiful templates?',
      placeholders: ['product_type'],
      objectiveId: top5Objective.id,
    },
  });

  const q8 = await prisma.question.create({
    data: {
      template:
        'What are the top 5 [product_type] for a wannabe entrepreneur starting their first online business?',
      placeholders: ['product_type'],
      objectiveId: top5Objective.id,
    },
  });

  // Create more template questions for competitor analysis
  const c1 = await prisma.question.create({
    data: {
      template:
        'Who are the main competitors of [product_name] in the [product_type] market?',
      placeholders: ['product_name', 'product_type'],
      objectiveId: competitorAnalysis.id,
    },
  });

  const c2 = await prisma.question.create({
    data: {
      template:
        'How does [product_name] compare to other [product_type] solutions for [persona]?',
      placeholders: ['product_name', 'product_type', 'persona'],
      objectiveId: competitorAnalysis.id,
    },
  });

  // Create pros and cons questions
  const p1 = await prisma.question.create({
    data: {
      template:
        'What are the pros and cons of using [product_name] for [use_case]?',
      placeholders: ['product_name', 'use_case'],
      objectiveId: prosAndCons.id,
    },
  });

  const p2 = await prisma.question.create({
    data: {
      template:
        'As a [persona], what are the advantages and disadvantages of [product_name]?',
      placeholders: ['persona', 'product_name'],
      objectiveId: prosAndCons.id,
    },
  });

  console.log('✅ Created template questions for all objectives');

  // Create a sample execution to demonstrate the complete flow
  const sampleExecution = await prisma.execution.create({
    data: {
      partnerId: wix.id,
      productId: wixWebsiteBuilder.id,
      objectiveId: top5Objective.id,
      status: $Enums.ExecutionStatus.PENDING,
    },
  });

  // Create 3 Target Personas for the sample execution
  const targetCreativeFreelancer = await prisma.target.create({
    data: {
      persona: 'The Creative Freelancer',
      occupation: ['Designer', 'Photographer', 'Writer', 'Content Creator'],
      technicalSkills: 'Low-to-medium',
      goals: [
        'Showcase their portfolio professionally',
        'Attract new clients',
        'Establish a strong online presence',
        'Sell services directly online',
      ],
      motivations: [
        'Build credibility and trust with potential clients',
        'Increase income through online visibility',
        'Stand out from competition',
        'Work with higher-quality clients',
      ],
      location: 'United States',
      language: 'English',
      useCase:
        'creating a portfolio website to showcase work and attract clients',
      budget: 'under $50/month',
      executionId: sampleExecution.id,
    },
  });

  const targetSmallBusinessOwner = await prisma.target.create({
    data: {
      persona: 'The Small Business Owner',
      occupation: [
        'Local Business Owner',
        'Service Provider',
        'Retailer',
        'Consultant',
      ],
      technicalSkills: 'Beginner-to-low',
      goals: [
        'Establish online presence for local business',
        'Generate leads and drive sales',
        'Provide information about services/products',
        'Build customer trust and credibility',
      ],
      motivations: [
        'Compete with larger businesses online',
        'Reach customers outside of local area',
        'Reduce dependency on foot traffic',
        'Modernize business operations',
      ],
      location: 'United States',
      language: 'English',
      useCase:
        'creating a business website to attract local customers and grow online',
      budget: '$25-100/month',
      executionId: sampleExecution.id,
    },
  });

  const targetAspiringStartupFounder = await prisma.target.create({
    data: {
      persona: 'The Aspiring Startup Founder',
      occupation: [
        'Entrepreneur',
        'Business Student',
        'Corporate Employee',
        'First-time Founder',
      ],
      technicalSkills: 'Medium-to-high',
      goals: [
        'Launch MVP quickly and cost-effectively',
        'Validate business idea with landing page',
        'Build email list of potential customers',
        'Attract investors and partners',
      ],
      motivations: [
        'Turn business idea into reality',
        'Prove market demand for their concept',
        'Build something meaningful and profitable',
        'Achieve financial independence',
      ],
      location: 'United States',
      language: 'English',
      useCase:
        'creating a startup landing page to validate business idea and collect leads',
      budget: '$10-75/month initially, scaling up',
      executionId: sampleExecution.id,
    },
  });

  console.log('✅ Created 3 sample target personas');
  console.log('🎉 Seeding completed successfully!');
  console.log('');
  console.log('📊 Summary:');
  console.log(
    '- 5 Website Builder Partners (Wix, Webflow, Elementor, Shopify, Squarespace)'
  );
  console.log('- 5 Products (Website builders and e-commerce platforms)');
  console.log(
    '- 3 Static Objectives (Top 5, Competitor Analysis, Pros & Cons)'
  );
  console.log('- 12 Template Questions ready for dynamic execution');
  console.log('- 1 Sample Execution linking everything together');
  console.log(
    '- 3 Target Personas: Creative Freelancer, Small Business Owner, Aspiring Startup Founder'
  );
  console.log('');
  console.log('🎯 Target Personas Created:');
  console.log(
    '  1. The Creative Freelancer - Low-to-medium tech skills, portfolio focus'
  );
  console.log(
    '  2. The Small Business Owner - Beginner tech skills, local business focus'
  );
  console.log(
    '  3. The Aspiring Startup Founder - Medium-to-high tech skills, MVP/validation focus'
  );
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await disconnectDatabase();
  });
