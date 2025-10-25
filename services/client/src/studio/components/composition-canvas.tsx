import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Button } from '@/components/ui/button';
import { User, Package, Target, X, Plus } from 'lucide-react';
import type { Persona, Product, Objective } from '../studio.api';

interface CompositionState {
  selectedPersona: Persona | null;
  selectedProduct: Product | null;
  selectedObjective: Objective | null;
}

interface CompositionCanvasProps {
  composition: CompositionState;
  onRemoveItem: (type: string) => void;
}

export function CompositionCanvas({
  composition,
  onRemoveItem,
}: CompositionCanvasProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: 'composition-canvas',
  });

  const [selectedForDetails, setSelectedForDetails] = useState<
    'product' | 'persona' | 'objective' | null
  >(null);

  return (
    <div
      className={`
      h-full bg-white border-2 border-dashed rounded-lg transition-all duration-200 flex flex-col
      ${isOver ? 'border-gray-400 bg-gray-50' : 'border-gray-300'}
    `}
    >
      <div className="text-left p-3 border-b border-gray-200 flex-shrink-0">
        <h3 className="text-sm font-medium text-gray-900">Objective Canvas</h3>
        <p className="text-xs text-gray-600 mt-1">
          Drag and drop components here
        </p>
      </div>

      <div ref={setNodeRef} className="flex-1 flex overflow-hidden">
        {/* Left Panel - Composition Overview (1/3) */}
        <div className="w-1/3 p-3 border-r border-gray-200 space-y-3">
          {/* Product Section */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Product</h4>
            {composition.selectedProduct ? (
              <div
                className="cursor-pointer"
                onClick={() => setSelectedForDetails('product')}
              >
                <SelectedProductCard
                  product={composition.selectedProduct}
                  onRemove={() => onRemoveItem('Product')}
                />
              </div>
            ) : (
              <EmptySlot type="product" />
            )}
          </div>

          {/* Persona Section */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Persona</h4>
            {composition.selectedPersona ? (
              <div
                className="cursor-pointer"
                onClick={() => setSelectedForDetails('persona')}
              >
                <SelectedPersonaCard
                  persona={composition.selectedPersona}
                  onRemove={() => onRemoveItem('Persona')}
                />
              </div>
            ) : (
              <EmptySlot type="persona" />
            )}
          </div>

          {/* Metric Section */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Metric</h4>
            {composition.selectedObjective ? (
              <div
                className="cursor-pointer"
                onClick={() => setSelectedForDetails('objective')}
              >
                <SelectedObjectiveCard
                  objective={composition.selectedObjective}
                  onRemove={() => onRemoveItem('Objective')}
                />
              </div>
            ) : (
              <EmptySlot type="objective" />
            )}
          </div>
        </div>

        {/* Right Panel - Details View (2/3) */}
        <div className="w-2/3 p-4 overflow-y-auto text-left">
          {selectedForDetails ? (
            <DetailsPanel
              type={selectedForDetails}
              product={composition.selectedProduct}
              persona={composition.selectedPersona}
              objective={composition.selectedObjective}
            />
          ) : (
            <div className="flex flex-col justify-center h-full text-left space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Plus className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    Start Creating
                  </h3>
                  <p className="text-sm text-gray-600">
                    Drag items from the carousel above, then click on them to
                    see details.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptySlot({ type }: { type: 'persona' | 'product' | 'objective' }) {
  const config = {
    persona: {
      icon: User,
      text: 'Drop a persona here',
    },
    product: {
      icon: Package,
      text: 'Drop a product here',
    },
    objective: {
      icon: Target,
      text: 'Drop an objective here',
    },
  };

  const { icon: Icon, text } = config[type];

  return (
    <div className="border-2 border-dashed border-gray-200 rounded-lg p-2 text-left flex items-center space-x-2">
      <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
      <p className="text-xs text-gray-500">{text}</p>
    </div>
  );
}

function getPersonaEmoji(persona: Persona): string {
  const occupation = persona.occupation[0]?.toLowerCase() || '';
  if (occupation.includes('founder') || occupation.includes('entrepreneur'))
    return '🚀';
  if (occupation.includes('business owner') || occupation.includes('owner'))
    return '🏪';
  if (occupation.includes('developer') || occupation.includes('engineer'))
    return '💻';
  if (occupation.includes('designer')) return '🎨';
  if (occupation.includes('manager') || occupation.includes('executive'))
    return '👔';
  if (occupation.includes('freelancer') || occupation.includes('consultant'))
    return '🎯';
  if (occupation.includes('student') || occupation.includes('researcher'))
    return '📚';
  if (occupation.includes('creator') || occupation.includes('influencer'))
    return '📱';
  return '👤';
}

function getPersonaTitle(persona: Persona): string {
  const occupation = persona.occupation[0]?.toLowerCase() || '';
  if (occupation.includes('founder') || occupation.includes('entrepreneur'))
    return 'The Aspiring Startup Founder';
  if (occupation.includes('business owner') || occupation.includes('owner'))
    return 'The Small Business Owner';
  if (occupation.includes('developer') || occupation.includes('engineer'))
    return 'The Tech Professional';
  if (occupation.includes('designer')) return 'The Creative Designer';
  if (occupation.includes('manager') || occupation.includes('executive'))
    return 'The Business Leader';
  if (occupation.includes('freelancer') || occupation.includes('consultant'))
    return 'The Independent Professional';
  if (occupation.includes('student') || occupation.includes('researcher'))
    return 'The Knowledge Seeker';
  if (occupation.includes('creator') || occupation.includes('influencer'))
    return 'The Content Creator';
  return persona.name;
}

function SelectedPersonaCard({
  persona,
  onRemove,
}: {
  persona: Persona;
  onRemove: () => void;
}) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between hover:bg-gray-100 transition-colors text-left">
      <div className="flex items-center space-x-3">
        <span className="text-2xl">{getPersonaEmoji(persona)}</span>
        <div className="text-left">
          <h4 className="font-medium text-gray-900 text-sm text-left">
            {getPersonaTitle(persona)}
          </h4>
          <p className="text-xs text-gray-600 text-left">
            {persona.occupation[0]}
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="text-gray-400 hover:text-gray-600 h-6 w-6 p-0"
      >
        <X className="w-3 h-3" />
      </Button>
    </div>
  );
}

function getProductEmoji(productType: string): string {
  const type = productType.toLowerCase();
  if (type.includes('saas') || type.includes('software')) return '💻';
  if (type.includes('mobile') || type.includes('app')) return '📱';
  if (type.includes('hardware') || type.includes('device')) return '⚙️';
  if (type.includes('service') || type.includes('consulting')) return '🎯';
  if (type.includes('ecommerce') || type.includes('marketplace')) return '🛒';
  if (type.includes('education') || type.includes('learning')) return '📚';
  if (type.includes('health') || type.includes('medical')) return '⚕️';
  if (type.includes('finance') || type.includes('fintech')) return '💳';
  return '📦';
}

function SelectedProductCard({
  product,
  onRemove,
}: {
  product: Product;
  onRemove: () => void;
}) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between hover:bg-gray-100 transition-colors text-left">
      <div className="flex items-center space-x-3">
        <span className="text-2xl">{getProductEmoji(product.productType)}</span>
        <div className="text-left">
          <h4 className="font-medium text-gray-900 text-sm text-left">
            {product.name}
          </h4>
          <p className="text-xs text-gray-600 text-left">
            {product.productType.replace(/_/g, ' ')}
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="text-gray-400 hover:text-gray-600 h-6 w-6 p-0"
      >
        <X className="w-3 h-3" />
      </Button>
    </div>
  );
}

function getObjectiveEmoji(objectiveType: string): string {
  const type = objectiveType.toLowerCase();
  if (type.includes('recommendation')) return '💡';
  if (type.includes('competitor') || type.includes('analysis')) return '🔍';
  if (type.includes('pros') || type.includes('cons')) return '⚖️';
  if (type.includes('market') || type.includes('position')) return '📊';
  if (type.includes('pricing')) return '💰';
  if (type.includes('feature')) return '⭐';
  if (type.includes('review')) return '📝';
  return '🎯';
}

function getObjectiveTitle(objectiveType: string): string {
  const type = objectiveType.toLowerCase();
  if (type.includes('top_5_recommendations')) return 'Top 5 Recommendations';
  if (type.includes('top_10_recommendations')) return 'Top 10 Recommendations';
  if (type.includes('competitor_analysis')) return 'Competitor Analysis';
  if (type.includes('pros_and_cons')) return 'Pros & Cons';
  if (type.includes('market_position')) return 'Market Position';
  if (type.includes('pricing_analysis')) return 'Pricing Analysis';
  return objectiveType.replace(/_/g, ' ');
}

function SelectedObjectiveCard({
  objective,
  onRemove,
}: {
  objective: Objective;
  onRemove: () => void;
}) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between hover:bg-gray-100 transition-colors text-left">
      <div className="flex items-center space-x-3">
        <span className="text-2xl">{getObjectiveEmoji(objective.type)}</span>
        <div className="text-left">
          <h4 className="font-medium text-gray-900 text-sm text-left">
            {getObjectiveTitle(objective.type)}
          </h4>
          <p className="text-xs text-gray-600 text-left">{objective.title}</p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="text-gray-400 hover:text-gray-600 h-6 w-6 p-0"
      >
        <X className="w-3 h-3" />
      </Button>
    </div>
  );
}

