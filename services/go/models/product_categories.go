package models

// ProductCategoryValues returns the list of known ProductCategory values as strings.
func ProductCategoryValues() []string {
	out := make([]string, 0, len(ProductCategories))
	for _, c := range ProductCategories {
		out = append(out, string(c))
	}
	return out
}

type ProductCategory string

// ProductCategories is the authoritative list of known categories.
// This replaces the previous const-based enum so that the slice itself
// is the single source of truth and can be extended without duplication.
var ProductCategories = []ProductCategory{
	// Digital / Non-Physical Goods
	"SaaS",
	"Software",
	"DigitalService",
	"Subscription",
	"App",
	"Game",
	"Media",
	"Education",
	"Consulting",
	"FinancialService",
	"Advertising",
	"CloudService",
	"Platform",
	"DesignService",
	"MarketingService",
	"SupportService",
	"TelecomService",
	"AI",
	"MachineLearning",
	"DataAnalytics",
	"BusinessIntelligence",
	"DevTools",
	"DeveloperTooling",
	"API",
	"IntegrationPlatform",
	"Cybersecurity",
	"DevSecOps",
	"Observability",
	"Monitoring",
	"TestingQA",
	"Productivity",
	"Collaboration",
	"Communication",
	"Email",
	"Messaging",
	"VideoConferencing",
	"SocialNetwork",
	"CreatorTools",
	"CRM",
	"ERP",
	"SalesEnablement",

	// Emerging tech
	"Blockchain",
	"Web3",
	"Crypto",
	"NFTs",
	"ARVR",
	"XR",
	"IoT",
	"Robotics",
	"Drones",

	// Infrastructure
	"Hosting",
	"CDN",
	"Domain",
	"Search",
	"Maps",
	"Location",

	// Fintech
	"FinTech",
	"Payments",
	"Banking",
	"Lending",
	"Insurance",
	"InsurTech",
	"WealthManagement",
	"Trading",

	// Health & Bio
	"HealthTech",
	"Telemedicine",
	"Pharmacy",
	"MentalHealth",
	"FitnessTech",
	"Wellness",
	"Biotech",
	"Pharma",
	"MedicalDevice",
	"Diagnostics",
	"Imaging",

	// Physical Goods
	"Electronics",
	"Hardware",
	"Semiconductor",
	"Wearables",
	"SmartHome",
	"HomeSecurity",
	"Photography",
	"AudioEquipment",
	"Printing",
	"Clothing",
	"Footwear",
	"Jewelry",
	"Furniture",
	"HomeAppliance",
	"Automotive",
	"SportsEquipment",
	"ToysAndGames",
	"BooksAndMedia",
	"HomeAndGarden",
	"PetSupplies",
	"OfficeSupplies",
	"Industrial",
	"Medical",
	"Construction",
	"ArtAndCraft",

	// Real estate & built world
	"RealEstate",
	"PropTech",
	"Architecture",
	"InteriorDesign",
	"FacilityManagement",
	"ConstructionTech",
	"CivilEngineering",

	// Energy & environment
	"RenewableEnergy",
	"Solar",
	"WindEnergy",
	"Battery",
	"EnergyStorage",
	"EnergyManagement",
	"Utilities",
	"OilAndGas",
	"Mining",
	"Chemical",
	"Materials",
	"3DPrinting",
	"Aerospace",
	"Defense",
	"Maritime",

	// Logistics & mobility
	"SupplyChain",
	"Logistics",
	"Shipping",
	"Freight",
	"Delivery",
	"Mobility",
	"RideSharing",
	"MicroMobility",
	"PublicTransport",
	"TransportationSoftware",

	// Consumer & commerce
	"Marketplace",
	"Ecommerce",
	"Retail",
	"Fashion",
	"Beauty",
	"PersonalCare",
	"HomeImprovement",
	"DIY",
	"Gardening",
	"Travel",
	"Hospitality",
	"Tourism",
	"FoodDelivery",
	"Restaurant",
	"Grocery",

	// Work & back office
	"HR",
	"HRTech",
	"Recruiting",
	"Legal",
	"LegalTech",
	"Accounting",
	"Tax",
	"Compliance",
	"Governance",
	"Audit",
}
