import {
  User,
  Package,
  Target,
  CheckCircle,
  Circle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import type { Persona, Product, Objective } from '../studio.api';

interface CompositionState {
  selectedPersona: Persona | null;
  selectedProduct: Product | null;
  selectedObjective: Objective | null;
}

interface PreviewPanelProps {
  composition: CompositionState;
}

export function PreviewPanel({ composition }: PreviewPanelProps) {
  const isComplete =
    composition.selectedPersona &&
    composition.selectedProduct &&
    composition.selectedObjective;

  const isEmpty =
    !composition.selectedPersona &&
    !composition.selectedProduct &&
    !composition.selectedObjective;

  if (isEmpty) {
    return (
      <div className="text-left space-y-3">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-gray-400" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-1">Preview</h3>
            <p className="text-sm text-gray-600">
              Your composed objective will appear here
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Checklist */}
      <div className="space-y-3">
        <h3 className="font-medium text-gray-900 flex items-center">
          <CheckCircle className="w-4 h-4 mr-2" />
          Objective Progress
        </h3>

        <div className="flex items-center space-x-2">
          {composition.selectedProduct ? (
            <CheckCircle className="w-4 h-4 text-gray-900" />
          ) : (
            <Circle className="w-4 h-4 text-gray-400" />
          )}
          <span
            className={`text-sm ${composition.selectedProduct ? 'text-gray-900' : 'text-gray-500'}`}
          >
            Product
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            {composition.selectedPersona ? (
              <CheckCircle className="w-4 h-4 text-gray-900" />
            ) : (
              <Circle className="w-4 h-4 text-stone-400" />
            )}
            <span
              className={`text-sm ${composition.selectedPersona ? 'text-gray-900' : 'text-gray-500'}`}
            >
              Persona
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {composition.selectedObjective ? (
              <CheckCircle className="w-4 h-4 text-gray-900" />
            ) : (
              <Circle className="w-4 h-4 text-gray-400" />
            )}
            <span
              className={`text-sm ${composition.selectedObjective ? 'text-gray-900' : 'text-gray-500'}`}
            >
              Metric
            </span>
          </div>
        </div>
      </div>

      {/* Selected Components Summary */}
      {(composition.selectedPersona ||
        composition.selectedProduct ||
        composition.selectedObjective) && (
        <>
          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-medium text-gray-900 mb-3 text-left">
              Selected Components
            </h3>

            <div className="space-y-2">
              {composition.selectedProduct && (
                <div className="flex items-center space-x-2 text-left">
                  <Package className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {composition.selectedProduct.name}
                    </span>
                  </div>
                </div>
              )}

              {composition.selectedPersona && (
                <div className="flex items-center space-x-2 text-left">
                  <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {composition.selectedPersona.name}
                    </span>
                  </div>
                </div>
              )}

              {composition.selectedObjective && (
                <div className="flex items-center space-x-2 text-left">
                  <Target className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {composition.selectedObjective.title}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Generated Query Preview */}
      {isComplete && (
        <div className="border-t border-gray-200 pt-4">
          <h3 className="font-medium text-gray-900 mb-3 flex items-center">
            <ArrowRight className="w-4 h-4 mr-2" />
            Generated Query
          </h3>

          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-left text-gray-600 leading-relaxed">
              {generateQueryPreview(composition)}
            </p>
          </div>

          <div className="mt-3 text-left">
            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
              Ready to Execute
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function generateQueryPreview(composition: CompositionState): string {
  if (
    !composition.selectedPersona ||
    !composition.selectedProduct ||
    !composition.selectedObjective
  ) {
    return '';
  }

  const persona = composition.selectedPersona;
  const product = composition.selectedProduct;
  const objective = composition.selectedObjective;

  // Generate a sample query based on the composition
  const personaDesc = persona.occupation.join(', ');
  const productType = product.productType.replace(/_/g, ' ').toLowerCase();

  let queryTemplate = '';

  switch (objective.type) {
    case 'TOP_5_RECOMMENDATIONS':
      queryTemplate = `What are the top 5 ${productType} tools for ${personaDesc} professionals? Please provide specific recommendations with pros and cons.`;
      break;
    case 'TOP_10_RECOMMENDATIONS':
      queryTemplate = `What are the top 10 ${productType} solutions for ${personaDesc}? Please rank them by suitability.`;
      break;
    case 'COMPETITOR_ANALYSIS':
      queryTemplate = `Analyze the competitive landscape for ${productType} tools targeting ${personaDesc}. How does ${product.name} compare?`;
      break;
    case 'PROS_AND_CONS':
      queryTemplate = `What are the pros and cons of ${product.name} for ${personaDesc} professionals?`;
      break;
    case 'MARKET_POSITION':
      queryTemplate = `What is the market position of ${product.name} in the ${productType} space for ${personaDesc}?`;
      break;
    case 'PRICING_ANALYSIS':
      queryTemplate = `How does ${product.name} pricing compare to other ${productType} solutions for ${personaDesc}?`;
      break;
    default:
      queryTemplate = `Evaluate ${product.name} as a ${productType} solution for ${personaDesc} professionals.`;
  }

  return queryTemplate;
}
