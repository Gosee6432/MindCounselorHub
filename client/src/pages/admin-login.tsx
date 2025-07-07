import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, LogIn, AlertCircle } from "lucide-react";

export default function AdminLogin() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [credentials, setCredentials] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (user?.role === 'admin') {
        window.location.href = "/admin-dashboard";
      } else {
        window.location.href = "/";
      }
    }
  }, [isAuthenticated, isLoading, user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For demo purposes, use test credentials
    if (credentials.email === "admin@test.com" && credentials.password === "admin123") {
      window.location.href = "/api/login";
    } else {
      setError("잘못된 관리자 계정입니다.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            관리자 로그인
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            시스템 관리자 전용 페이지입니다.
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>관리자 인증</CardTitle>
            <CardDescription>
              관리자 권한으로 로그인하세요.
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
                  value={credentials.email}
                  onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                  placeholder="admin@test.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                  placeholder="admin123"
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                <LogIn className="h-4 w-4 mr-2" />
                관리자 로그인
              </Button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">테스트 계정 정보</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>관리자:</strong> admin@test.com / admin123</p>
                <p><strong>수퍼바이저:</strong> supervisor@test.com</p>
                <p><strong>수련생:</strong> trainee@test.com</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}