import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Building2,
  Target,
  BarChart3,
  TrendingUp,
  Plus,
  Users,
  FileText,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

import { useDashboardStats, useRecentEvaluations } from './dashboard.api';
import { getStatusIcon, getStatusText } from './dashboard.util';

export function Dashboard() {
  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
    refetch: refetchStats,
  } = useDashboardStats();

  const {
    data: recentEvaluations = [],
    isLoading: evaluationsLoading,
    isError: evaluationsError,
    refetch: refetchEvaluations,
  } = useRecentEvaluations(5);

  const isLoading = statsLoading || evaluationsLoading;
  const hasError = statsError || evaluationsError;

  const handleRefresh = () => {
    refetchStats();
    refetchEvaluations();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-stone-600 font-medium">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
          <p className="text-stone-600 mb-4 font-medium">
            Failed to load dashboard data
          </p>
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="rounded-xl border-stone-300 hover:bg-stone-200 hover:border-stone-400 text-stone-700 hover:text-stone-800 font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-stone-200/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl text-left font-semibold text-stone-800 tracking-tight">
                  LLM Your Business
                </h1>
                <p className="text-sm text-stone-500 font-medium mt-0.5">
                  Market positioning insights through AI evaluation
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                disabled={isLoading}
                className="rounded-xl border-stone-300 hover:bg-stone-200 hover:border-stone-400 text-stone-700 hover:text-stone-800 font-medium transition-colors"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}
                />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-stone-300 hover:bg-stone-200 hover:border-stone-400 text-stone-700 hover:text-stone-800 font-medium transition-colors"
              >
                <Users className="w-4 h-4 mr-2" />
                Profile
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-stone-300 hover:bg-stone-200 hover:border-stone-400 text-stone-700 hover:text-stone-800 font-medium transition-colors"
              >
                Settings
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-stone-300 hover:bg-stone-200 hover:border-stone-400 text-stone-700 hover:text-stone-800 font-medium transition-colors"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
          {/* Stats Cards */}
          <div className="lg:col-span-3">
            <h2 className="text-xl text-left font-semibold text-stone-800 mb-6 tracking-tight">
              📊 Overview Metrics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-white/60 backdrop-blur-sm border-stone-200/50 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-6">
                  <CardTitle className="text-sm font-semibold text-stone-700 tracking-wide">
                    Total Partners
                  </CardTitle>
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-orange-600" />
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="text-3xl font-bold text-stone-800 tracking-tight">
                    {stats?.totalPartners || 0}
                  </div>
                  <p className="text-xs text-stone-500 font-medium mt-2">
                    Active business clients
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/60 backdrop-blur-sm border-stone-200/50 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-6">
                  <CardTitle className="text-sm font-semibold text-stone-700 tracking-wide">
                    Active Objectives
                  </CardTitle>
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <Target className="w-5 h-5 text-green-700" />
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="text-3xl font-bold text-stone-800 tracking-tight">
                    {stats?.activeObjectives || 0}
                  </div>
                  <p className="text-xs text-stone-500 font-medium mt-2">
                    Configured evaluations
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/60 backdrop-blur-sm border-stone-200/50 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-6">
                  <CardTitle className="text-sm font-semibold text-stone-700 tracking-wide">
                    Evaluations
                  </CardTitle>
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="text-3xl font-bold text-stone-800 tracking-tight">
                    {stats?.totalEvaluations || 0}
                  </div>
                  <p className="text-xs text-stone-500 font-medium mt-2">
                    Total LLM evaluations
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/60 backdrop-blur-sm border-stone-200/50 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-6">
                  <CardTitle className="text-sm font-semibold text-stone-700 tracking-wide">
                    Success Rate
                  </CardTitle>
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="text-3xl font-bold text-stone-800 tracking-tight">
                    {stats?.successRate || 0}%
                  </div>
                  <p className="text-xs text-stone-500 font-medium mt-2">
                    Successful mentions
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <h2 className="text-xl text-left font-semibold text-stone-800 mb-6 tracking-tight">
              🎯 Quick Actions
            </h2>
            <Card className="bg-white/60 backdrop-blur-sm border-stone-200/50 rounded-2xl shadow-sm">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Button className="w-full justify-start rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 transition-colors">
                    <Plus className="w-4 h-4 mr-3" />
                    New Evaluation
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start rounded-xl border-stone-300 hover:bg-stone-200 hover:border-stone-400 text-stone-700 hover:text-stone-800 font-medium py-3 transition-colors"
                  >
                    <Building2 className="w-4 h-4 mr-3" />
                    Add Partner
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start rounded-xl border-stone-300 hover:bg-stone-200 hover:border-stone-400 text-stone-700 hover:text-stone-800 font-medium py-3 transition-colors"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    View Reports
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Evaluations */}
        <div className="mb-12">
          <h2 className="text-xl text-left font-semibold text-stone-800 mb-6 tracking-tight">
            📈 Recent Evaluations
          </h2>
          <Card className="bg-white/60 backdrop-blur-sm border-stone-200/50 rounded-2xl shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-stone-50/50 border-b border-stone-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-stone-600 uppercase tracking-wide">
                        Partner
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-stone-600 uppercase tracking-wide">
                        Product
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-stone-600 uppercase tracking-wide">
                        Objective
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-stone-600 uppercase tracking-wide">
                        Models
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-stone-600 uppercase tracking-wide">
                        Score
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-stone-600 uppercase tracking-wide">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentEvaluations.length > 0 ? (
                      recentEvaluations.map((evaluation) => (
                        <tr key={evaluation.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-left">
                            <div className="text-sm font-medium text-gray-900">
                              {evaluation.partnerName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-left">
                            <div className="text-sm text-gray-900 max-w-xs truncate">
                              {evaluation.productName}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate text-left">
                              {evaluation.objectiveTitle}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">
                              {evaluation.modelCount}/{evaluation.totalModels}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-gray-900">
                              {evaluation.avgScore
                                ? evaluation.avgScore.toFixed(1)
                                : '-'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(evaluation.status)}
                              <span className="text-sm text-gray-900">
                                {getStatusText(evaluation.status)}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center">
                          <div className="text-gray-500">
                            <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                            <p className="text-sm">No evaluations yet</p>
                            <p className="text-xs text-gray-400">
                              Create your first evaluation to see results here
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
