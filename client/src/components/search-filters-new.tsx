import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";

interface SearchFiltersProps {
  onFiltersChange: (filters: any) => void;
}

export default function SearchFilters({ onFiltersChange }: SearchFiltersProps) {
  const [search, setSearch] = useState("");
  const [association, setAssociation] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [nationalProgram, setNationalProgram] = useState("");
  const [noAdditionalFee, setNoAdditionalFee] = useState(false);

  // 협회 목록
  const associations = [
    "한국상담심리학회",
    "한국임상심리학회", 
    "한국상담학회",
    "한국심리학회",
    "한국정신분석학회",
    "한국가족치료학회",
    "한국인지행동치료학회"
  ];

  // 전문분야 목록
  const specializations = [
    "아동/청소년",
    "성인 개인상담",
    "부부/가족상담",
    "트라우마",
    "우울/불안",
    "성격장애",
    "중독상담",
    "진로상담",
    "학습상담"
  ];

  useEffect(() => {
    const activeFilters = {
      search: search.trim() || undefined,
      association: association && association !== "all" ? association : undefined,
      specialization: specialization && specialization !== "all" ? specialization : undefined,
      participatesInNationalProgram: nationalProgram === "true" ? true : nationalProgram === "false" ? false : undefined,
      noAdditionalFee: noAdditionalFee || undefined,
    };
    onFiltersChange(activeFilters);
  }, [search, association, specialization, nationalProgram, noAdditionalFee, onFiltersChange]);

  const clearFilters = () => {
    setSearch("");
    setAssociation("");
    setSpecialization("");
    setNationalProgram("");
    setNoAdditionalFee(false);
  };

  const getActiveFilters = () => {
    const filters = [];
    if (search.trim()) filters.push({ type: 'search', label: `"${search}"`, clear: () => setSearch("") });
    if (association) filters.push({ type: 'association', label: association, clear: () => setAssociation("") });
    if (specialization) filters.push({ type: 'specialization', label: specialization, clear: () => setSpecialization("") });
    if (nationalProgram === "true") filters.push({ type: 'nationalProgram', label: "전마투 가능", clear: () => setNationalProgram("") });
    if (nationalProgram === "false") filters.push({ type: 'nationalProgram', label: "전마투 불가", clear: () => setNationalProgram("") });
    if (noAdditionalFee) filters.push({ type: 'noAdditionalFee', label: "추가요금 없음", clear: () => setNoAdditionalFee(false) });
    return filters;
  };

  return (
    <section className="bg-white py-6 shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 검색바 */}
        <div className="flex flex-col gap-4 mb-4">
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

          {/* 필터 옵션들 */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Select value={association} onValueChange={setAssociation}>
              <SelectTrigger>
                <SelectValue placeholder="소속협회" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                {associations.map((assoc) => (
                  <SelectItem key={assoc} value={assoc}>{assoc}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={specialization} onValueChange={setSpecialization}>
              <SelectTrigger>
                <SelectValue placeholder="전문분야" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                {specializations.map((spec) => (
                  <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={nationalProgram} onValueChange={setNationalProgram}>
              <SelectTrigger>
                <SelectValue placeholder="전마투" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="true">가능</SelectItem>
                <SelectItem value="false">불가</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant={noAdditionalFee ? "default" : "outline"}
              size="sm"
              onClick={() => setNoAdditionalFee(!noAdditionalFee)}
              className="h-10"
            >
              추가요금 없음
            </Button>

            {getActiveFilters().length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-10">
                전체 초기화
              </Button>
            )}
          </div>
        </div>

        {/* 활성 필터 태그 */}
        {getActiveFilters().length > 0 && (
          <div className="flex flex-wrap gap-2">
            {getActiveFilters().map((filter, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {filter.label}
                <button
                  onClick={filter.clear}
                  className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}