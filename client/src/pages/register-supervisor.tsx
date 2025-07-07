import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Eye, EyeOff, ArrowLeft, Upload, Plus, X } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";

export default function RegisterSupervisor() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    // 기본 정보
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    gender: "",
    phone: "",
    birthYear: "",
    
    // 프로필 정보 (카드에 표시될 정보)
    profileImage: "",
    affiliation: "", // 소속 (예: 한국심리상담센터)
    summary: "", // 소개글
    specialization: "", // 전문분야
    
    // 자격증 및 전문 분야 (체크박스)
    qualifications: [] as string[], // 자격증
    targetGroups: [] as string[], // 대상군
    concernTypes: [] as string[], // 상담 영역
    emotionSymptoms: [] as string[], // 정서 증상
    specialExperiences: [] as string[], // 특수 경험
    counselingMethods: [] as string[], // 상담 기법
    counselingRegions: [] as string[], // 상담 지역
    
    // 연락처 정보 (카드 하단에 표시)
    phoneNumber: "", // 전화번호
    emailContact: "", // 이메일
    kakaoId: "", // 카카오톡 ID
    website: "", // 웹사이트
    contactInfo: "", // 추가 연락처 정보
    
    // 비용 정보
    clientExperienceFee: "", // 내담자경험 비용
    hourlyRate: "",
    
    // 국가 프로그램 참여
    participatesInNationalProgram: false,
    nationalProgramAdditionalFee: 0,
    
    // 기타 정보
    license: "",
    licenseNumber: "",
    association: "",
    experience: "",
    education: "",
    university: "",
    therapeuticApproach: "",
    availableHours: "",
    additionalFee: "",
    location: "",
    onlineAvailable: "",
    introduction: "",
    careerBackground: "",
    
    // 프로필 설정
    isProfilePublic: true,
    allowReviews: true,
  });

  const handleChange = (field: string, value: string | boolean | number | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayFieldChange = (fieldName: string, value: string, checked: boolean) => {
    const currentValues = formData[fieldName as keyof typeof formData] as string[] || [];
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter(item => item !== value);
    handleChange(fieldName, newValues);
  };

  // 이미지 리사이즈 함수
  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        const targetWidth = 400;
        const targetHeight = 400;
        
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        
        const scale = Math.min(targetWidth / img.width, targetHeight / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        
        const x = (targetWidth - scaledWidth) / 2;
        const y = (targetHeight - scaledHeight) / 2;
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, targetWidth, targetHeight);
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
        
        const base64 = canvas.toDataURL('image/jpeg', 0.8);
        resolve(base64);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "파일 형식 오류",
        description: "이미지 파일만 업로드할 수 있습니다.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "파일 크기 초과",
        description: "파일 크기는 5MB 이하여야 합니다.",
        variant: "destructive",
      });
      return;
    }

    try {
      const resizedImage = await resizeImage(file);
      setProfileImage(resizedImage);
      handleChange('profileImage', resizedImage);
    } catch (error) {
      toast({
        title: "이미지 처리 오류",
        description: "이미지 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "오류",
        description: "비밀번호가 일치하지 않습니다.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.firstName || !formData.lastName) {
      toast({
        title: "필수 정보 누락",
        description: "이름을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: 'supervisor',
          gender: formData.gender,
          phone: formData.phone,
          birthYear: formData.birthYear,
          // 수퍼바이저 프로필 정보 (카드에 표시될 정보)
          name: `${formData.firstName}${formData.lastName}`,
          profileImageUrl: formData.profileImage,
          affiliation: formData.affiliation,
          summary: formData.summary,
          specialization: formData.specialization,
          qualifications: formData.qualifications,
          targetGroups: formData.targetGroups,
          concernTypes: formData.concernTypes,
          emotionSymptoms: formData.emotionSymptoms,
          specialExperiences: formData.specialExperiences,
          counselingMethods: formData.counselingMethods,
          counselingRegions: formData.counselingRegions,
          // 연락처 정보  
          phoneNumber: formData.phoneNumber || null,
          emailContact: formData.emailContact || null,
          kakaoId: formData.kakaoId,
          website: formData.website,
          contactInfo: formData.contactInfo,
          // 비용 정보
          clientExperienceFee: parseInt(formData.clientExperienceFee) || 0,
          // 국가 프로그램
          participatesInNationalProgram: formData.participatesInNationalProgram,
          nationalProgramAdditionalFee: formData.nationalProgramAdditionalFee,
          // 프로필 설정
          isProfilePublic: formData.isProfilePublic,
          allowReviews: true, // 기본값으로 설정 (향후 기능)
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        toast({
          title: "회원가입 완료",
          description: "수퍼바이저 계정이 성공적으로 생성되었습니다. 승인을 기다려주세요.",
        });
        setLocation('/login');
      } else {
        const error = await response.json();
        toast({
          title: "회원가입 실패",
          description: error.message || "회원가입 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "회원가입 실패",
        description: "네트워크 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/register')}
              className="p-1"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                수퍼바이저 회원가입
              </CardTitle>
              <CardDescription className="text-gray-600">
                수련생을 지도할 수퍼바이저 계정을 만들어보세요
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 프로필 사진 업로드 */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">프로필 사진</Label>
              <div className="flex items-center space-x-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage 
                    src={profileImage || undefined} 
                    alt="프로필 미리보기" 
                  />
                  <AvatarFallback className="text-lg">
                    {formData.firstName?.charAt(0) || '프'}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      ref={fileInputRef}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      사진 업로드
                    </Button>
                    {profileImage && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setProfileImage(null);
                          handleChange('profileImage', '');
                        }}
                      >
                        삭제
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    JPG, PNG 파일 (최대 5MB)<br />
                    카드에 표시될 프로필 사진
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="lastName">성</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  required
                  placeholder="김"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstName">이름</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  required
                  placeholder="지영"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="affiliation">소속 기관</Label>
                <Input
                  id="affiliation"
                  type="text"
                  placeholder="한국심리상담센터"
                  value={formData.affiliation}
                  onChange={(e) => handleChange('affiliation', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="specialization">전문 분야</Label>
                <Input
                  id="specialization"
                  type="text"
                  placeholder="트라우마와 PTSD 치료"
                  value={formData.specialization}
                  onChange={(e) => handleChange('specialization', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="summary">소개글</Label>
              <Textarea
                id="summary"
                placeholder="트라우마와 PTSD 치료 전문가입니다. EMDR과 인지처리치료를 통해 외상 후 스트레스를 겪는 분들의 회복을 돕습니다."
                value={formData.summary}
                onChange={(e) => handleChange('summary', e.target.value)}
                rows={3}
              />
            </div>
            
            {/* 기본 가입 정보 */}
            <Separator />
            <h3 className="text-lg font-semibold">계정 정보</h3>

            <div className="space-y-2">
              <Label htmlFor="email">계정 이메일 *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
                placeholder="supervisor@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  required
                  placeholder="8자 이상 입력해주세요"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">비밀번호 확인</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                required
                placeholder="비밀번호를 다시 입력해주세요"
              />
            </div>

            {/* 연락처 정보 */}
            <Separator />
            <h3 className="text-lg font-semibold">연락처 정보 (카드에 표시)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">전화번호</Label>
                <Input
                  id="phoneNumber"
                  type="text"
                  placeholder="010-5555-7777"
                  value={formData.phoneNumber}
                  onChange={(e) => handleChange('phoneNumber', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="emailContact">상담 문의 이메일</Label>
                <Input
                  id="emailContact"
                  type="email"
                  placeholder="park.jiyoung@therapy.kr"
                  value={formData.emailContact}
                  onChange={(e) => handleChange('emailContact', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="kakaoId">카카오톡 ID</Label>
                <Input
                  id="kakaoId"
                  type="text"
                  placeholder="mind_park"
                  value={formData.kakaoId}
                  onChange={(e) => handleChange('kakaoId', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="website">웹사이트</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://mindcare-park.com"
                  value={formData.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                />
              </div>
            </div>

            {/* 자격증 선택 */}
            <Separator />
            <h3 className="text-lg font-semibold">전문 분야 선택</h3>
            
            <div className="space-y-3">
              <Label className="text-sm font-medium">자격증</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 border rounded-lg p-4 max-h-40 overflow-y-auto">
                {CATEGORIES.qualifications.map((qualification) => (
                  <div key={qualification} className="flex items-center space-x-2">
                    <Checkbox
                      id={`qualification-${qualification}`}
                      checked={formData.qualifications.includes(qualification)}
                      onCheckedChange={(checked) => 
                        handleArrayFieldChange('qualifications', qualification, !!checked)
                      }
                    />
                    <Label 
                      htmlFor={`qualification-${qualification}`}
                      className="text-sm cursor-pointer"
                    >
                      {qualification}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">대상군</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 border rounded-lg p-4 max-h-40 overflow-y-auto">
                {CATEGORIES.targetGroups.map((group) => (
                  <div key={group} className="flex items-center space-x-2">
                    <Checkbox
                      id={`targetGroup-${group}`}
                      checked={formData.targetGroups.includes(group)}
                      onCheckedChange={(checked) => 
                        handleArrayFieldChange('targetGroups', group, !!checked)
                      }
                    />
                    <Label 
                      htmlFor={`targetGroup-${group}`}
                      className="text-sm cursor-pointer"
                    >
                      {group}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">상담 영역</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 border rounded-lg p-4 max-h-40 overflow-y-auto">
                {CATEGORIES.concernTypes.map((concern) => (
                  <div key={concern} className="flex items-center space-x-2">
                    <Checkbox
                      id={`concern-${concern}`}
                      checked={formData.concernTypes.includes(concern)}
                      onCheckedChange={(checked) => 
                        handleArrayFieldChange('concernTypes', concern, !!checked)
                      }
                    />
                    <Label 
                      htmlFor={`concern-${concern}`}
                      className="text-sm cursor-pointer"
                    >
                      {concern}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">상담 기법</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 border rounded-lg p-4 max-h-40 overflow-y-auto">
                {CATEGORIES.counselingMethods.map((method) => (
                  <div key={method} className="flex items-center space-x-2">
                    <Checkbox
                      id={`method-${method}`}
                      checked={formData.counselingMethods.includes(method)}
                      onCheckedChange={(checked) => 
                        handleArrayFieldChange('counselingMethods', method, !!checked)
                      }
                    />
                    <Label 
                      htmlFor={`method-${method}`}
                      className="text-sm cursor-pointer"
                    >
                      {method}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* 정서 증상 선택 */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">정서 증상</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 border rounded-lg p-4 max-h-40 overflow-y-auto">
                {CATEGORIES.emotionSymptoms.map((symptom) => (
                  <div key={symptom} className="flex items-center space-x-2">
                    <Checkbox
                      id={`emotion-${symptom}`}
                      checked={formData.emotionSymptoms.includes(symptom)}
                      onCheckedChange={(checked) => 
                        handleArrayFieldChange('emotionSymptoms', symptom, !!checked)
                      }
                    />
                    <Label 
                      htmlFor={`emotion-${symptom}`}
                      className="text-sm cursor-pointer"
                    >
                      {symptom}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* 특수 경험 선택 */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">특수 경험</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 border rounded-lg p-4 max-h-40 overflow-y-auto">
                {CATEGORIES.specialExperiences.map((experience) => (
                  <div key={experience} className="flex items-center space-x-2">
                    <Checkbox
                      id={`experience-${experience}`}
                      checked={formData.specialExperiences.includes(experience)}
                      onCheckedChange={(checked) => 
                        handleArrayFieldChange('specialExperiences', experience, !!checked)
                      }
                    />
                    <Label 
                      htmlFor={`experience-${experience}`}
                      className="text-sm cursor-pointer"
                    >
                      {experience}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* 비용 정보 */}
            <Separator />
            <h3 className="text-lg font-semibold">비용 정보</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientExperienceFee">내담자경험 비용 (원)</Label>
                <Input
                  id="clientExperienceFee"
                  type="text"
                  placeholder="80,000"
                  value={formData.clientExperienceFee}
                  onChange={(e) => handleChange('clientExperienceFee', e.target.value)}
                />
                <p className="text-xs text-gray-600">
                  내담자경험 1회당 비용 (예: 80,000원)
                </p>
              </div>
            </div>

            {/* 국가 프로그램 참여 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">전국민 마음투자지원사업 참여</Label>
                  <p className="text-sm text-gray-600">
                    전국민 마음투자지원사업에 참여하여 상담을 제공합니다
                  </p>
                </div>
                <Switch
                  checked={formData.participatesInNationalProgram}
                  onCheckedChange={(checked) => handleChange('participatesInNationalProgram', checked)}
                />
              </div>

              {formData.participatesInNationalProgram && (
                <div className="space-y-2">
                  <Label htmlFor="nationalProgramAdditionalFee">추가 요금 (원)</Label>
                  <Input
                    id="nationalProgramAdditionalFee"
                    type="number"
                    placeholder="0"
                    value={formData.nationalProgramAdditionalFee}
                    onChange={(e) => handleChange('nationalProgramAdditionalFee', parseInt(e.target.value) || 0)}
                  />
                  <p className="text-sm text-gray-600">
                    전국민 마음투자지원사업 이용 시 추가로 받는 요금 (없다면 0)
                  </p>
                </div>
              )}
            </div>

            {/* 프로필 설정 */}
            <Separator />
            <h3 className="text-lg font-semibold">프로필 설정</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4 bg-blue-50 border-blue-200">
                <div className="space-y-0.5">
                  <Label className="text-base font-semibold text-blue-900">홈페이지 프로필 노출</Label>
                  <p className="text-sm text-blue-700">
                    활성화하면 홈페이지 수퍼바이저 목록에 표시됩니다<br />
                    비활성화하면 목록에서 숨겨집니다 (마이페이지에서 언제든 변경 가능)
                  </p>
                </div>
                <Switch
                  checked={formData.isProfilePublic}
                  onCheckedChange={(checked) => handleChange('isProfilePublic', checked)}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4 bg-gray-50 border-gray-200">
                <div className="space-y-0.5">
                  <Label className="text-base text-gray-500">리뷰 허용 (향후 기능)</Label>
                  <p className="text-sm text-gray-500">
                    현재 미구현 - 추후 수련생 리뷰 시스템 개발 예정
                  </p>
                </div>
                <Switch
                  checked={formData.allowReviews}
                  onCheckedChange={(checked) => handleChange('allowReviews', checked)}
                  disabled
                />
              </div>
            </div>



            <Button 
              type="submit" 
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              disabled={isLoading}
            >
              {isLoading ? "가입 중..." : "수퍼바이저로 가입하기"}
            </Button>

            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-amber-800">승인 안내</h3>
                  <div className="mt-2 text-sm text-amber-700">
                    <p>관리자 승인 후 등록 가능합니다.</p>
                    <p>가입 후 승인 완료까지 1-2일 정도 소요될 수 있습니다.</p>
                  </div>
                </div>
              </div>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              이미 계정이 있으신가요?{" "}
              <button
                onClick={() => setLocation('/login')}
                className="text-emerald-600 hover:underline font-medium"
              >
                로그인하기
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}