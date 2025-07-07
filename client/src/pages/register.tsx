import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Users, BookOpen } from "lucide-react";
import { useLocation } from "wouter";

export default function Register() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <Heart className="mx-auto h-16 w-16 text-blue-600" />
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900">
            회원가입
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            어떤 유형의 사용자로 가입하시나요?
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* 수련생 카드 */}
          <Card 
            className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:bg-blue-50 hover:ring-2 hover:ring-blue-500"
            onClick={() => setLocation('/register-trainee')}
          >
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-10 w-10 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">수련생</CardTitle>
              <CardDescription className="text-lg">
                내담경험을 희망하는 심리상담 수련생
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  수퍼바이저 검색 및 매칭
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  상담 기록 작성 및 관리
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  커뮤니티 참여
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  교육 정보 및 심리학 정보 조회
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 수퍼바이저 카드 */}
          <Card 
            className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:bg-emerald-50 hover:ring-2 hover:ring-emerald-500"
            onClick={() => setLocation('/register-supervisor')}
          >
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-10 w-10 text-green-600" />
              </div>
              <CardTitle className="text-2xl">수퍼바이저</CardTitle>
              <CardDescription className="text-lg">
                수련생을 지도하는 심리상담 전문가
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  전문가 프로필 등록 및 관리
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  수련생 상담 지도
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  전문가 커뮤니티 참여
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  국가등록수퍼바이저 프로그램 참여
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 안내 텍스트 */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-4">
            위 카드를 클릭하여 회원가입을 시작하세요
          </p>
          
          <p className="text-sm text-gray-600">
            이미 계정이 있으신가요?{" "}
            <button 
              onClick={() => setLocation('/login')}
              className="text-blue-600 hover:underline font-medium"
            >
              로그인하기
            </button>
          </p>
        </div>


      </div>
    </div>
  );
}