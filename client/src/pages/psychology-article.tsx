import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Header from "@/components/header";
import { ArrowLeft, Clock, User, Calendar, Share2, BookOpen, TrendingUp, AlertCircle, RefreshCw } from "lucide-react";
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

export default function PsychologyArticle() {
  const { id } = useParams();

  const { data: article, isLoading, error, refetch } = useQuery<PsychologyArticle>({
    queryKey: ["/api/psychology/articles", id],
    queryFn: async () => {
      const response = await fetch(`/api/psychology/articles/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch article');
      }
      return response.json();
    },
    enabled: !!id,
    retry: 1,
  });

  const getCategoryColor = (category: string) => {
    const categories = {
      "연구동향": "bg-blue-100 text-blue-800",
      "치료법": "bg-green-100 text-green-800",
      "상담기법": "bg-purple-100 text-purple-800",
      "일반": "bg-gray-100 text-gray-800",
      "상세분석": "bg-orange-100 text-orange-800"
    };
    return categories[category as keyof typeof categories] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article?.title,
        text: article?.summary,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('링크가 클립보드에 복사되었습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4 w-1/4"></div>
            <Card>
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link href="/psychology-info">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              심리학 정보로 돌아가기
            </Button>
          </Link>
          
          <Card className="border-red-200">
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-400" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                아티클을 불러올 수 없습니다
              </h3>
              <p className="text-gray-600 mb-6">
                요청하신 아티클을 가져오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => refetch()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  다시 시도
                </Button>
                <Link href="/psychology-info">
                  <Button variant="outline">
                    목록으로 돌아가기
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/psychology-info">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            심리학 정보로 돌아가기
          </Button>
        </Link>

        <Card className="mb-8">
          <CardHeader className="pb-6">
            <div className="flex items-start justify-between mb-4">
              <Badge className={getCategoryColor(article.category)}>
                {article.category}
              </Badge>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                공유
              </Button>
            </div>
            
            <CardTitle className="text-2xl md:text-3xl leading-tight mb-4">
              {article.title}
            </CardTitle>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{formatDate(article.publishedAt)}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>읽는 시간: {article.readTime}</span>
              </div>
            </div>
            
            {article.summary && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <p className="text-blue-800 font-medium text-lg leading-relaxed">
                  {article.summary}
                </p>
              </div>
            )}
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="prose prose-lg max-w-none">
              <div 
                className="text-gray-800 leading-relaxed whitespace-pre-wrap"
                style={{ fontSize: '16px', lineHeight: '1.8' }}
              >
                {article.content || '내용을 불러오는 중입니다...'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Related Articles or Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">추가 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center p-4 border rounded-lg hover:shadow-md transition-shadow">
                <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h3 className="font-semibold">더 많은 아티클</h3>
                  <p className="text-sm text-gray-600">최신 심리학 연구 정보 보기</p>
                </div>
              </div>
              <div className="flex items-center p-4 border rounded-lg hover:shadow-md transition-shadow">
                <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <h3 className="font-semibold">연구 동향</h3>
                  <p className="text-sm text-gray-600">최신 연구 트렌드 확인</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <Link href="/psychology-info" className="block">
                <Button className="w-full">
                  <BookOpen className="h-4 w-4 mr-2" />
                  더 많은 아티클 보기
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}