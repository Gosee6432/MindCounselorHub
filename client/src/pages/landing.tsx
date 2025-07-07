import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Shield, Heart, TrendingUp, CheckCircle, Star, UserCheck, Globe, Award } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-blue-600">좋은 수련, 좋은 상담자</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={handleLogin}>
                로그인
              </Button>
              <Button onClick={() => window.location.href = "/register"}>
                회원가입
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            투명하고 공정한<br />
            <span className="text-blue-200">심리상담 수련 환경</span>
          </h2>
          <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            수련생의 권익을 보호하는 수퍼바이저 매칭 플랫폼
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-50" onClick={() => window.location.href = "/register"}>
              수퍼바이저 찾기
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              서비스 소개
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">핵심 가치</h3>
            <p className="text-lg text-gray-600">투명성과 공정성을 바탕으로 한 상담 환경</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold mb-2">투명성</h4>
                <p className="text-gray-600 text-sm">
                  슈퍼바이저의 모든 정보를 사전에 투명하게 공개합니다.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="text-lg font-semibold mb-2">공정성</h4>
                <p className="text-gray-600 text-sm">
                  모든 수련생이 공정한 기회를 가질 수 있도록 지원합니다.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="text-lg font-semibold mb-2">수련생 권익 보호</h4>
                <p className="text-gray-600 text-sm">
                  수련생의 권익을 최우선으로 보호하는 플랫폼입니다.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-6 w-6 text-yellow-600" />
                </div>
                <h4 className="text-lg font-semibold mb-2">정보 비대칭 해소</h4>
                <p className="text-gray-600 text-sm">
                  정보 격차를 줄여 더 나은 선택을 할 수 있도록 돕습니다.
                </p>
              </CardContent>
            </Card>
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
                <Heart className="h-8 w-8 text-yellow-600" />
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

      {/* CTA Section */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            지금 시작하세요
          </h3>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            투명하고 공정한 심리상담 수련 환경에서 여러분의 전문성을 키워보세요.
          </p>
          <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-50" onClick={handleLogin}>
            무료로 시작하기
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h5 className="text-lg font-semibold mb-4">심리상담 매칭</h5>
              <p className="text-gray-400 text-sm">
                투명하고 공정한 심리상담 수련 환경을 만들어가는 플랫폼입니다.
              </p>
            </div>
            
            <div>
              <h6 className="font-semibold mb-4">서비스</h6>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">슈퍼바이저 찾기</a></li>
                <li><a href="#" className="hover:text-white transition-colors">상담 기록</a></li>
                <li><a href="#" className="hover:text-white transition-colors">커뮤니티</a></li>
              </ul>
            </div>
            
            <div>
              <h6 className="font-semibold mb-4">지원</h6>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">도움말</a></li>
                <li><a href="#" className="hover:text-white transition-colors">문의하기</a></li>
                <li><a href="#" className="hover:text-white transition-colors">신고하기</a></li>
              </ul>
            </div>
            
            <div>
              <h6 className="font-semibold mb-4">법적 고지</h6>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">이용약관</a></li>
                <li><a href="#" className="hover:text-white transition-colors">개인정보처리방침</a></li>
                <li><a href="#" className="hover:text-white transition-colors">운영정책</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 mt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 심리상담 매칭 플랫폼. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
