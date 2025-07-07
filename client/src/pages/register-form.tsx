import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserPlus, Heart, Users, BookOpen, AlertCircle, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function RegisterForm() {
  const [location] = useLocation();
  const { toast } = useToast();
  
  // URL에서 role 파라미터 추출
  const urlParams = new URLSearchParams(location.split('?')[1]);
  const role = urlParams.get('role') as 'trainee' | 'supervisor';
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
    agreePrivacy: false,
    agreeMarketing: false,
  });
  
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (!role || !['trainee', 'supervisor'].includes(role)) {
      window.location.href = "/register";
    }
  }, [role]);

  const registerMutation = useMutation({
    mutationFn: async (data: typeof formData & { role: string }) => {
      return apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      toast({
        title: "회원가입 완료",
        description: "성공적으로 가입되었습니다. 로그인해주세요.",
      });
      window.location.href = "/login";
    },
    onError: (error: any) => {
      const message = error.message || "회원가입에 실패했습니다.";
      setErrors([message]);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    // Validation
    const newErrors: string[] = [];
    
    if (!formData.firstName.trim()) newErrors.push("이름을 입력해주세요.");
    if (!formData.lastName.trim()) newErrors.push("성을 입력해주세요.");
    if (!formData.email.trim()) newErrors.push("이메일을 입력해주세요.");
    if (!formData.password) newErrors.push("비밀번호를 입력해주세요.");
    if (formData.password.length < 8) newErrors.push("비밀번호는 8자 이상이어야 합니다.");
    if (formData.password !== formData.confirmPassword) newErrors.push("비밀번호가 일치하지 않습니다.");
    if (!formData.agreeTerms) newErrors.push("이용약관에 동의해주세요.");
    if (!formData.agreePrivacy) newErrors.push("개인정보처리방침에 동의해주세요.");

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    registerMutation.mutate({ ...formData, role });
  };

  if (!role) {
    return null;
  }

  const roleInfo = {
    trainee: {
      title: "수련생 회원가입",
      icon: Users,
      description: "내담경험을 희망하는 심리상담 수련생으로 가입합니다.",
      color: "blue"
    },
    supervisor: {
      title: "수퍼바이저 회원가입", 
      icon: BookOpen,
      description: "수련생을 지도하는 심리상담 전문가로 가입합니다.",
      color: "green"
    }
  };

  const info = roleInfo[role];
  const IconComponent = info.icon;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <Heart className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            좋은 수련, 좋은 상담자
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            심리상담 전문가와 수련생을 위한 플랫폼
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 bg-${info.color}-100 rounded-full flex items-center justify-center`}>
                  <IconComponent className={`h-5 w-5 text-${info.color}-600`} />
                </div>
                <div>
                  <CardTitle>{info.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {info.description}
                  </CardDescription>
                </div>
              </div>
              <Link href="/register">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1">
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lastName">성</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    placeholder="김"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="firstName">이름</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    placeholder="상담"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="example@email.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="8자 이상 입력해주세요"
                  required
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  placeholder="비밀번호를 다시 입력해주세요"
                  required
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="agreeTerms"
                    checked={formData.agreeTerms}
                    onCheckedChange={(checked) => setFormData({...formData, agreeTerms: checked as boolean})}
                  />
                  <Label htmlFor="agreeTerms" className="text-sm">
                    <span className="text-red-500">*</span> 
                    <Link href="#" className="text-blue-600 hover:underline">이용약관</Link>에 동의합니다
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="agreePrivacy"
                    checked={formData.agreePrivacy}
                    onCheckedChange={(checked) => setFormData({...formData, agreePrivacy: checked as boolean})}
                  />
                  <Label htmlFor="agreePrivacy" className="text-sm">
                    <span className="text-red-500">*</span>
                    <Link href="#" className="text-blue-600 hover:underline">개인정보처리방침</Link>에 동의합니다
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="agreeMarketing"
                    checked={formData.agreeMarketing}
                    onCheckedChange={(checked) => setFormData({...formData, agreeMarketing: checked as boolean})}
                  />
                  <Label htmlFor="agreeMarketing" className="text-sm">
                    마케팅 정보 수신에 동의합니다 (선택)
                  </Label>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    가입 처리 중...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    {role === 'supervisor' ? '수퍼바이저로 가입하기' : '수련생으로 가입하기'}
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                이미 계정이 있으신가요?{" "}
                <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  로그인하기
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}