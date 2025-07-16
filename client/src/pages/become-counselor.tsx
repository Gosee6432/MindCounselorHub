import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, GraduationCap, BookOpen, CheckCircle, School, MapPin } from "lucide-react";
import Header from "@/components/header";

export default function BecomeCounselor() {
  const [selectedRegion, setSelectedRegion] = useState("전체");

  const regions = [
    "전체", "서울", "부산", "대구", "인천", "광주", "대전", "울산", "세종",
    "경기", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"
  ];

  const universities = [
    { name: "가톨릭대학교", region: "경기", department: "심리학과", website: "https://www.catholic.ac.kr", city: "부천" },
    { name: "가톨릭관동대학교", region: "강원", department: "심리상담학과", website: "https://www.cku.ac.kr", city: "강릉" },
    { name: "강남대학교", region: "경기", department: "교육학과(상담심리전공)", website: "https://www.kangnam.ac.kr", city: "용인" },
    { name: "건국대학교", region: "서울", department: "심리학과", website: "https://www.konkuk.ac.kr", city: "서울" },
    { name: "건양대학교", region: "충남", department: "심리상담치료학과", website: "https://www.konyang.ac.kr", city: "대전" },
    { name: "경북대학교", region: "경북", department: "심리학과", website: "https://www.knu.ac.kr", city: "대구" },
    { name: "경성대학교", region: "부산", department: "심리학과", website: "https://www.ks.ac.kr", city: "부산" },
    { name: "경희대학교", region: "서울", department: "심리학과", website: "https://www.khu.ac.kr", city: "서울" },
    { name: "계명대학교", region: "경북", department: "심리학과", website: "https://www.kmu.ac.kr", city: "대구" },
    { name: "고려대학교", region: "서울", department: "심리학과", website: "https://www.korea.ac.kr", city: "서울" },
    { name: "광운대학교", region: "서울", department: "산업심리학과", website: "https://www.kw.ac.kr", city: "서울" },
    { name: "국민대학교", region: "서울", department: "심리학과", website: "https://www.kookmin.ac.kr", city: "서울" },
    { name: "단국대학교", region: "경기", department: "심리학과", website: "https://www.dankook.ac.kr", city: "용인" },
    { name: "대구가톨릭대학교", region: "경북", department: "심리학과", website: "https://www.cu.ac.kr", city: "경산" },
    { name: "대구대학교", region: "경북", department: "심리치료학과", website: "https://www.daegu.ac.kr", city: "경산" },
    { name: "대전대학교", region: "충남", department: "심리상담학과", website: "https://www.dju.ac.kr", city: "대전" },
    { name: "덕성여자대학교", region: "서울", department: "심리학과", website: "https://www.duksung.ac.kr", city: "서울" },
    { name: "동국대학교", region: "서울", department: "심리학과", website: "https://www.dongguk.edu", city: "서울" },
    { name: "동덕여자대학교", region: "서울", department: "심리학과", website: "https://www.dongduk.ac.kr", city: "서울" },
    { name: "동아대학교", region: "부산", department: "심리학과", website: "https://www.donga.ac.kr", city: "부산" },
    { name: "명지대학교", region: "경기", department: "심리치료학과", website: "https://www.mju.ac.kr", city: "용인" },
    { name: "부산대학교", region: "부산", department: "심리학과", website: "https://www.pusan.ac.kr", city: "부산" },
    { name: "삼육대학교", region: "서울", department: "상담심리학과", website: "https://www.syu.ac.kr", city: "서울" },
    { name: "상명대학교", region: "서울", department: "심리학과", website: "https://www.smu.ac.kr", city: "서울" },
    { name: "서강대학교", region: "서울", department: "심리학과", website: "https://www.sogang.ac.kr", city: "서울" },
    { name: "서울대학교", region: "서울", department: "심리학과", website: "https://www.snu.ac.kr", city: "서울" },
    { name: "서울사이버대학교", region: "서울", department: "상담심리학과", website: "https://www.iscu.ac.kr", city: "서울" },
    { name: "서울여자대학교", region: "서울", department: "심리학과", website: "https://www.swu.ac.kr", city: "서울" },
    { name: "성균관대학교", region: "서울", department: "심리학과", website: "https://www.skku.edu", city: "서울" },
    { name: "성신여자대학교", region: "서울", department: "심리학과", website: "https://www.sungshin.ac.kr", city: "서울" },
    { name: "세종대학교", region: "서울", department: "심리학과", website: "https://www.sejong.ac.kr", city: "서울" },
    { name: "숙명여자대학교", region: "서울", department: "심리학과", website: "https://www.sookmyung.ac.kr", city: "서울" },
    { name: "순천향대학교", region: "충남", department: "심리학과", website: "https://www.sch.ac.kr", city: "아산" },
    { name: "아주대학교", region: "경기", department: "심리학과", website: "https://www.ajou.ac.kr", city: "수원" },
    { name: "연세대학교", region: "서울", department: "심리학과", website: "https://www.yonsei.ac.kr", city: "서울" },
    { name: "영남대학교", region: "경북", department: "심리학과", website: "https://www.yu.ac.kr", city: "경산" },
    { name: "용인대학교", region: "경기", department: "심리치료학과", website: "https://www.yongin.ac.kr", city: "용인" },
    { name: "이화여자대학교", region: "서울", department: "심리학과", website: "https://www.ewha.ac.kr", city: "서울" },
    { name: "인하대학교", region: "인천", department: "심리학과", website: "https://www.inha.ac.kr", city: "인천" },
    { name: "전남대학교", region: "전남", department: "심리학과", website: "https://www.jnu.ac.kr", city: "광주" },
    { name: "전북대학교", region: "전북", department: "심리학과", website: "https://www.jbnu.ac.kr", city: "전주" },
    { name: "제주대학교", region: "제주", department: "심리학과", website: "https://www.jejunu.ac.kr", city: "제주" },
    { name: "중앙대학교", region: "서울", department: "심리학과", website: "https://www.cau.ac.kr", city: "서울" },
    { name: "충남대학교", region: "충남", department: "심리학과", website: "https://www.cnu.ac.kr", city: "대전" },
    { name: "충북대학교", region: "충북", department: "심리학과", website: "https://www.chungbuk.ac.kr", city: "청주" },
    { name: "한국외국어대학교", region: "서울", department: "심리학과", website: "https://www.hufs.ac.kr", city: "서울" },
    { name: "한국체육대학교", region: "서울", department: "스포츠심리학과", website: "https://www.knsu.ac.kr", city: "서울" },
    { name: "한림대학교", region: "강원", department: "심리학과", website: "https://www.hallym.ac.kr", city: "춘천" },
    { name: "한성대학교", region: "서울", department: "심리학과", website: "https://www.hansung.ac.kr", city: "서울" },
    { name: "한양대학교", region: "서울", department: "심리학과", website: "https://www.hanyang.ac.kr", city: "서울" },
    { name: "홍익대학교", region: "서울", department: "심리학과", website: "https://www.hongik.ac.kr", city: "서울" },
  ];

  const filteredUniversities = selectedRegion === "전체" 
    ? universities 
    : universities.filter(uni => uni.region === selectedRegion);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">상담자가 되는 법</h1>
          <p className="text-lg text-gray-600">심리상담사가 되기 위한 체계적인 안내</p>
        </div>

        <Tabs defaultValue="guide" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="guide">상담자 되는 방법</TabsTrigger>
            <TabsTrigger value="universities">전국 심리상담학과</TabsTrigger>
          </TabsList>

          <TabsContent value="guide" className="mt-6">
            <div className="space-y-6">
              {/* 1. 학사 과정 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <GraduationCap className="h-5 w-5 mr-2" />
                    1단계: 학사 과정
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">필수 학위</h4>
                    <ul className="text-blue-800 space-y-1">
                      <li>• 심리학과 학사 학위 또는 심리학 관련 학과</li>
                      <li>• 심리상담학과, 상담심리학과 등 상담 관련 학과</li>
                      <li>• 교육학과(상담심리전공) 등</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">핵심 이수 과목</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <p className="font-medium text-green-800 mb-1">기초 심리학</p>
                        <ul className="text-sm text-green-700 space-y-1">
                          <li>• 일반심리학</li>
                          <li>• 발달심리학</li>
                          <li>• 인격심리학</li>
                          <li>• 사회심리학</li>
                          <li>• 인지심리학</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium text-green-800 mb-1">응용 심리학</p>
                        <ul className="text-sm text-green-700 space-y-1">
                          <li>• 상담심리학</li>
                          <li>• 임상심리학</li>
                          <li>• 심리검사</li>
                          <li>• 심리통계</li>
                          <li>• 심리측정</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 2. 대학원 과정 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    2단계: 대학원 과정
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-2">석사 과정 (2년)</h4>
                    <ul className="text-purple-800 space-y-1">
                      <li>• 상담심리학 석사 또는 임상심리학 석사</li>
                      <li>• 필수 이론 과목 및 실습 과목 이수</li>
                      <li>• 학위논문 작성 및 심사</li>
                    </ul>
                  </div>
                  
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-orange-900 mb-2">박사 과정 (3-4년, 선택)</h4>
                    <ul className="text-orange-800 space-y-1">
                      <li>• 전문성 심화 및 연구 역량 강화</li>
                      <li>• 수퍼바이저 자격 취득을 위한 필수 과정</li>
                      <li>• 박사논문 작성 및 심사</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* 3. 자격증 취득 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    3단계: 자격증 취득
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-red-900 mb-2">상담심리사 자격증</h4>
                      <p className="text-sm text-red-800 mb-2">한국상담심리학회</p>
                      <ul className="text-red-700 space-y-1 text-sm">
                        <li>• 상담심리사 3급 → 2급 → 1급</li>
                        <li>• 각 급수별 실습 시간 요구</li>
                        <li>• 수퍼비전 필수</li>
                      </ul>
                    </div>
                    
                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-indigo-900 mb-2">전문상담사 자격증</h4>
                      <p className="text-sm text-indigo-800 mb-2">한국상담학회</p>
                      <ul className="text-indigo-700 space-y-1 text-sm">
                        <li>• 전문상담사 2급 → 1급</li>
                        <li>• 상담 실습 및 사례 제출</li>
                        <li>• 지속적인 교육 이수</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 4. 실무 경험 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <School className="h-5 w-5 mr-2" />
                    4단계: 실무 경험 및 수퍼비전
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-teal-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-teal-900 mb-2">실무 경험 쌓기</h4>
                    <ul className="text-teal-800 space-y-1">
                      <li>• 상담센터, 병원, 학교 등에서 실무 경험</li>
                      <li>• 다양한 내담자와의 상담 경험</li>
                      <li>• 전문 분야별 특수 훈련 이수</li>
                    </ul>
                  </div>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-900 mb-2">수퍼비전 받기</h4>
                    <ul className="text-yellow-800 space-y-1">
                      <li>• 경험이 풍부한 수퍼바이저에게 지도 받기</li>
                      <li>• 정기적인 사례 검토 및 피드백</li>
                      <li>• 전문성 향상을 위한 지속적인 학습</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* 5. 지속적인 전문성 개발 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    5단계: 지속적인 전문성 개발
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">평생 학습</h4>
                    <ul className="text-gray-800 space-y-1">
                      <li>• 정기적인 보수교육 이수</li>
                      <li>• 전문 워크숍 및 세미나 참여</li>
                      <li>• 최신 상담 기법 학습</li>
                      <li>• 동료 상담사들과의 네트워킹</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="universities" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>전국 심리상담학과 리스트</CardTitle>
                <div className="flex flex-wrap gap-2 mt-4">
                  {regions.map((region) => (
                    <Badge 
                      key={region}
                      variant={selectedRegion === region ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setSelectedRegion(region)}
                    >
                      {region}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredUniversities.map((university, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-lg">{university.name}</h3>
                          <Badge variant="outline">{university.region}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{university.department}</p>
                        <div className="flex items-center text-sm text-gray-500 mb-3">
                          <MapPin className="h-4 w-4 mr-1" />
                          {university.city}
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="w-full"
                          onClick={() => window.open(university.website, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          대학 홈페이지
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {filteredUniversities.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    선택한 지역에 해당하는 대학이 없습니다.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}