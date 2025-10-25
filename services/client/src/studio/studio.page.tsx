import React, { useState, useRef } from 'react';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { User, Package, Target, Play, Save, RefreshCw } from 'lucide-react';
import { ProductCard } from './components/product-card';
import { ObjectiveCard } from './components/objective-card';
import { CompositionCanvas } from './components/composition-canvas';
import { PreviewPanel } from './components/preview-panel';
import { PersonaCard } from './components/persona-card';
import {
  usePersonas,
  useProducts,
  useObjectives,
  useCreateExecution,
  isCompositionComplete,
  generateExecutionData,
  type Persona,
  type Product,
  type Objective,
} from './studio.api';

interface CompositionState {
  selectedPersona: Persona | null;
  selectedProduct: Product | null;
  selectedObjective: Objective | null;
}

export function StudioPage() {
  // Helper to get section positions and update activeTab on scroll
  // Improved: Use intersection width to determine most visible section
  const handleCarouselScroll = () => {
    if (!carouselRef.current) return;
    const carousel = carouselRef.current;
    const sections = ['products', 'personas', 'objectives'];
    let maxIntersection = 0;
    let mostVisibleSection = 'products';
    const carouselRect = carousel.getBoundingClientRect();
    sections.forEach((sectionId) => {
      const section = document.getElementById(sectionId);
      if (section) {
        const rect = section.getBoundingClientRect();
        // Calculate intersection width
        const left = Math.max(rect.left, carouselRect.left);
        const right = Math.min(rect.right, carouselRect.right);
        const intersection = Math.max(0, right - left);
        if (intersection > maxIntersection) {
          maxIntersection = intersection;
          mostVisibleSection = sectionId;
        }
      }
    });
    setActiveTab(mostVisibleSection as 'products' | 'personas' | 'objectives');
  };

  // Attach scroll listener
  React.useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    carousel.addEventListener('scroll', handleCarouselScroll);
    // Initial check
    handleCarouselScroll();
    return () => {
      carousel.removeEventListener('scroll', handleCarouselScroll);
    };
  }, []);
  const [composition, setComposition] = useState<CompositionState>({
    selectedPersona: null,
    selectedProduct: null,
    selectedObjective: null,
  });

  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<any>(null);

  // Tab state for category selection
  const [activeTab, setActiveTab] = useState<
    'products' | 'personas' | 'objectives'
  >('products');

  // Carousel ref and scroll function
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (
    sectionId: 'products' | 'personas' | 'objectives'
  ) => {
    setActiveTab(sectionId);
    const section = document.getElementById(sectionId);
    if (section && carouselRef.current) {
      section.scrollIntoView({ behavior: 'smooth', inline: 'start' });
    }
  };

  // API hooks
  const {
    data: personas = [],
    isLoading: personasLoading,
    error: personasError,
  } = usePersonas();
  const {
    data: products = [],
    isLoading: productsLoading,
    error: productsError,
  } = useProducts();
  const {
    data: objectives = [],
    isLoading: objectivesLoading,
    error: objectivesError,
  } = useObjectives();
  const { mutate: createExecution, isPending: isCreating } =
    useCreateExecution();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);

    // Find the dragged item
    const itemType = active.data.current?.type;
    const itemId = active.id as string;

    let item = null;
    if (itemType === 'persona') {
      item = personas.find((p: Persona) => p.id === itemId);
    } else if (itemType === 'product') {
      item = products.find((p: Product) => p.id === itemId);
    } else if (itemType === 'objective') {
      item = objectives.find((o: Objective) => o.id === itemId);
    }

    setDraggedItem(item);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && over.id === 'composition-canvas') {
      const itemType = active.data.current?.type;
      const itemId = active.id as string;

      if (itemType === 'persona') {
        const persona = personas.find((p: Persona) => p.id === itemId);
        setComposition((prev) => ({
          ...prev,
          selectedPersona: persona || null,
        }));
      } else if (itemType === 'product') {
        const product = products.find((p: Product) => p.id === itemId);
        setComposition((prev) => ({
          ...prev,
          selectedProduct: product || null,
        }));
      } else if (itemType === 'objective') {
        const objective = objectives.find((o: Objective) => o.id === itemId);
        setComposition((prev) => ({
          ...prev,
          selectedObjective: objective || null,
        }));
      }
    }

    setActiveId(null);
    setDraggedItem(null);
  };

  const resetComposition = () => {
    setComposition({
      selectedPersona: null,
      selectedProduct: null,
      selectedObjective: null,
    });
  };

  const handleExecuteObjective = () => {
    if (!isCompositionComplete(composition)) {
      return;
    }

    try {
      const executionData = generateExecutionData(composition);
      createExecution(executionData, {
        onSuccess: (execution) => {
          console.log('Execution created successfully:', execution);
          // Could navigate to execution details or show success message
        },
        onError: (error) => {
          console.error('Failed to create execution:', error);
          // Could show error message to user
        },
      });
    } catch (error) {
      console.error('Error generating execution data:', error);
    }
  };

  const isLoading = personasLoading || productsLoading || objectivesLoading;
  const hasError = personasError || productsError || objectivesError;
  const compositionComplete = isCompositionComplete(composition);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0">
          <Header
            title="Studio"
            subtitle="Compose with ease"
            showBackButton={true}
          />
        </div>

        <div className="flex-1 px-4 py-4 overflow-hidden">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-900 mx-auto"></div>
                <p className="mt-3 text-gray-600 text-sm">Loading...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {hasError && !isLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-red-600 text-sm mb-2">Failed to load data</p>
                <p className="text-gray-500 text-xs">Please refresh the page</p>
              </div>
            </div>
          )}

          {/* Main Content */}
          {!isLoading && !hasError && (
            <div className="flex flex-col gap-4 h-full max-w-7xl mx-auto w-full">
              {/* Component Carousel - Top Section (1/4 height) */}
              <div className="h-1/4 bg-white rounded border border-gray-200 flex flex-col">
                {/* Carousel Navigation */}
                <div className="flex items-center px-4 py-3 border-b border-gray-100">
                  <div className="flex space-x-4">
                    <button
                      onClick={() => scrollToSection('products')}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                        ${activeTab === 'products' ? 'bg-gray-100 text-gray-900 font-semibold shadow-sm' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'}`}
                    >
                      <Package className="w-4 h-4 mr-2" />
                      Products
                    </button>
                    <button
                      onClick={() => scrollToSection('personas')}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                        ${activeTab === 'personas' ? 'bg-gray-100 text-gray-900 font-semibold shadow-sm' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'}`}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Personas
                    </button>
                    <button
                      onClick={() => scrollToSection('objectives')}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                        ${activeTab === 'objectives' ? 'bg-gray-100 text-gray-900 font-semibold shadow-sm' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'}`}
                    >
                      <Target className="w-4 h-4 mr-2" />
                      Metrics
                    </button>
                  </div>
                </div>

                {/* Carousel Content */}
                <div
                  ref={carouselRef}
                  className="flex-1 overflow-x-auto overflow-y-hidden bg-white"
                  style={{ scrollBehavior: 'smooth' }}
                >
                  <div className="flex h-full">
                    {/* Products Section */}
                    <div
                      id="products"
                      className="min-w-0 flex-shrink-0 p-4"
                      style={{ width: 'calc(100vw - 2rem)' }}
                    >
                      <div className="flex gap-3 h-full overflow-y-auto">
                        <div className="flex gap-3">
                          {products.map((product) => (
                            <div key={product.id} className="flex-shrink-0">
                              <ProductCard product={product} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Personas Section */}
                    <div
                      id="personas"
                      className="min-w-0 flex-shrink-0 p-4"
                      style={{ width: 'calc(100vw - 2rem)' }}
                    >
                      <div className="flex gap-3 h-full overflow-y-auto">
                        <div className="flex gap-3">
                          {personas.map((persona) => (
                            <div key={persona.id} className="flex-shrink-0">
                              <PersonaCard persona={persona} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Objectives Section */}
                    <div
                      id="objectives"
                      className="min-w-0 flex-shrink-0 p-4"
                      style={{ width: 'calc(100vw - 2rem)' }}
                    >
                      <div className="flex gap-3 h-full overflow-y-auto">
                        <div className="flex gap-3">
                          {objectives.map((objective) => (
                            <div key={objective.id} className="flex-shrink-0">
                              <ObjectiveCard objective={objective} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Section (3/4 height) - Canvas and Preview */}
              <div className="h-3/4 flex gap-4">
                {/* Composition Canvas - Left (2/3 width) */}
                <div className="w-2/3 h-full flex-shrink-0 overflow-hidden">
                  <CompositionCanvas
                    composition={composition}
                    onRemoveItem={(type: string) => {
                      setComposition((prev) => ({
                        ...prev,
                        [`selected${type}`]: null,
                      }));
                    }}
                  />
                </div>

                {/* Preview & Actions - Right (1/3 width) */}
                <div className="w-1/3 space-y-4 h-full overflow-y-auto flex-shrink-0">
                  {/* Live Preview */}
                  <div className="bg-white rounded border border-gray-200">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <h3 className="text-sm font-medium text-gray-700">
                        Preview
                      </h3>
                    </div>
                    <div className="p-3">
                      <PreviewPanel composition={composition} />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="bg-white rounded border border-gray-200 p-4 space-y-3">
                    <Button
                      onClick={handleExecuteObjective}
                      disabled={!compositionComplete || isCreating}
                      className="w-full bg-gray-900 hover:bg-gray-800 text-white text-sm py-2 h-9 disabled:opacity-50"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {isCreating ? 'Creating...' : 'Execute'}
                    </Button>

                    <Button
                      onClick={() => console.log('Save composition')}
                      disabled={!compositionComplete}
                      variant="outline"
                      className="w-full border-gray-300 hover:bg-gray-50 text-sm py-2 h-9 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>

                    <Button
                      onClick={resetComposition}
                      variant="ghost"
                      className="w-full text-gray-600 hover:bg-gray-100 text-sm py-2 h-9"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeId && draggedItem ? (
            <div className="bg-white border border-gray-300 rounded p-2 shadow-lg">
              <div className="text-sm text-gray-800">
                {draggedItem.name || draggedItem.title}
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
