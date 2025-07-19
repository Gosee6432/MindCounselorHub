import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import SearchFilters from "@/components/search-filters-new";
import SupervisorCard from "@/components/supervisor-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, ClipboardList, MessageSquare, Shield, Heart, MessageCircle, User, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import type { Supervisor, CommunityPost, CounselingRecord } from "@shared/schema";

export default function Home() {
  const [filters, setFilters] = useState({});
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedRecord, setSelectedRecord] = useState<CounselingRecord | null>(null);

  const { data: supervisors = [], isLoading } = useQuery<Supervisor[]>({
    queryKey: ["/api/supervisors", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          if (Array.isArray(value)) {
            params.set(key, value.join(','));
          } else {
            params.set(key, value.toString());
          }
        }
      });
      
      const response = await fetch(`/api/supervisors?${params}`);
      if (!response.ok) throw new Error('Failed to fetch supervisors');
      return response.json();
    },
  });

  const { data: communityPosts = [] } = useQuery<CommunityPost[]>({
    queryKey: ["/api/community/posts"],
    queryFn: async () => {
      const response = await fetch('/api/community/posts');
      if (!response.ok) throw new Error('Failed to fetch community posts');
      return response.json();
    },
  });

  const { data: counselingRecords = [] } = useQuery<CounselingRecord[]>({
    queryKey: ["/api/counseling-records"],
    enabled: isAuthenticated,
    queryFn: async () => {
      const response = await fetch('/api/counseling-records');
      if (!response.ok) throw new Error('Failed to fetch counseling records');
      return response.json();
    },
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return `${Math.floor(diffMs / (1000 * 60))}분 전`;
    } else if (diffHours < 24) {
      return `${diffHours}시간 전`;
    } else if (diffDays < 7) {
      return `${diffDays}일 전`;
    } else {
      return `${date.getMonth() + 1}.${date.getDate()}. ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            수련생의 권익을 보호하는<br />
            <span className="text-blue-200">수퍼바이저 매칭 플랫폼</span>
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 hover:text-blue-700 min-w-[200px] font-semibold">
              수퍼바이저 찾기
            </Button>
            <Button 
              size="lg" 
              className="bg-blue-500 text-white border-2 border-white hover:bg-white hover:text-blue-600 min-w-[200px] font-semibold"
              onClick={() => setLocation('/register-supervisor')}
            >
              수퍼바이저 등록하기
            </Button>
          </div>
        </div>
      </section>

      {/* Search Filters */}
      <SearchFilters onFiltersChange={setFilters} />

      {/* Supervisor Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900">수퍼바이저 목록</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Users className="h-4 w-4" />
              <span>총 <span className="font-semibold text-blue-600">{supervisors.length}명</span>의 수퍼바이저</span>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                  <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="flex gap-2 mb-4">
                    <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                    <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                  </div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : supervisors.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">검색 결과가 없습니다</h4>
              <p className="text-gray-500">다른 필터 조건으로 다시 검색해보세요.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {supervisors.map((supervisor) => (
                <SupervisorCard key={supervisor.id} supervisor={supervisor} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Community Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">수련생 커뮤니티</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              익명으로 경험을 공유하고, 동료 수련생들과 소통하세요
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 mb-12">
            {/* Anonymous Board - Full Width */}
            <Card className="w-full">
              <CardContent className="p-10">
                <div className="flex items-center mb-8">
                  <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center mr-5">
                    <MessageSquare className="h-7 w-7 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-semibold text-gray-900">익명 게시판</h4>
                    <p className="text-gray-600 text-lg">동료들과 익명으로 경험을 나누세요</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
                  {communityPosts.slice(0, 3).map((post, index) => (
                    <div 
                      key={post.id}
                      className="p-5 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => window.location.href = '/community'}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium text-gray-900 text-lg line-clamp-1">
                          {post.title}
                        </h5>
                        <span className="text-sm text-gray-500">
                          {post.isAnonymous ? post.anonymousNickname : post.nickname}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {post.content}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Heart className="h-4 w-4 mr-1" />
                            {post.likeCount || 0}
                          </span>
                          <span className="flex items-center">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            {post.commentCount || 0}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(post.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {communityPosts.length === 0 && (
                    <div className="col-span-full text-center py-8">
                      <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">아직 게시글이 없습니다.</p>
                    </div>
                  )}

                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full py-3 text-lg"
                  onClick={() => window.location.href = '/community'}
                >
                  게시판 둘러보기
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* My Records - Only show for authenticated users */}
            {isAuthenticated && (
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                      <ClipboardList className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900">내 상담 기록</h4>
                      <p className="text-gray-600">개인적인 상담 경험을 안전하게 기록하세요</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    {counselingRecords.length === 0 ? (
                      <div className="text-center py-8">
                        <ClipboardList className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">아직 상담 기록이 없습니다.</p>
                      </div>
                    ) : (
                      counselingRecords.slice(0, 2).map((record) => (
                        <div 
                          key={record.id} 
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => setSelectedRecord(record)}
                        >
                          <div>
                            <h5 className="font-medium text-gray-900">{record.title}</h5>
                            <p className="text-sm text-gray-600">
                              {formatDate(record.createdAt)}
                              {record.supervisorName && ` - ${record.supervisorName}`}
                            </p>
                          </div>
                          <Shield className="h-4 w-4 text-gray-400" />
                        </div>
                      ))
                    )}
                  </div>
                  
                  <Button className="w-full" onClick={() => setLocation('/my-page')}>
                    새 기록 작성하기
                  </Button>
                </CardContent>
              </Card>
            )}
            

          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">플랫폼 현황</h3>
            <p className="text-lg text-gray-600">투명하고 공정한 상담 환경을 위한 우리의 성과</p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="text-3xl font-bold text-gray-900 mb-2">247</h4>
              <p className="text-gray-600">등록된 수퍼바이저</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="text-3xl font-bold text-gray-900 mb-2">1,432</h4>
              <p className="text-gray-600">활동 중인 수련생</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClipboardList className="h-8 w-8 text-yellow-600" />
              </div>
              <h4 className="text-3xl font-bold text-gray-900 mb-2">3,891</h4>
              <p className="text-gray-600">작성된 상담 기록</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="text-3xl font-bold text-gray-900 mb-2">92%</h4>
              <p className="text-gray-600">투명성 만족도</p>
            </div>
          </div>
        </div>
      </section>

      {/* Counseling Record Detail Dialog */}
      <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              상담 기록 상세
            </DialogTitle>
          </DialogHeader>
          
          {selectedRecord && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {selectedRecord.title}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                  {selectedRecord.supervisorName && (
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {selectedRecord.supervisorName}
                    </div>
                  )}
                  {selectedRecord.counselingDate && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(selectedRecord.counselingDate).toLocaleDateString('ko-KR')}
                    </div>
                  )}
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 mr-1" />
                    비공개
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">상담 내용</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {selectedRecord.content}
                  </p>
                </div>
              </div>
              
              {selectedRecord.tags && selectedRecord.tags.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">태그</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRecord.tags.map((tag) => (
                      <span 
                        key={tag}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="text-xs text-gray-400 pt-4 border-t">
                <p>작성일: {new Date(selectedRecord.createdAt).toLocaleString('ko-KR')}</p>
                {selectedRecord.updatedAt !== selectedRecord.createdAt && (
                  <p className="mt-1">
                    수정일: {new Date(selectedRecord.updatedAt).toLocaleString('ko-KR')}
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
