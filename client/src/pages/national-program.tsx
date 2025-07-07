import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/header";
import SupervisorCard from "@/components/supervisor-card";
import { Heart, Users, Search, Filter, CheckCircle, Info, FileText, Calculator, Phone, MapPin, Clock, AlertCircle, ExternalLink } from "lucide-react";
import type { Supervisor } from "@shared/schema";

export default function NationalProgram() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const { data: supervisors = [], isLoading } = useQuery<Supervisor[]>({
    queryKey: ["/api/supervisors", { participatesInNationalProgram: true }],
  });

  const filteredSupervisors = supervisors.filter((supervisor) => {
    const matchesSearch = supervisor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supervisor.affiliation?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = !selectedRegion || 
      supervisor.counselingRegions?.includes(selectedRegion);
    return supervisor.participatesInNationalProgram && matchesSearch && matchesRegion;
  });

  const regions = Array.from(new Set(
    supervisors.flatMap(s => s.counselingRegions || [])
  )).sort();

  const eligibilityRequirements = [
    {
      title: "정신건강 기관 의뢰",
      description: "정신건강복지센터, 대학교상담센터, 청소년상담복지센터, Wee센터/Wee 클래스 등에서 심리상담이 필요하다고 인정하는 자",
      documents: "기관에서 발급하는 의뢰서 (신청일 기준 3개월 이내)"
    },
    {
      title: "정신의료기관 진단",
      description: "정신의료기관 등에서 우울·불안 등으로 인하여 심리상담이 필요하다고 인정하는 자",
      documents: "정신건강의학과 의사, 한방신경정신과 한의사가 발급하는 진단서 또는 소견서 (신청일 기준 3개월 이내)"
    },
    {
      title: "국가 건강검진 결과",
      description: "국가 건강검진 중 정신건강검사(우울증 선별검사, PHQ-9) 결과에서 중간 정도 이상의 우울(10점 이상)이 확인된 자",
      documents: "신청일 기준 1년 이내에 실시한 일반건강검진 결과통보서"
    },
    {
      title: "자립준비청년 및 보호연장아동",
      description: "아동복지법에 따른 자립준비청년 및 보호연장아동",
      documents: "보호종료확인서 또는 시설재원증명서/가정위탁보호확인서"
    },
    {
      title: "동네의원 마음건강돌봄 연계",
      description: "동네의원 마음건강돌봄 연계 시범사업을 통해 의뢰된 자",
      documents: "해당 사업 지침 별지 제4호 연계의뢰서 (신청일 기준 3개월 이내)"
    }
  ];

  const feeStructure = [
    { income: "기준 중위소득 70% 이하", rate: "0%", grade1Fee: "80,000원", grade2Fee: "70,000원", totalGrade1: "640,000원", totalGrade2: "560,000원" },
    { income: "기준 중위소득 70% 초과 ~ 120% 이하", rate: "10%", grade1Fee: "72,000원", grade2Fee: "63,000원", totalGrade1: "576,000원", totalGrade2: "504,000원" },
    { income: "기준 중위소득 120% 초과 ~ 180% 이하", rate: "20%", grade1Fee: "64,000원", grade2Fee: "56,000원", totalGrade1: "512,000원", totalGrade2: "448,000원" },
    { income: "기준 중위소득 180% 초과", rate: "30%", grade1Fee: "56,000원", grade2Fee: "49,000원", totalGrade1: "448,000원", totalGrade2: "392,000원" }
  ];

  const grade1Qualifications = [
    "정신건강전문요원 1급",
    "청소년상담사 1급", 
    "전문상담교사 1급",
    "임상심리전문가",
    "상담심리사 1급",
    "전문상담사 1급"
  ];

  const grade2Qualifications = [
    "정신건강전문요원 2급",
    "청소년상담사 2급",
    "전문상담교사 2급", 
    "임상심리사 1급",
    "상담심리사 2급",
    "전문상담사 2급"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <Heart className="mx-auto h-16 w-16 mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            전국민 마음투자 지원사업
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            우울·불안 등 정서적 어려움이 있는 국민에게 전문 심리상담 서비스 제공
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Badge className="bg-white/20 text-white text-lg px-4 py-2">
              총 8회 상담 지원
            </Badge>
            <Badge className="bg-white/20 text-white text-lg px-4 py-2">
              소득별 차등 지원
            </Badge>
            <Badge className="bg-white/20 text-white text-lg px-4 py-2">
              전문 상담사 매칭
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white rounded-lg p-2 shadow-sm">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === "overview" 
                ? "bg-green-600 text-white" 
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            사업 개요
          </button>
          <button
            onClick={() => setActiveTab("eligibility")}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === "eligibility" 
                ? "bg-green-600 text-white" 
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            신청 자격
          </button>
          <button
            onClick={() => setActiveTab("fees")}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === "fees" 
                ? "bg-green-600 text-white" 
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            비용 안내
          </button>
          <button
            onClick={() => setActiveTab("qualifications")}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === "qualifications" 
                ? "bg-green-600 text-white" 
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            상담사 자격
          </button>

        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* 사업 목적 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Info className="h-5 w-5 mr-2" />
                  사업 목적
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  우울·불안 등 정서적 어려움이 있는 국민에게 전문 심리상담 서비스를 제공하여, 
                  국민의 마음건강 돌봄 및 정신질환 사전 예방·조기발견을 목표로 합니다.
                </p>
              </CardContent>
            </Card>

            {/* 지원 내용 */}
            <Card>
              <CardHeader>
                <CardTitle>지원 내용</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="font-semibold mb-2">전문 심리상담</h3>
                    <p className="text-sm text-gray-600">총 8회 바우처 제공</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calculator className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold mb-2">소득별 차등 지원</h3>
                    <p className="text-sm text-gray-600">본인부담률 0%~30%</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="h-8 w-8 text-purple-600" />
                    </div>
                    <h3 className="font-semibold mb-2">전문 상담사</h3>
                    <p className="text-sm text-gray-600">1급/2급 자격 보유</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 신청 방법 */}
            <Card>
              <CardHeader>
                <CardTitle>신청 방법</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">1</div>
                    <div>
                      <h4 className="font-semibold">신청 장소</h4>
                      <p className="text-gray-600">주민등록상 또는 실거주지 읍·면·동 행정복지센터 방문 또는 복지로 홈페이지 온라인 신청</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">2</div>
                    <div>
                      <h4 className="font-semibold">신청권자</h4>
                      <p className="text-gray-600">본인, 친족, 법정대리인, 담당공무원(직권신청)</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">3</div>
                    <div>
                      <h4 className="font-semibold">필요 서류</h4>
                      <p className="text-gray-600">신청서, 동의서, 증빙서류 (자격 조건에 따라 상이)</p>
                    </div>
                  </div>
                </div>
                <div 
                  className="mt-6 p-4 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                  onClick={() => window.open('https://www.bokjiro.go.kr', '_blank')}
                >
                  <div className="flex items-center">
                    <ExternalLink className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-semibold text-blue-900">온라인 신청</span>
                  </div>
                  <p className="text-blue-700 mt-1">복지로 홈페이지 (www.bokjiro.go.kr) - 만 19세 이상 본인만 신청 가능</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "eligibility" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  서비스 대상
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  우울·불안 등 정서적 어려움이 있는 국민 중 아래 기준에 해당하는 자로, <strong>나이 및 소득 기준은 없음</strong>
                </p>
                <div className="space-y-4">
                  {eligibilityRequirements.map((req, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">{index + 1}. {req.title}</h4>
                      <p className="text-gray-700 mb-3">{req.description}</p>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-sm text-gray-600">
                          <strong>증빙서류:</strong> {req.documents}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-red-600">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  지원대상 제외
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-700">
                  <li>• 약물·알콜중독, 중증 정신질환(예: 조현병 등), 심각한 심리적 문제(급박한 자살위기 등)로 정신건강의학과 진료가 우선적으로 필요한 경우</li>
                  <li>• 지역사회서비스 투자사업의 아동청소년 심리지원서비스, 아동청소년 정서발달 지원서비스, 정신건강토탈케어 서비스, 성인 심리지원서비스를 지원받고 있는 경우</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "fees" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>서비스 가격 및 본인부담금</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">서비스 가격 (1회당 바우처 단가)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h5 className="font-semibold text-blue-900">1급 유형</h5>
                      <p className="text-2xl font-bold text-blue-600">80,000원</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h5 className="font-semibold text-green-900">2급 유형</h5>
                      <p className="text-2xl font-bold text-green-600">70,000원</p>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 p-3 text-left">기준 중위소득</th>
                        <th className="border border-gray-300 p-3 text-center">본인부담률</th>
                        <th className="border border-gray-300 p-3 text-center">1급 유형 (1회)</th>
                        <th className="border border-gray-300 p-3 text-center">2급 유형 (1회)</th>
                        <th className="border border-gray-300 p-3 text-center">1급 유형 (총 8회)</th>
                        <th className="border border-gray-300 p-3 text-center">2급 유형 (총 8회)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feeStructure.map((row, index) => (
                        <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                          <td className="border border-gray-300 p-3">{row.income}</td>
                          <td className="border border-gray-300 p-3 text-center font-semibold">{row.rate}</td>
                          <td className="border border-gray-300 p-3 text-center">{row.grade1Fee}</td>
                          <td className="border border-gray-300 p-3 text-center">{row.grade2Fee}</td>
                          <td className="border border-gray-300 p-3 text-center font-semibold">{row.totalGrade1}</td>
                          <td className="border border-gray-300 p-3 text-center font-semibold">{row.totalGrade2}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>특별 혜택:</strong> 자립준비청년 및 보호연장아동, 법정한부모가족 본인부담률 0%
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "qualifications" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-600">1급 유형 상담사 자격</CardTitle>
                  <p className="text-sm text-gray-600">1회당 80,000원</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {grade1Qualifications.map((qual, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-gray-700">{qual}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">2급 유형 상담사 자격</CardTitle>
                  <p className="text-sm text-gray-600">1회당 70,000원</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {grade2Qualifications.map((qual, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-gray-700">{qual}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>서비스 제공기관 확인</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="bg-blue-50 p-4 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                  onClick={() => window.open('https://www.socialservice.or.kr', '_blank')}
                >
                  <div className="flex items-center">
                    <ExternalLink className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-semibold text-blue-900">사회서비스 전자바우처 포털</span>
                  </div>
                  <p className="text-blue-700 mt-1">www.socialservice.or.kr 서비스안내에서 확인 가능</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "supervisors" && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="상담사 이름이나 소속기관으로 검색"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                    <SelectTrigger className="w-full lg:w-48">
                      <SelectValue placeholder="지역 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">전체 지역</SelectItem>
                      {regions.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 mx-auto mb-3 text-green-600" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{filteredSupervisors.length}</h3>
                  <p className="text-gray-600">참여 상담사</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <MapPin className="h-8 w-8 mx-auto mb-3 text-blue-600" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{regions.length}</h3>
                  <p className="text-gray-600">서비스 지역</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <CheckCircle className="h-8 w-8 mx-auto mb-3 text-purple-600" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">100%</h3>
                  <p className="text-gray-600">전문 자격 보유</p>
                </CardContent>
              </Card>
            </div>

            {/* Supervisors Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-32 bg-gray-200 rounded mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredSupervisors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSupervisors.map((supervisor) => (
                  <SupervisorCard key={supervisor.id} supervisor={supervisor} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <AlertCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    검색 결과가 없습니다
                  </h3>
                  <p className="text-gray-600 mb-6">
                    다른 검색어나 지역을 선택해보세요.
                  </p>
                  <Button 
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedRegion("");
                    }}
                    variant="outline"
                  >
                    필터 초기화
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}