function DetailsPanel({
  type,
  product,
  persona,
  objective,
}: {
  type: 'product' | 'persona' | 'objective';
  product: Product | null;
  persona: Persona | null;
  objective: Objective | null;
}) {
  if (type === 'product' && product) {
    return (
      <div className="space-y-4 text-left">
        <div className="flex items-center space-x-3 mb-4">
          <span className="text-3xl">
            {getProductEmoji(product.productType)}
          </span>
          <div className="text-left">
            <h3 className="text-xl font-semibold text-gray-900">
              {product.name}
            </h3>
            <p className="text-sm text-gray-600">
              {product.productType.replace(/_/g, ' ')}
            </p>
          </div>
        </div>

        {product.description && (
          <div className="text-left">
            <h4 className="font-medium text-gray-900 mb-2">Description</h4>
            <p className="text-gray-700">{product.description}</p>
          </div>
        )}

        <div className="text-left">
          <h4 className="font-medium text-gray-900 mb-2">Partner ID</h4>
          <p className="text-gray-700">{product.partnerId}</p>
        </div>
      </div>
    );
  }

  if (type === 'persona' && persona) {
    return (
      <div className="space-y-4 text-left">
        <div className="flex items-center space-x-3 mb-4">
          <span className="text-3xl">{getPersonaEmoji(persona)}</span>
          <div className="text-left">
            <h3 className="text-xl font-semibold text-gray-900">
              {getPersonaTitle(persona)}
            </h3>
            <p className="text-sm text-gray-600">{persona.name}</p>
          </div>
        </div>

        {persona.description && (
          <div className="text-left">
            <h4 className="font-medium text-gray-900 mb-2">Description</h4>
            <p className="text-gray-700">{persona.description}</p>
          </div>
        )}

        <div className="text-left">
          <h4 className="font-medium text-gray-900 mb-2">Occupations</h4>
          <div className="flex flex-wrap gap-2">
            {persona.occupation.map((occ, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
              >
                {occ}
              </span>
            ))}
          </div>
        </div>

        <div className="text-left">
          <h4 className="font-medium text-gray-900 mb-2">Technical Skills</h4>
          <p className="text-gray-700">{persona.technicalSkills}</p>
        </div>

        <div className="text-left">
          <h4 className="font-medium text-gray-900 mb-2">Goals</h4>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            {persona.goals.map((goal, index) => (
              <li key={index}>{goal}</li>
            ))}
          </ul>
        </div>

        <div className="text-left">
          <h4 className="font-medium text-gray-900 mb-2">Motivations</h4>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            {persona.motivations.map((motivation, index) => (
              <li key={index}>{motivation}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (type === 'objective' && objective) {
    return (
      <div className="space-y-4 text-left">
        <div className="flex items-center space-x-3 mb-4">
          <span className="text-3xl">{getObjectiveEmoji(objective.type)}</span>
          <div className="text-left">
            <h3 className="text-xl font-semibold text-gray-900">
              {getObjectiveTitle(objective.type)}
            </h3>
            <p className="text-sm text-gray-600">{objective.title}</p>
          </div>
        </div>

        <div className="text-left">
          <h4 className="font-medium text-gray-900 mb-2">Description</h4>
          <p className="text-gray-700">{objective.description}</p>
        </div>

        <div className="text-left">
          <h4 className="font-medium text-gray-900 mb-2">Type</h4>
          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
            {objective.type.replace(/_/g, ' ')}
          </span>
        </div>
      </div>
    );
  }

  return null;
}
