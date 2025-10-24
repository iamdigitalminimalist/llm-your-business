import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  Persona as DbPersona,
  Product as DbProduct,
  Objective as DbObjective,
  Execution as DbExecution,
} from '@shared/db/types';

// Client types using Pick from shared db types
export type Persona = Pick<
  DbPersona,
  'id' | 'name' | 'occupation' | 'technicalSkills' | 'goals' | 'motivations'
> & { description?: string; createdAt?: string };
export type Product = Pick<
  DbProduct,
  'id' | 'name' | 'productType' | 'partnerId'
> & { description?: string; isActive?: boolean };
export type Objective = Pick<
  DbObjective,
  'id' | 'type' | 'title' | 'description'
> & { isActive?: boolean; createdAt?: string; models?: string[] };
export type Execution = Pick<
  DbExecution,
  | 'id'
  | 'partnerId'
  | 'productId'
  | 'objectiveId'
  | 'status'
  | 'startedAt'
  | 'completedAt'
>;

// Utility function to convert snake_case to camelCase recursively
const toCamelCase = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
        letter.toUpperCase()
      );
      acc[camelKey] = toCamelCase(obj[key]);
      return acc;
    }, {} as any);
  }
  return obj;
};

// API functions
const fetchPersonas = async (): Promise<Persona[]> => {
  const response = await fetch('/api/personas');
  if (!response.ok) {
    throw new Error('Failed to fetch personas');
  }
  const result = await response.json();
  const camelResult = toCamelCase(result);
  if (!camelResult.success) {
    throw new Error(camelResult.message || 'Failed to fetch personas');
  }
  return camelResult.data;
};

const fetchProducts = async (): Promise<Product[]> => {
  const response = await fetch('/api/products');
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  const result = await response.json();
  const camelResult = toCamelCase(result);
  if (!camelResult.success) {
    throw new Error(camelResult.message || 'Failed to fetch products');
  }
  return camelResult.data;
};

const fetchObjectives = async (): Promise<Objective[]> => {
  const response = await fetch('/api/objectives');
  if (!response.ok) {
    throw new Error('Failed to fetch objectives');
  }
  const result = await response.json();
  const camelResult = toCamelCase(result);
  if (!camelResult.success) {
    throw new Error(camelResult.message || 'Failed to fetch objectives');
  }
  return camelResult.data;
};

const createExecution = async (executionData: {
  partnerId: string;
  productId: string;
  objectiveId: string;
}): Promise<Execution> => {
  const response = await fetch('/api/executions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      partner_id: executionData.partnerId,
      product_id: executionData.productId,
      objective_id: executionData.objectiveId,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create execution');
  }

  const result = await response.json();
  const camelResult = toCamelCase(result);
  if (!camelResult.success) {
    throw new Error(camelResult.message || 'Failed to create execution');
  }

  return camelResult.data;
};

// React Query hooks
export const usePersonas = () => {
  return useQuery({
    queryKey: ['personas'],
    queryFn: fetchPersonas,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useObjectives = () => {
  return useQuery({
    queryKey: ['objectives'],
    queryFn: fetchObjectives,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateExecution = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createExecution,
    onSuccess: () => {
      // Invalidate executions queries if they exist
      queryClient.invalidateQueries({ queryKey: ['executions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

// Utility functions for composition
export const isCompositionComplete = (composition: {
  selectedPersona: Persona | null;
  selectedProduct: Product | null;
  selectedObjective: Objective | null;
}): boolean => {
  return !!(
    composition.selectedPersona &&
    composition.selectedProduct &&
    composition.selectedObjective
  );
};

export const generateExecutionData = (composition: {
  selectedPersona: Persona | null;
  selectedProduct: Product | null;
  selectedObjective: Objective | null;
}) => {
  if (!isCompositionComplete(composition)) {
    throw new Error('Composition is not complete');
  }

  return {
    partnerId: composition.selectedProduct!.partnerId,
    productId: composition.selectedProduct!.id,
    objectiveId: composition.selectedObjective!.id,
    // Additional context can be added here
    personaContext: {
      name: composition.selectedPersona!.name,
      occupation: composition.selectedPersona!.occupation,
      technicalSkills: composition.selectedPersona!.technicalSkills,
      goals: composition.selectedPersona!.goals,
      motivations: composition.selectedPersona!.motivations,
    },
  };
};
