import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function RegisterTrainee() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    gender: "",
    phone: "",
    birthYear: "",
    education: "",
    university: "",
    currentStatus: "",
    targetCertification: "",
    counselingExperience: "",
    interests: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "비밀번호 불일치",
        description: "비밀번호와 비밀번호 확인이 일치하지 않습니다.",
        variant: "destructive",
      });
      return;
    }

    // Required field validation
    if (!formData.gender || !formData.phone) {
      toast({
        title: "필수 정보 누락",
        description: "성별과 연락처는 필수 입력 항목입니다.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: 'trainee',
          gender: formData.gender,
          phone: formData.phone,
          birthYear: formData.birthYear,
          education: formData.education,
          university: formData.university,
          currentStatus: formData.currentStatus,
          targetCertification: formData.targetCertification,
          counselingExperience: formData.counselingExperience,
          interests: formData.interests
        }),
      });

      if (response.ok) {
        toast({
          title: "회원가입 성공",
          description: "수련생 계정이 성공적으로 생성되었습니다. 로그인해주세요.",
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
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
                수련생 회원가입
              </CardTitle>
              <CardDescription className="text-gray-600">
                심리상담 수련을 위한 계정을 만들어보세요
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="lastName">성</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required
                  placeholder="김"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstName">이름</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required
                  placeholder="수련"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                placeholder="trainee@example.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="gender">성별 *</Label>
                <Select onValueChange={(value) => handleInputChange('gender', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="성별 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">남성</SelectItem>
                    <SelectItem value="female">여성</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthYear">출생년도</Label>
                <Input
                  id="birthYear"
                  type="number"
                  value={formData.birthYear}
                  onChange={(e) => handleInputChange('birthYear', e.target.value)}
                  placeholder="1995"
                  min="1950"
                  max="2010"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">연락처 *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                required
                placeholder="010-1234-5678"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="education">학력</Label>
                <Select onValueChange={(value) => handleInputChange('education', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="학력 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="학사">학사</SelectItem>
                    <SelectItem value="석사">석사</SelectItem>
                    <SelectItem value="박사">박사</SelectItem>
                    <SelectItem value="재학중">재학중</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="university">학교/전공</Label>
                <Input
                  id="university"
                  value={formData.university}
                  onChange={(e) => handleInputChange('university', e.target.value)}
                  placeholder="OO대학교 심리학과"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentStatus">현재 상태</Label>
              <Select onValueChange={(value) => handleInputChange('currentStatus', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="현재 상태" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="학부생">학부생</SelectItem>
                  <SelectItem value="대학원생">대학원생</SelectItem>
                  <SelectItem value="수련생">수련생</SelectItem>
                  <SelectItem value="자격증 준비중">자격증 준비중</SelectItem>
                  <SelectItem value="기타">기타</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetCertification">목표 자격증</Label>
              <Select onValueChange={(value) => handleInputChange('targetCertification', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="목표 자격증" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="상담심리사 2급">상담심리사 2급</SelectItem>
                  <SelectItem value="상담심리사 1급">상담심리사 1급</SelectItem>
                  <SelectItem value="임상심리사 2급">임상심리사 2급</SelectItem>
                  <SelectItem value="임상심리사 1급">임상심리사 1급</SelectItem>
                  <SelectItem value="청소년상담사">청소년상담사</SelectItem>
                  <SelectItem value="기타">기타</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="counselingExperience">상담 경험</Label>
              <Select onValueChange={(value) => handleInputChange('counselingExperience', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="상담 경험" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="없음">없음</SelectItem>
                  <SelectItem value="실습 경험">실습 경험</SelectItem>
                  <SelectItem value="1년 미만">1년 미만</SelectItem>
                  <SelectItem value="1-3년">1-3년</SelectItem>
                  <SelectItem value="3년 이상">3년 이상</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="interests">관심 분야</Label>
              <Textarea
                id="interests"
                value={formData.interests}
                onChange={(e) => handleInputChange('interests', e.target.value)}
                placeholder="관심 있는 상담 분야나 치료 기법을 입력해주세요"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
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
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                required
                placeholder="비밀번호를 다시 입력해주세요"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? "가입 중..." : "수련생으로 가입하기"}
            </Button>
          </form>

          <div className="mt-6 text-center">
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
        </CardContent>
      </Card>
    </div>
  );
}