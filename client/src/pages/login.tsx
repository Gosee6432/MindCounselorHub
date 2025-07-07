import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LogIn, Heart, UserPlus, Shield, AlertCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const loginMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      // JWT 토큰을 로컬 스토리지에 저장
      localStorage.setItem('auth_token', data.token);
      toast({
        title: "로그인 성공",
        description: "환영합니다!",
      });
      window.location.href = "/";
    },
    onError: (error: any) => {
      const isApprovalPending = error.message.includes("승인 대기");
      const errorMessage = isApprovalPending 
        ? "승인 대기 중입니다. 관리자 승인 후 로그인이 가능합니다." 
        : error.message || "로그인에 실패했습니다.";
      
      setError(errorMessage);
      toast({
        title: isApprovalPending ? "승인 대기 중" : "로그인 실패",
        description: errorMessage,
        variant: isApprovalPending ? "default" : "destructive",
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!formData.email || !formData.password) {
      setError("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    loginMutation.mutate(formData);
  };

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
            <CardTitle>로그인</CardTitle>
            <CardDescription>
              계정 정보를 입력하여 로그인하세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
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
                  placeholder="비밀번호를 입력하세요"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    로그인 중...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    로그인
                  </>
                )}
              </Button>

              {/* 비밀번호 찾기 링크 */}
              <div className="text-center">
                <button 
                  type="button"
                  onClick={() => setLocation('/forgot-password')}
                  className="text-sm text-gray-600 hover:text-blue-600 hover:underline"
                >
                  비밀번호를 잊으셨나요?
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">처음 방문이신가요?</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Link href="/register">
                  <Button variant="outline" className="w-full">
                    <UserPlus className="h-4 w-4 mr-2" />
                    새 계정 만들기
                  </Button>
                </Link>


              </div>
            </div>
          </CardContent>
        </Card>


      </div>
    </div>
  );
}