import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Eye, EyeOff, Shield, Users, FileText, MessageSquare, BarChart3, CheckCircle, Clock, XCircle } from "lucide-react";
import type { Supervisor, Report, User } from "@shared/schema";

export default function AdminMcp() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Check if user is admin
        if (data.user.role !== 'admin') {
          toast({
            title: "접근 권한 없음",
            description: "관리자만 접근할 수 있습니다.",
            variant: "destructive",
          });
          return;
        }

        // Store token
        localStorage.setItem('auth_token', data.token);
        
        toast({
          title: "관리자 로그인 성공",
          description: "관리자 대시보드로 이동합니다.",
        });
        
        setLocation('/admin-dashboard');
      } else {
        const error = await response.json();
        toast({
          title: "로그인 실패",
          description: error.message || "이메일 또는 비밀번호를 확인해주세요.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "로그인 실패",
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-gray-700 bg-gray-800">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            시스템 관리자
          </CardTitle>
          <CardDescription className="text-gray-400">
            관리자 인증이 필요합니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">이메일</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                placeholder="admin@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">비밀번호</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  placeholder="비밀번호를 입력하세요"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-gray-300"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? "인증 중..." : "관리자 로그인"}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-4">
            <div className="bg-gray-700 p-3 rounded text-xs text-gray-300">
              <p className="font-medium mb-2">테스트 계정:</p>
              <div className="space-y-1">
                <p>관리자: admin@test.com / admin123</p>
                <p>수퍼바이저: test.supervisor2@example.com / test123</p>
                <p>수련생: test.trainee2@example.com / test123</p>
              </div>
            </div>
            
            <button
              onClick={() => setLocation('/')}
              className="text-sm text-gray-400 hover:text-gray-300 underline"
            >
              메인 페이지로 돌아가기
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}