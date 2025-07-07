import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/header";
import { Brain, BookOpen, Search, Clock, User, ArrowRight, TrendingUp, Users, Award, RefreshCw, AlertCircle, Calendar } from "lucide-react";
import { Link } from "wouter";

interface PsychologyArticle {
  id: number;
  title: string;
  summary: string;
  content: string;
  category: string;
  publishedAt: string;
  readTime: string;
}

export default function PsychologyInfo() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const { data: articles = [], isLoading, error, refetch } = useQuery<PsychologyArticle[]>({
    queryKey: ["/api/psychology/articles"],
    retry: 1,
  });



  const categories = [
    { value: "연구동향", label: "연구 동향", color: "bg-blue-100 text-blue-800" },
    { value: "치료법", label: "치료법", color: "bg-green-100 text-green-800" },
    { value: "상담기법", label: "상담 기법", color: "bg-purple-100 text-purple-800" },
    { value: "일반", label: "일반", color: "bg-gray-100 text-gray-800" },
    { value: "상세분석", label: "상세 분석", color: "bg-orange-100 text-orange-800" }
  ];

  const filteredArticles = articles.filter((article) => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === "all" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    const categoryInfo = categories.find(cat => cat.value === category);
    return categoryInfo?.color || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <Brain className="mx-auto h-12 w-12 mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            최신 심리학 정보
          </h1>
          <p className="text-lg md:text-xl mb-6 opacity-90">
            최신 심리학 연구와 상담기법 정보
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="제목이나 내용으로 검색"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="카테고리" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 카테고리</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Card className="mb-6 border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <div>
                  <h3 className="font-semibold">정보를 가져올 수 없습니다</h3>
                  <p className="text-sm mt-1">
                    최신 심리학 정보를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
                  </p>
                  <Button 
                    onClick={() => refetch()} 
                    variant="outline" 
                    size="sm" 
                    className="mt-3"
                  >
                    다시 시도
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <BookOpen className="h-8 w-8 mx-auto mb-3 text-blue-600" />
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{articles.length}</h3>
              <p className="text-gray-600">최신 아티클</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-3 text-green-600" />
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {articles.filter(a => a.category === "연구동향").length}
              </h3>
              <p className="text-gray-600">연구 동향</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-3 text-purple-600" />
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {articles.filter(a => a.category === "치료법").length}
              </h3>
              <p className="text-gray-600">치료법</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Award className="h-8 w-8 mx-auto mb-3 text-orange-600" />
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {articles.filter(a => a.category === "상담기법").length}
              </h3>
              <p className="text-gray-600">상담 기법</p>
            </CardContent>
          </Card>
        </div>

        {/* Articles Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <Card key={article.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-3">
                    <Badge className={getCategoryColor(article.category)}>
                      {article.category}
                    </Badge>
                    <div className="text-right">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {article.readTime}
                      </div>
                    </div>
                  </div>
                  <CardTitle className="text-lg leading-tight">
                    {article.title}
                  </CardTitle>
                  <div className="flex items-center text-sm text-gray-500 mt-2">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{formatDate(article.publishedAt)}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {article.summary}
                  </p>
                  <Link href={`/psychology-info/article/${article.id}`}>
                    <Button className="w-full" variant="outline">
                      자세히 읽기
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Brain className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchTerm || selectedCategory ? "검색 결과가 없습니다" : "아티클이 없습니다"}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || selectedCategory 
                  ? "다른 검색어나 카테고리를 시도해보세요." 
                  : "최신 정보 업데이트를 클릭해서 새로운 아티클을 가져오세요."
                }
              </p>
              {searchTerm || (selectedCategory && selectedCategory !== "all") ? (
                <Button 
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("");
                  }}
                  variant="outline"
                >
                  필터 초기화
                </Button>
              ) : (
                <Button onClick={() => refetch()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  최신 정보 업데이트
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Category Overview */}
        {!isLoading && articles.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>카테고리별 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {categories.map((category) => {
                  const count = articles.filter(article => article.category === category.value).length;
                  if (count === 0) return null;
                  return (
                    <div 
                      key={category.value} 
                      className="text-center p-4 rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedCategory(category.value)}
                    >
                      <Badge className={`${category.color} mb-2`}>
                        {count}개
                      </Badge>
                      <h3 className="font-medium text-sm">{category.label}</h3>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}