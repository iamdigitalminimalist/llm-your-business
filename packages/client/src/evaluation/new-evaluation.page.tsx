import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CreateObjectiveRequestSchema,
  type CreateObjectiveRequest,
} from '@shared/db/api-types';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/header';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Building2,
  Target,
  Brain,
  AlertCircle,
  CheckCircle,
  Plus,
  X,
  Check,
  ChevronsUpDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

import {
  usePartners,
  useProductsByPartner,
  useCreateEvaluationWorkflow,
} from './evaluation.api';

const AVAILABLE_MODELS = [
  { id: 'GPT_4O', name: 'GPT-4O' },
  { id: 'GPT_4O_MINI', name: 'GPT-4O Mini' },
  { id: 'CLAUDE_3_5_SONNET', name: 'Claude 3.5 Sonnet' },
  { id: 'GEMINI_PRO', name: 'Gemini Pro' },
];

export function NewEvaluation() {
  const navigate = useNavigate();
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(
    null
  );

  const form = useForm<CreateObjectiveRequest>({
    resolver: zodResolver(CreateObjectiveRequestSchema),
    defaultValues: {
      partnerId: '',
      productId: '',
      title: '',
      question: '',
      llmModels: [],
    },
  });

  const { data: partners = [], isLoading: partnersLoading } = usePartners();
  const { data: products = [], isLoading: productsLoading } =
    useProductsByPartner(selectedPartnerId);

  const createEvaluationMutation = useCreateEvaluationWorkflow();
  const watchedPartnerId = form.watch('partnerId');

  useEffect(() => {
    if (watchedPartnerId !== selectedPartnerId) {
      setSelectedPartnerId(watchedPartnerId || null);
      if (watchedPartnerId) {
        form.setValue('productId', ''); // Reset product selection when partner changes
      }
    }
  }, [watchedPartnerId, selectedPartnerId, form]);

  const handleModelToggle = (modelId: string) => {
    const currentModels = form.getValues('llmModels');
    const newModels = currentModels.includes(modelId as any)
      ? currentModels.filter((id) => id !== modelId)
      : [...currentModels, modelId as any];

    form.setValue('llmModels', newModels);
    form.trigger('llmModels');
  };

  const handleSubmit = async (data: CreateObjectiveRequest) => {
    const requestData = {
      title: data.title,
      question: data.question,
      partnerId: data.partnerId,
      productId: data.productId,
      llmModels: data.llmModels,
    };

    console.debug('Creating evaluation with data:', requestData);

    createEvaluationMutation.mutate(requestData, {
      onSuccess: (result) => {
        console.debug('Evaluation created successfully:', result);
        navigate('/', {
          state: {
            message: `Evaluation "${result.objective.title}" created successfully with ${result.evaluations.length} AI model(s)!`,
            type: 'success',
          },
        });
      },
      onError: (error) => {
        console.error('Failed to create evaluation:', error);
      },
    });
  };
  return (
    <div className="min-h-screen bg-stone-50">
      <Header
        title="New Evaluation"
        subtitle="Configure AI evaluation for business positioning"
        showBackButton={true}
      />

      <main className="max-w-4xl mx-auto px-6 lg:px-8 py-12">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-8"
          >
            {/* Partner & Product Information */}
            <Card className="bg-white/60 backdrop-blur-sm border-stone-200/50 rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-stone-800 flex items-center">
                  <Building2 className="w-5 h-5 mr-3 text-orange-600" />
                  Partner & Product Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Partner Selection */}
                  <FormField
                    control={form.control}
                    name="partnerId"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-sm font-semibold text-stone-700 mb-3">
                          Partner *
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  'w-full justify-between rounded-xl border-stone-200 bg-white/80 px-4 py-3 text-left font-normal hover:bg-white/90 hover:text-stone-800 text-stone-700',
                                  !field.value &&
                                    'text-stone-400 hover:text-stone-500'
                                )}
                              >
                                {field.value
                                  ? partners.find(
                                      (partner) => partner.id === field.value
                                    )?.name
                                  : 'Select partner...'}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0" align="start">
                            <Command>
                              <CommandInput
                                placeholder="Search partners..."
                                className="h-9"
                              />
                              <CommandEmpty>
                                {partnersLoading
                                  ? 'Loading partners...'
                                  : 'No partners found.'}
                              </CommandEmpty>
                              <CommandGroup>
                                {partners.map((partner) => (
                                  <CommandItem
                                    value={partner.name}
                                    key={partner.id}
                                    onSelect={() => {
                                      form.setValue('partnerId', partner.id);
                                      form.setValue('productId', ''); // Reset product when partner changes
                                    }}
                                    className="text-stone-800 hover:text-stone-900 hover:bg-stone-100/80 cursor-pointer"
                                  >
                                    {partner.name}
                                    <Check
                                      className={cn(
                                        'ml-auto h-4 w-4',
                                        partner.id === field.value
                                          ? 'opacity-100'
                                          : 'opacity-0'
                                      )}
                                    />
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Product Selection */}
                  <FormField
                    control={form.control}
                    name="productId"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-sm font-semibold text-stone-700 mb-3">
                          Product *
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                disabled={!selectedPartnerId || productsLoading}
                                className={cn(
                                  'w-full justify-between rounded-xl border-stone-200 bg-white/80 px-4 py-3 text-left font-normal hover:bg-white/90 hover:text-stone-800 text-stone-700',
                                  !field.value &&
                                    'text-stone-400 hover:text-stone-500'
                                )}
                              >
                                {field.value
                                  ? products.find(
                                      (product) => product.id === field.value
                                    )?.name
                                  : selectedPartnerId
                                    ? productsLoading
                                      ? 'Loading products...'
                                      : 'Select product...'
                                    : 'First select a partner'}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0" align="start">
                            <Command>
                              <CommandInput
                                placeholder="Search products..."
                                className="h-9"
                              />
                              <CommandEmpty>
                                {productsLoading
                                  ? 'Loading products...'
                                  : 'No products found.'}
                              </CommandEmpty>
                              <CommandGroup>
                                {products.map((product) => (
                                  <CommandItem
                                    value={product.name}
                                    key={product.id}
                                    onSelect={() => {
                                      form.setValue('productId', product.id);
                                    }}
                                    className="text-stone-800 hover:text-stone-900 hover:bg-stone-100/80 cursor-pointer"
                                  >
                                    {product.name}
                                    <Check
                                      className={cn(
                                        'ml-auto h-4 w-4',
                                        product.id === field.value
                                          ? 'opacity-100'
                                          : 'opacity-0'
                                      )}
                                    />
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>{' '}
            {/* Evaluation Objective */}
            {/* Evaluation Objective */}
            <Card className="bg-white/60 backdrop-blur-sm border-stone-200/50 rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-stone-800 flex items-center">
                  <Target className="w-5 h-5 mr-3 text-green-600" />
                  Evaluation Objective
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-stone-700">
                        Objective Title *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Market Position Assessment"
                          {...field}
                          className="rounded-xl border-stone-200 bg-white/80 px-4 py-3 placeholder-stone-400 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="question"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-stone-700">
                        Objective Description *
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe what you want to evaluate about your partner's product positioning in the market..."
                          rows={4}
                          {...field}
                          className="rounded-xl border-stone-200 bg-white/80 px-4 py-3 placeholder-stone-400 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>{' '}
            {/* Model Selection */}
            {/* Model Selection */}
            <Card className="bg-white/60 backdrop-blur-sm border-stone-200/50 rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-stone-800 flex items-center">
                  <Brain className="w-5 h-5 mr-3 text-blue-600" />
                  Select AI Models
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="llmModels"
                  render={({ field }) => (
                    <FormItem>
                      <FormDescription className="text-sm text-left text-stone-600 mb-6">
                        Choose which AI models to use for this evaluation.
                        Multiple models provide better insights.
                      </FormDescription>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {AVAILABLE_MODELS.map((model) => {
                          const isSelected = field.value.includes(
                            model.id as any
                          );
                          return (
                            <button
                              key={model.id}
                              type="button"
                              onClick={() => handleModelToggle(model.id)}
                              className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                                isSelected
                                  ? 'border-orange-400 bg-orange-50 text-orange-800'
                                  : 'border-stone-200 bg-white/60 hover:border-stone-300 text-stone-700'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium">
                                  {model.name}
                                </span>
                                {isSelected ? (
                                  <CheckCircle className="w-5 h-5 text-orange-600" />
                                ) : (
                                  <Plus className="w-5 h-5 text-stone-400" />
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      <FormMessage />
                      {field.value.length > 0 && (
                        <div className="mt-4 p-4 rounded-xl bg-stone-50 border border-stone-200">
                          <p className="text-sm font-medium text-stone-700 mb-2">
                            Selected Models ({field.value.length})
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {field.value.map((modelId: string) => {
                              const model = AVAILABLE_MODELS.find(
                                (m) => m.id === modelId
                              );
                              return (
                                <span
                                  key={modelId}
                                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200"
                                >
                                  {model?.name}
                                  <button
                                    type="button"
                                    onClick={() => handleModelToggle(modelId)}
                                    className="ml-2 hover:bg-orange-200 rounded-full p-0.5 transition-colors"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>{' '}
            {/* Submit Section */}
            <div className="flex items-center justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
                className="rounded-xl border-stone-300 hover:bg-stone-200 hover:border-stone-400 text-stone-700 hover:text-stone-800 font-medium transition-colors"
              >
                Cancel
              </Button>

              <div className="flex items-center space-x-4">
                {createEvaluationMutation.isError && (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {createEvaluationMutation.error?.message ||
                      'Failed to create evaluation. Please try again.'}
                  </p>
                )}
                <Button
                  type="submit"
                  disabled={createEvaluationMutation.isPending}
                  className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-medium px-8 py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createEvaluationMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Evaluation...
                    </>
                  ) : (
                    <>
                      <Target className="w-4 h-4 mr-2" />
                      Create Evaluation
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
}
