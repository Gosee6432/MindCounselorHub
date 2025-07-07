import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function ForgotPassword() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const forgotPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      return apiRequest('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      setIsSubmitted(true);
      setError("");
      toast({
        title: "이메일 발송 완료",
        description: "비밀번호 재설정 링크가 이메일로 발송되었습니다.",
      });
    },
    onError: (error: Error) => {
      setError(error.message || "이메일 발송에 실패했습니다.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("이메일을 입력해주세요.");
      return;
    }
    forgotPasswordMutation.mutate(email);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">이메일 발송 완료</CardTitle>
              <CardDescription>
                비밀번호 재설정 링크를 발송했습니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600">
                  <strong>{email}</strong>으로 비밀번호 재설정 링크를 발송했습니다.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>확인해주세요:</strong>
                  </p>
                  <ul className="text-sm text-blue-700 mt-2 space-y-1">
                    <li>• 이메일함과 스팸함을 확인해주세요</li>
                    <li>• 링크는 1시간 후 만료됩니다</li>
                    <li>• 이메일이 오지 않으면 다시 시도해주세요</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => setIsSubmitted(false)}
                  variant="outline"
                  className="w-full"
                >
                  다시 발송하기
                </Button>
                <Button
                  onClick={() => setLocation('/login')}
                  className="w-full"
                >
                  로그인 페이지로 돌아가기
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">비밀번호 찾기</CardTitle>
            <CardDescription>
              가입시 사용한 이메일 주소를 입력해주세요
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
                <Label htmlFor="email">이메일 주소</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  가입시 사용한 이메일 주소를 정확히 입력해주세요
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={forgotPasswordMutation.isPending}
              >
                {forgotPasswordMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    발송 중...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    비밀번호 재설정 링크 발송
                  </>
                )}
              </Button>

              <div className="text-center">
                <button 
                  type="button"
                  onClick={() => setLocation('/login')}
                  className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600 hover:underline"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  로그인 페이지로 돌아가기
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}