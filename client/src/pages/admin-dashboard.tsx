import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, MessageSquare, ClipboardList, Shield, AlertTriangle, CheckCircle, X, PenTool } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/header";
import { useLocation } from "wouter";
import type { Report } from "@shared/schema";

interface AdminStats {
  totalSupervisors: number;
  totalTrainees: number;
  totalRecords: number;
  totalPosts: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [showNoticeDialog, setShowNoticeDialog] = useState(false);
  const [newNotice, setNewNotice] = useState({
    title: "",
    content: ""
  });

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      toast({
        title: "접근 권한이 없습니다",
        description: "관리자만 접근할 수 있는 페이지입니다.",
        variant: "destructive",
      });
      setLocation("/");
    }
  }, [user, setLocation, toast]);

  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    enabled: user?.role === 'admin',
  });

  const { data: reports = [], refetch: refetchReports } = useQuery<Report[]>({
    queryKey: ["/api/admin/reports"],
    enabled: user?.role === 'admin',
  });

  const updateReportMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest("PUT", `/api/admin/reports/${id}`, { status });
    },
    onSuccess: () => {
      toast({ title: "신고 상태가 업데이트되었습니다" });
      refetchReports();
    },
    onError: (error) => {
      toast({
        title: "오류",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createNoticeMutation = useMutation({
    mutationFn: async (notice: { title: string; content: string }) => {
      return await apiRequest(`/api/community/posts`, "POST", {
        ...notice,
        category: "notice"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
      setShowNoticeDialog(false);
      setNewNotice({ title: "", content: "" });
      toast({
        title: "공지사항 작성 완료",
        description: "공지사항이 등록되었습니다.",
      });
    },
  });

  const handleUpdateReportStatus = (id: number, status: string) => {
    updateReportMutation.mutate({ id, status });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">대기중</Badge>;
      case 'reviewed':
        return <Badge variant="default">검토완료</Badge>;
      case 'resolved':
        return <Badge variant="destructive">해결완료</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getReportTypeText = (report: Report) => {
    if (report.postId) return "게시글";
    if (report.commentId) return "댓글";
    if (report.reportedUserId) return "사용자";
    return "기타";
  };

  const pendingReports = reports.filter(report => report.status === 'pending');
  const reviewedReports = reports.filter(report => report.status === 'reviewed');
  const resolvedReports = reports.filter(report => report.status === 'resolved');

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">접근 권한이 없습니다</h2>
            <p className="text-gray-600">관리자만 접근할 수 있는 페이지입니다.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Shield className="h-8 w-8 mr-3 text-red-600" />
              관리자 대시보드
            </h1>
            <p className="text-gray-600 mt-2">플랫폼 관리 및 모니터링</p>
          </div>
          <Button 
            onClick={() => setShowNoticeDialog(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <PenTool className="h-4 w-4 mr-2" />
            공지사항 작성
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {statsLoading ? '-' : stats?.totalSupervisors || 0}
                  </h3>
                  <p className="text-gray-600">슈퍼바이저</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {statsLoading ? '-' : stats?.totalTrainees || 0}
                  </h3>
                  <p className="text-gray-600">수련생</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                  <ClipboardList className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {statsLoading ? '-' : stats?.totalRecords || 0}
                  </h3>
                  <p className="text-gray-600">상담 기록</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <MessageSquare className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {statsLoading ? '-' : stats?.totalPosts || 0}
                  </h3>
                  <p className="text-gray-600">커뮤니티 게시글</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList>
            <TabsTrigger value="reports" className="relative">
              신고 관리
              {pendingReports.length > 0 && (
                <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {pendingReports.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="content">콘텐츠 관리</TabsTrigger>
            <TabsTrigger value="users">사용자 관리</TabsTrigger>
          </TabsList>

          {/* Reports Management */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                  신고 관리
                  {pendingReports.length > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {pendingReports.length}개 대기중
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reports.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">신고가 없습니다</h3>
                    <p className="text-gray-500">아직 접수된 신고가 없습니다.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>신고 유형</TableHead>
                          <TableHead>신고 사유</TableHead>
                          <TableHead>신고일</TableHead>
                          <TableHead>상태</TableHead>
                          <TableHead>작업</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reports.map((report) => (
                          <TableRow key={report.id}>
                            <TableCell>{getReportTypeText(report)}</TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{report.reason}</p>
                                {report.description && (
                                  <p className="text-sm text-gray-500 mt-1">{report.description}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {new Date(report.createdAt).toLocaleDateString('ko-KR')}
                            </TableCell>
                            <TableCell>{getStatusBadge(report.status)}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {report.status === 'pending' && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleUpdateReportStatus(report.id, 'reviewed')}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      검토완료
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleUpdateReportStatus(report.id, 'resolved')}
                                    >
                                      해결완료
                                    </Button>
                                  </>
                                )}
                                {report.status === 'reviewed' && (
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleUpdateReportStatus(report.id, 'resolved')}
                                  >
                                    해결완료
                                  </Button>
                                )}
                                {report.status !== 'pending' && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleUpdateReportStatus(report.id, 'pending')}
                                  >
                                    다시 열기
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reports Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                      <AlertTriangle className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{pendingReports.length}</h3>
                      <p className="text-gray-600">대기중인 신고</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                      <CheckCircle className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{reviewedReports.length}</h3>
                      <p className="text-gray-600">검토완료</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{resolvedReports.length}</h3>
                      <p className="text-gray-600">해결완료</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Content Management */}
          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>콘텐츠 관리</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">콘텐츠 관리 기능</h3>
                  <p className="text-gray-500">향후 버전에서 구현될 예정입니다.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Management */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>사용자 관리</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">사용자 관리 기능</h3>
                  <p className="text-gray-500">향후 버전에서 구현될 예정입니다.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Notice Creation Dialog */}
      <Dialog open={showNoticeDialog} onOpenChange={setShowNoticeDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>공지사항 작성</DialogTitle>
            <DialogDescription>
              커뮤니티에 표시될 공지사항을 작성합니다. 작성된 공지는 상단에 고정됩니다.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notice-title">제목</Label>
              <Input
                id="notice-title"
                value={newNotice.title}
                onChange={(e) => setNewNotice({...newNotice, title: e.target.value})}
                placeholder="공지사항 제목을 입력하세요"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notice-content">내용</Label>
              <Textarea
                id="notice-content"
                value={newNotice.content}
                onChange={(e) => setNewNotice({...newNotice, content: e.target.value})}
                placeholder="공지사항 내용을 입력하세요..."
                rows={8}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNoticeDialog(false)}>
              취소
            </Button>
            <Button 
              onClick={() => {
                if (!newNotice.title.trim() || !newNotice.content.trim()) {
                  toast({
                    title: "입력 오류",
                    description: "제목과 내용을 모두 입력해주세요.",
                    variant: "destructive",
                  });
                  return;
                }
                createNoticeMutation.mutate(newNotice);
              }}
              disabled={createNoticeMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {createNoticeMutation.isPending ? "등록 중..." : "공지사항 등록"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
