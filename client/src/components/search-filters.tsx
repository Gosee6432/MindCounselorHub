import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Search, Filter, X, SlidersHorizontal } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";

interface SearchFiltersProps {
  onFiltersChange: (filters: any) => void;
}

export default function SearchFilters({ onFiltersChange }: SearchFiltersProps) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    qualifications: [] as string[],
    targetGroups: [] as string[],
    concernTypes: [] as string[],
    emotionSymptoms: [] as string[],
    specialExperiences: [] as string[],
    counselingMethods: [] as string[],
    canProvideClientExperience: undefined as boolean | undefined,
    participatesInNationalProgram: undefined as boolean | undefined,
    noAdditionalFee: undefined as boolean | undefined,
  });
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  // Update parent when filters change
  useEffect(() => {
    const activeFilters = {
      search: search.trim() || undefined,
      ...Object.fromEntries(
        Object.entries(filters).map(([key, value]) => [
          key,
          Array.isArray(value) ? (value.length > 0 ? value : undefined) : value
        ])
      )
    };
    onFiltersChange(activeFilters);
  }, [search, filters, onFiltersChange]);

  const handleArrayFilterChange = (category: keyof typeof filters, value: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      [category]: checked
        ? [...(prev[category] as string[]), value]
        : (prev[category] as string[]).filter(item => item !== value)
    }));
  };

  const handleBooleanFilterChange = (key: keyof typeof filters, value: boolean | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setSearch("");
    setFilters({
      qualifications: [],
      targetGroups: [],
      concernTypes: [],
      emotionSymptoms: [],
      specialExperiences: [],
      counselingMethods: [],
      canProvideClientExperience: undefined,
      participatesInNationalProgram: undefined,
      noAdditionalFee: undefined,
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (search.trim()) count++;
    Object.values(filters).forEach(value => {
      if (Array.isArray(value) && value.length > 0) count++;
      if (typeof value === 'boolean') count++;
    });
    return count;
  };

  const getActiveFilterTags = () => {
    const tags = [];
    
    if (search.trim()) {
      tags.push({ type: 'search', label: `"${search}"`, value: search });
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        value.forEach(item => {
          tags.push({ type: key, label: item, value: item });
        });
      } else if (typeof value === 'boolean') {
        const labels = {
          participatesInNationalProgram: '전마투 가능',
          noAdditionalFee: '추가요금 없음'
        };
        tags.push({ 
          type: key, 
          label: labels[key as keyof typeof labels] || String(value), 
          value: String(value) 
        });
      }
    });

    return tags;
  };

  const removeFilterTag = (type: string, value: string) => {
    if (type === 'search') {
      setSearch("");
    } else if (Array.isArray(filters[type as keyof typeof filters])) {
      handleArrayFilterChange(type as keyof typeof filters, value, false);
    } else {
      handleBooleanFilterChange(type as keyof typeof filters, undefined);
    }
  };

  const FilterSection = ({ title, options, filterKey }: { 
    title: string; 
    options: string[]; 
    filterKey: keyof typeof filters;
  }) => (
    <div className="space-y-3">
      <h4 className="font-medium text-gray-900">{title}</h4>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {options.map((option) => (
          <div key={option} className="flex items-center space-x-2">
            <Checkbox
              id={`${filterKey}-${option}`}
              checked={(filters[filterKey] as string[]).includes(option)}
              onCheckedChange={(checked) => 
                handleArrayFilterChange(filterKey, option, !!checked)
              }
            />
            <Label 
              htmlFor={`${filterKey}-${option}`}
              className="text-sm text-gray-700 cursor-pointer"
            >
              {option}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <section className="bg-white py-6 shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="수퍼바이저 이름, 소속, 전문분야로 검색"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2">
            <Button
              variant={filters.participatesInNationalProgram === true ? "default" : "outline"}
              size="sm"
              onClick={() => 
                handleBooleanFilterChange('participatesInNationalProgram', 
                  filters.participatesInNationalProgram === true ? undefined : true)
              }
            >
              전마투 가능
            </Button>
            
            <Button
              variant={filters.noAdditionalFee ? "default" : "outline"}
              size="sm"
              onClick={() => 
                handleBooleanFilterChange('noAdditionalFee', 
                  filters.noAdditionalFee ? undefined : true)
              }
            >
              추가요금 없음
            </Button>

            {/* More Filters Button */}
            <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="relative">
                  <Filter className="h-4 w-4 mr-1" />
                  더보기
                  {getActiveFilterCount() > 0 && (
                    <Badge className="ml-1 h-4 w-4 p-0 flex items-center justify-center text-xs bg-blue-500">
                      {getActiveFilterCount()}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="flex items-center justify-between">
                  <span>상세 필터</span>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    전체 초기화
                  </Button>
                </SheetTitle>
              </SheetHeader>

              <div className="space-y-6 mt-6">
                {/* Mobile Quick Filters */}
                <div className="lg:hidden space-y-4">
                  <div>
                    <Label className="text-sm font-medium">내담자 경험</Label>
                    <Select 
                      value={filters.canProvideClientExperience?.toString() || "all"} 
                      onValueChange={(value) => 
                        handleBooleanFilterChange('canProvideClientExperience', 
                          value === "all" ? undefined : value === "true")
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">전체</SelectItem>
                        <SelectItem value="true">가능</SelectItem>
                        <SelectItem value="false">불가능</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">마음투자사업</Label>
                    <Select 
                      value={filters.participatesInNationalProgram?.toString() || "all"} 
                      onValueChange={(value) => 
                        handleBooleanFilterChange('participatesInNationalProgram', 
                          value === "all" ? undefined : value === "true")
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">전체</SelectItem>
                        <SelectItem value="true">참여가능</SelectItem>
                        <SelectItem value="false">참여불가</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="noAdditionalFee"
                      checked={filters.noAdditionalFee === true}
                      onCheckedChange={(checked) => 
                        handleBooleanFilterChange('noAdditionalFee', 
                          checked ? true : undefined)
                      }
                    />
                    <Label htmlFor="noAdditionalFee" className="text-sm">
                      추가요금 없음
                    </Label>
                  </div>
                </div>

                {/* Detailed Filters */}
                <FilterSection 
                  title="학회 및 자격" 
                  options={CATEGORIES.qualifications} 
                  filterKey="qualifications" 
                />
                
                <FilterSection 
                  title="대상별" 
                  options={CATEGORIES.targetGroups} 
                  filterKey="targetGroups" 
                />
                
                <FilterSection 
                  title="고민상황별" 
                  options={CATEGORIES.concernTypes} 
                  filterKey="concernTypes" 
                />
                
                <FilterSection 
                  title="감정과 증상별" 
                  options={CATEGORIES.emotionSymptoms} 
                  filterKey="emotionSymptoms" 
                />
                
                <FilterSection 
                  title="특수 경험별" 
                  options={CATEGORIES.specialExperiences} 
                  filterKey="specialExperiences" 
                />
                
                <FilterSection 
                  title="상담 방식" 
                  options={CATEGORIES.counselingMethods} 
                  filterKey="counselingMethods" 
                />
              </div>

              <div className="mt-8 pt-4 border-t">
                <Button 
                  onClick={() => setIsFilterSheetOpen(false)} 
                  className="w-full"
                >
                  필터 적용
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Active Filter Tags */}
        {getActiveFilterTags().length > 0 && (
          <div className="flex flex-wrap gap-2">
            {getActiveFilterTags().map((tag, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {tag.label}
                <button
                  onClick={() => removeFilterTag(tag.type, tag.value)}
                  className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {getActiveFilterTags().length > 1 && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 px-2 text-xs">
                전체 초기화
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
