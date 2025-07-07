import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, Star, Mail, Phone, MapPin, Calendar, GraduationCap, Heart, Users, MessageCircle, AlertCircle } from "lucide-react";
import Header from "@/components/header";
import type { Supervisor } from "@shared/schema";
import femaleAvatarUrl from "@assets/image_1749710433039.png";
import maleAvatarUrl from "@assets/image_1749710541796.png";

export default function SupervisorProfile() {
  const [, params] = useRoute("/supervisor/:id");
  const supervisorId = params?.id;

  const { data: supervisor, isLoading } = useQuery<Supervisor>({
    queryKey: [`/api/supervisors/${supervisorId}`],
    enabled: !!supervisorId,
  });

  const getDefaultAvatar = () => {
    if (!supervisor) return femaleAvatarUrl;
    if (supervisor.gender === 'female') {
      return femaleAvatarUrl;
    } else if (supervisor.gender === 'male') {
      return maleAvatarUrl;
    }
    return femaleAvatarUrl;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
              <div className="flex items-start space-x-6">
                <div className="w-32 h-32 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-4">
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!supervisor) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <AlertTriangle className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">수퍼바이저를 찾을 수 없습니다</h2>
            <p className="text-gray-600 mb-8">요청하신 수퍼바이저 정보가 존재하지 않습니다.</p>
            <Link href="/">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                메인으로 돌아가기
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Back Button */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            수퍼바이저 목록으로
          </Button>
        </Link>

        {/* Main Profile Card */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                <div className="w-48 h-48 rounded-xl overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100">
                  <img 
                    src={supervisor.profileImageUrl || getDefaultAvatar()} 
                    alt={`${supervisor.name} 프로필`}
                    className="w-full h-full object-cover"
                    onLoad={() => {
                      console.log("프로필 이미지 로드 성공:", supervisor.profileImageUrl?.substring(0, 50));
                    }}
                    onError={(e) => {
                      console.log("프로필 이미지 로드 실패, 기본 아바타로 교체");
                      const target = e.target as HTMLImageElement;
                      target.src = getDefaultAvatar();
                    }}
                  />
                </div>
              </div>

              {/* Basic Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{supervisor.name}</h1>
                    {supervisor.affiliation && (
                      <p className="text-lg text-gray-600 mb-3">{supervisor.affiliation}</p>
                    )}
                  </div>
                  {supervisor.rating && supervisor.rating > 0 && (
                    <div className="flex items-center bg-yellow-50 px-3 py-2 rounded-lg">
                      <Star className="h-5 w-5 text-yellow-400 fill-current mr-1" />
                      <span className="font-semibold text-gray-900">
                        {(supervisor.rating / 10).toFixed(1)}
                      </span>
                      <span className="text-sm text-gray-600 ml-1">
                        ({supervisor.reviewCount || 0}개 리뷰)
                      </span>
                    </div>
                  )}
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {supervisor.counselingRegions && supervisor.counselingRegions.length > 0 && (
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{supervisor.counselingRegions.join(', ')}</span>
                    </div>
                  )}
                </div>

                {/* Summary */}
                {supervisor.summary && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 leading-relaxed">{supervisor.summary}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Specializations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Qualifications & Target Groups */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <GraduationCap className="h-5 w-5 mr-2" />
                전문 분야
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {supervisor.qualifications && supervisor.qualifications.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">자격증</h4>
                  <div className="flex flex-wrap gap-2">
                    {supervisor.qualifications.map((qual, index) => (
                      <Badge key={index} variant="secondary">{qual}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {supervisor.targetGroups && supervisor.targetGroups.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">대상군</h4>
                  <div className="flex flex-wrap gap-2">
                    {supervisor.targetGroups.map((group, index) => (
                      <Badge key={index} variant="outline">{group}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {supervisor.concernTypes && supervisor.concernTypes.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">상담 영역</h4>
                  <div className="flex flex-wrap gap-2">
                    {supervisor.concernTypes.map((type, index) => (
                      <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{type}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Methods & Symptoms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="h-5 w-5 mr-2" />
                상담 기법 & 증상
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {(() => {
                const parseMethods = (methods: any) => {
                  if (Array.isArray(methods)) return methods;
                  if (typeof methods === 'string') {
                    try { return JSON.parse(methods || '[]'); } catch { return []; }
                  }
                  return [];
                };
                const parsedMethods = parseMethods(supervisor.counselingMethods);
                
                return parsedMethods.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">상담 기법</h4>
                    <div className="flex flex-wrap gap-2">
                      {parsedMethods.map((method: string, index: number) => (
                        <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200">{method}</Badge>
                      ))}
                    </div>
                  </div>
                );
              })()}
              
              {(() => {
                const parseSymptoms = (symptoms: any) => {
                  if (Array.isArray(symptoms)) return symptoms;
                  if (typeof symptoms === 'string') {
                    try { return JSON.parse(symptoms || '[]'); } catch { return []; }
                  }
                  return [];
                };
                const parsedSymptoms = parseSymptoms(supervisor.emotionSymptoms);
                
                return parsedSymptoms.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">정서 증상</h4>
                    <div className="flex flex-wrap gap-2">
                      {parsedSymptoms.map((symptom: string, index: number) => (
                        <Badge key={index} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">{symptom}</Badge>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {supervisor.specialExperiences && supervisor.specialExperiences.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">특수 경험</h4>
                  <div className="flex flex-wrap gap-2">
                    {supervisor.specialExperiences.map((exp, index) => (
                      <Badge key={index} variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">{exp}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Fee Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              비용 정보
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Client Experience Fee */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">내담자경험 비용</h4>
                <p className="text-2xl font-bold text-blue-600">
                  {supervisor.clientExperienceFee ? `${supervisor.clientExperienceFee.toLocaleString()}원` : '무료'}
                </p>
                {supervisor.clientExperienceFee === 0 && (
                  <p className="text-sm text-green-600 mt-1">무료 제공</p>
                )}
              </div>

              {/* National Program */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">전국민마음투자지원사업</h4>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {supervisor.participatesInNationalProgram ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span className="text-green-600 font-medium">참여</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-red-500 mr-2" />
                        <span className="text-red-600 font-medium">미참여</span>
                      </>
                    )}
                  </div>
                  {supervisor.participatesInNationalProgram && (
                    <div className="text-right">
                      <p className="text-sm text-gray-600">추가 비용</p>
                      <p className="font-semibold">
                        {supervisor.nationalProgramAdditionalFee === false || supervisor.nationalProgramAdditionalFee === null 
                          ? '없음' 
                          : supervisor.nationalProgramAdditionalFee === 0 
                            ? '무료' 
                            : `${supervisor.nationalProgramAdditionalFee.toLocaleString()}원`}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageCircle className="h-5 w-5 mr-2" />
              내담경험문의
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Email */}
              {supervisor.contactInfo && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Mail className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-medium text-blue-900">이메일</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-mono text-blue-800 break-all">
                      {supervisor.contactInfo}
                    </p>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-100"
                        onClick={() => {
                          const subject = encodeURIComponent(`내담경험 문의 - ${supervisor.name} 수퍼바이저님`);
                          const body = encodeURIComponent(`안녕하세요, ${supervisor.name} 수퍼바이저님.

좋은 수련, 좋은 상담자 플랫폼을 통해 연락드립니다.

내담경험 관련 문의사항:
- 내담경험 일정 및 시간 
- 내담경험 방식 (대면/온라인)
- 내담경험 비용: ${supervisor.clientExperienceFee ? `${supervisor.clientExperienceFee.toLocaleString()}원` : '무료'}
- 수퍼비전 진행 방식

연락처: [본인 연락처를 입력해주세요]

감사합니다.`);
                          window.location.href = `mailto:${supervisor.contactInfo}?subject=${subject}&body=${body}`;
                        }}
                      >
                        내담경험 문의
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(supervisor.contactInfo || '');
                          alert('이메일 주소가 복사되었습니다!');
                        }}
                      >
                        복사
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Phone */}
              {supervisor.phoneNumber && (
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Phone className="h-5 w-5 text-green-600 mr-2" />
                    <span className="font-medium text-green-900">전화번호</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-mono text-green-800">
                      {supervisor.phoneNumber}
                    </p>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 border-green-300 text-green-700 hover:bg-green-100"
                        onClick={() => {
                          window.location.href = `tel:${supervisor.phoneNumber}`;
                        }}
                      >
                        내담경험 문의
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(supervisor.phoneNumber || '');
                          alert('전화번호가 복사되었습니다!');
                        }}
                      >
                        복사
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* KakaoTalk */}
              {supervisor.kakaoId && (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <MessageCircle className="h-5 w-5 text-yellow-600 mr-2" />
                    <span className="font-medium text-yellow-900">카카오톡</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-mono text-yellow-800">
                      {supervisor.kakaoId}
                    </p>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                        onClick={() => {
                          // KakaoTalk deep link for client experience inquiry
                          window.open(`https://open.kakao.com/o/${supervisor.kakaoId}`, '_blank');
                        }}
                      >
                        내담경험 상담
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(supervisor.kakaoId || '');
                          alert('카카오톡 ID가 복사되었습니다!');
                        }}
                      >
                        복사
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Website */}
              {supervisor.website && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <MapPin className="h-5 w-5 text-purple-600 mr-2" />
                    <span className="font-medium text-purple-900">웹사이트</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-purple-800 break-all">
                      {supervisor.website}
                    </p>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 border-purple-300 text-purple-700 hover:bg-purple-100"
                        onClick={() => {
                          window.open(supervisor.website, '_blank');
                        }}
                      >
                        내담경험 예약
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(supervisor.website || '');
                          alert('웹사이트 주소가 복사되었습니다!');
                        }}
                      >
                        복사
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="flex items-start">
                <AlertCircle className="h-4 w-4 text-gray-600 mr-2 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-gray-800 mb-1">내담경험 문의 시 안내사항</p>
                  <ul className="text-gray-700 space-y-1 text-xs">
                    <li>• 내담경험 희망 일시를 2-3개 제시해주세요</li>
                    <li>• 내담경험 방식(대면/온라인) 선택사항을 알려주세요</li>
                    <li>• 수련생 정보(소속, 경력, 관심 영역) 간략히 작성해주세요</li>
                    <li>• 수퍼비전 형태(개인/집단) 및 빈도를 명시해주세요</li>
                    <li>• 응답은 보통 1-2일 내에 받으실 수 있습니다</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}