'use client';

import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Calendar, Search, Filter } from 'lucide-react';
import { OutfitHistoryCard } from './outfit-history-card';
import { useTranslations } from 'next-intl';
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';

interface OutfitResult {
  id: string;
  userId: string;
  personImageUrl: string;
  topGarmentUrl?: string;
  bottomGarmentUrl?: string;
  resultImageUrl?: string;
  taskId: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED';
  createdAt: Date;
  updatedAt: Date;
}

interface OutfitHistoryListProps {
  results: OutfitResult[];
}

export function OutfitHistoryList({ results }: OutfitHistoryListProps) {
  const t = useTranslations('Dashboard.outfitHistory');
  const [filterType, setFilterType] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [customDate, setCustomDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // 处理搜索
  const handleSearch = useCallback(() => {
    setCurrentPage(1);
  }, []);

  // 处理回车键搜索
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  // 清除所有筛选条件
  const handleClearFilters = useCallback(() => {
    setFilterType('all');
    setCustomDate('');
    setSearchTerm('');
    setCurrentPage(1);
  }, []);

  // 筛选逻辑
  const filteredResults = useMemo(() => {
    let filtered = results;

    // 按日期筛选 - 使用数据库中的 created_at 字段
    if (filterType !== 'all') {
      const now = new Date();
      let startDate: Date;
      let endDate: Date;

      switch (filterType) {
        case 'today':
          startDate = startOfDay(now);
          endDate = endOfDay(now);
          break;
        case 'week':
          startDate = startOfDay(subDays(now, 7));
          endDate = endOfDay(now);
          break;
        case 'month':
          startDate = startOfDay(subDays(now, 30));
          endDate = endOfDay(now);
          break;
        case 'custom':
          if (customDate) {
            const selectedDate = new Date(customDate);
            startDate = startOfDay(selectedDate);
            endDate = endOfDay(selectedDate);
          } else {
            return filtered;
          }
          break;
        default:
          return filtered;
      }

      // 使用数据库中的 created_at 字段进行日期筛选
      filtered = filtered.filter(result => {
        const resultDate = new Date(result.createdAt);
        return isWithinInterval(resultDate, { start: startDate, end: endDate });
      });
    }

    // 按搜索词筛选
    if (searchTerm) {
      filtered = filtered.filter(result =>
        result.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.taskId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.status.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [results, filterType, customDate, searchTerm]);

  // 分页逻辑
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
  const paginatedResults = filteredResults.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleFilterChange = (value: string) => {
    setFilterType(value as any);
    setCurrentPage(1);
  };

  const handleCustomDateChange = (value: string) => {
    setCustomDate(value);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          {t('title')}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* 筛选和搜索栏 */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={filterType} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t('filters.all')}
                </SelectItem>
                <SelectItem value="today">
                  {t('filters.today')}
                </SelectItem>
                <SelectItem value="week">
                  {t('filters.week')}
                </SelectItem>
                <SelectItem value="month">
                  {t('filters.month')}
                </SelectItem>
                <SelectItem value="custom">
                  {t('filters.custom')}
                </SelectItem>
              </SelectContent>
            </Select>
            
            {filterType === 'custom' && (
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={customDate}
                  onChange={(e) => handleCustomDateChange(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-40"
                />
                <Button
                  onClick={handleSearch}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  搜索
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-1">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
          </div>

          {/* 清除筛选按钮 */}
          {(filterType !== 'all' || searchTerm || customDate) && (
            <Button
              onClick={handleClearFilters}
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
            >
              清除筛选
            </Button>
          )}
        </div>

        {/* 统计信息 */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {t('totalResults')} {filteredResults.length} {t('results')}
          </span>
          {totalPages > 1 && (
            <span>
              {t('page')} {currentPage} / {totalPages} {t('page')}
            </span>
          )}
        </div>

        {/* 结果列表 */}
        {paginatedResults.length > 0 ? (
          <div className="space-y-6">
            {paginatedResults.map((result) => (
              <OutfitHistoryCard key={result.id} result={result} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            {t('noResults')}
          </div>
        )}

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              {t('previous')}
            </Button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              {t('next')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 