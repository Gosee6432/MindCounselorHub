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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Users, MessageSquare, ClipboardList, Shield, AlertTriangle, CheckCircle, X, PenTool, UserCheck, Eye, Trash2, Edit, FileText, Plus, Pin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/header";
import { useLocation } from "wouter";
import type { Report, Supervisor, CommunityPost, User, PsychologyArticle, EducationPost } from "@shared/schema";

interface AdminStats {
  totalSupervisors: number;
  totalTrainees: number;
  totalRecords: number;
  totalPosts: number;
}

export default function AdminDashboardComplete() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Pagination state
  const [approvedSupervisorsPage, setApprovedSupervisorsPage] = useState(1);
  const approvedSupervisorsPerPage = 10;
  const [showNoticeDialog, setShowNoticeDialog] = useState(false);
  const [showArticleDialog, setShowArticleDialog] = useState(false);
  const [newNotice, setNewNotice] = useState({
    title: "",
    content: ""
  });
  const [newArticle, setNewArticle] = useState({
    title: "",
    content: "",
    category: "general",
    summary: "",
    readTime: "5분"
  });
  const [showEditPostDialog, setShowEditPostDialog] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [showEditArticleDialog, setShowEditArticleDialog] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any>(null);
  const [showEducationPostDialog, setShowEducationPostDialog] = useState(false);
  const [showEditEducationPostDialog, setShowEditEducationPostDialog] = useState(false);
  const [editingEducationPost, setEditingEducationPost] = useState<any>(null);
  const [newEducationPost, setNewEducationPost] = useState({
    title: "",
    content: "",
    category: "workshop",
    provider: "",
    duration: "",
    fee: "",
    deadline: "",
    location: ""
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

  // Data queries
  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    enabled: user?.role === 'admin',
  });

  const { data: reports = [], refetch: refetchReports } = useQuery<Report[]>({
    queryKey: ["/api/admin/reports"],
    enabled: user?.role === 'admin',
    refetchInterval: 2000, // Auto-refresh every 2 seconds to show updates
  });

  const { data: pendingSupervisors = [], refetch: refetchPendingSupervisors } = useQuery<Supervisor[]>({
    queryKey: ["/api/admin/pending-supervisors"],
    enabled: user?.role === 'admin',
  });

  const { data: allSupervisors = [] } = useQuery<Supervisor[]>({
    queryKey: ["/api/admin/all-supervisors"],
    enabled: user?.role === 'admin',
  });

  const { data: communityPosts = [] } = useQuery<CommunityPost[]>({
    queryKey: ["/api/community/posts"],
    enabled: user?.role === 'admin',
  });

  const { data: psychologyArticles = [] } = useQuery<PsychologyArticle[]>({
    queryKey: ["/api/psychology/articles"],
    enabled: user?.role === 'admin',
  });

  const { data: educationPosts = [] } = useQuery({
    queryKey: ["/api/education/posts"],
    enabled: user?.role === 'admin',
  });

  // Mutations
  const updateReportMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest(`/api/admin/reports/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status })
      });
    },
    onSuccess: (data, { status }) => {
      // Immediately update the UI with optimistic update
      queryClient.setQueryData(["/api/admin/reports"], (oldData: Report[]) => {
        if (!oldData) return oldData;
        return oldData.map(report => 
          report.id === data.id ? { ...report, status: status } : report
        );
      });
      // Also invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reports"] });
      toast({ 
        title: "상태 업데이트 완료",
        description: `신고 상태가 "${getStatusText(status)}"로 변경되었습니다.`
      });
    },
    onError: (error) => {
      console.error("Report update error:", error);
      toast({
        title: "상태 업데이트 실패", 
        description: "관리자 권한을 확인해주세요.",
        variant: "destructive",
      });
    },
  });

  const approveSupervisorMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/admin/supervisors/${id}/approve`, {
        method: "PUT",
        body: JSON.stringify({})
      });
    },
    onSuccess: () => {
      // Switch to approved supervisors tab
      setActiveTab("approved");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-supervisors"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/all-supervisors"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/supervisors"] });
      toast({ 
        title: "수퍼바이저 승인 완료",
        description: "수퍼바이저가 성공적으로 승인되었습니다." 
      });
    },
    onError: (error) => {
      console.error("Approval error:", error);
      // Only show error if there's an actual error with a message
      if (error?.message) {
        toast({
          title: "승인 실패",
          description: error.message,
          variant: "destructive",
        });
      }
    },
  });

  const createNoticeMutation = useMutation({
    mutationFn: async (notice: { title: string; content: string }) => {
      return apiRequest("/api/community/posts", {
        method: "POST",
        body: JSON.stringify({
          ...notice,
          category: "notice",
          isPinned: false,
        })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setShowNoticeDialog(false);
      setNewNotice({ title: "", content: "" });
      toast({
        title: "공지사항 작성 완료",
        description: "공지사항이 등록되었습니다.",
      });
    },
  });

  const createArticleMutation = useMutation({
    mutationFn: async (article: { title: string; content: string; category: string; summary: string; readTime: string }) => {
      return apiRequest("/api/admin/psychology/articles", {
        method: "POST",
        body: JSON.stringify(article)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/psychology/articles"] });
      setShowArticleDialog(false);
      setNewArticle({ title: "", content: "", category: "general", summary: "", readTime: "5분" });
      toast({
        title: "심리학 글 작성 완료",
        description: "새로운 심리학 글이 등록되었습니다.",
      });
    },
  });

  const pinPostMutation = useMutation({
    mutationFn: async ({ id, isPinned }: { id: number; isPinned: boolean }) => {
      return apiRequest(`/api/admin/posts/${id}/pin`, {
        method: "PUT",
        body: JSON.stringify({ isPinned })
      });
    },
    onSuccess: (data, { id, isPinned }) => {
      // Optimistically update the UI
      queryClient.setQueryData(["/api/community/posts"], (oldData: any[]) => {
        if (!oldData) return oldData;
        return oldData.map(post => 
          post.id === id ? { ...post, isPinned } : post
        );
      });
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
      toast({ title: isPinned ? "게시글이 상단에 고정되었습니다" : "게시글 고정이 해제되었습니다" });
    },
  });

  const hideSupervisorMutation = useMutation({
    mutationFn: async ({ id, isVisible }: { id: number; isVisible: boolean }) => {
      return apiRequest(`/api/admin/supervisors/${id}/visibility`, {
        method: "PUT",
        body: JSON.stringify({ isVisible })
      });
    },
    onSuccess: (data, { id, isVisible }) => {
      // Optimistically update the UI
      queryClient.setQueryData(["/api/admin/all-supervisors"], (oldData: any[]) => {
        if (!oldData) return oldData;
        return oldData.map(supervisor => 
          supervisor.id === id ? { ...supervisor, isVisible } : supervisor
        );
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/all-supervisors"] });
      queryClient.invalidateQueries({ queryKey: ["/api/supervisors"] });
      toast({ 
        title: isVisible ? "수퍼바이저가 홈에서 표시됩니다" : "수퍼바이저가 홈에서 숨겨졌습니다" 
      });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      return apiRequest(`/api/community/posts/${postId}`, {
        method: "DELETE"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
      toast({ title: "게시글이 삭제되었습니다" });
    },
  });

  const deleteArticleMutation = useMutation({
    mutationFn: async (articleId: number) => {
      return apiRequest(`/api/psychology/articles/${articleId}`, {
        method: "DELETE"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/psychology/articles"] });
      toast({ title: "심리학 글이 삭제되었습니다" });
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: async (post: { id: number; title: string; content: string; category: string }) => {
      return apiRequest(`/api/admin/posts/${post.id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: post.title,
          content: post.content,  
          category: post.category
        })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
      setShowEditPostDialog(false);
      setEditingPost(null);
      toast({
        title: "게시글 수정 완료",
        description: "게시글이 수정되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "수정 실패",
        description: "게시글 수정 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const updateArticleMutation = useMutation({
    mutationFn: async (article: { id: number; title: string; content: string; summary: string }) => {
      return apiRequest("PUT", `/api/admin/psychology/articles/${article.id}`, {
        title: article.title,
        content: article.content,
        summary: article.summary
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/psychology/articles"] });
      setShowEditArticleDialog(false);
      setEditingArticle(null);
      toast({
        title: "심리학 글 수정 완료",
        description: "심리학 글이 수정되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "수정 실패",
        description: "심리학 글 수정 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });



  const handleApproveSupervisor = (id: number) => {
    approveSupervisorMutation.mutate(id);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '대기중';
      case 'reviewed':
        return '검토중';
      case 'completed':
        return '조치완료';
      default:
        return status;
    }
  };

  const createEducationPostMutation = useMutation({
    mutationFn: async (post: any) => {
      return apiRequest("POST", "/api/education/posts", post);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/education/posts"] });
      setShowEducationPostDialog(false);
      setNewEducationPost({
        title: "",
        content: "",
        category: "workshop",
        provider: "",
        duration: "",
        fee: "",
        deadline: "",
        location: ""
      });
      toast({
        title: "교육정보 글 작성 완료",
        description: "새로운 교육정보가 등록되었습니다.",
      });
    },
  });

  const updateEducationPostMutation = useMutation({
    mutationFn: async (post: any) => {
      return apiRequest("PUT", `/api/education/posts/${post.id}`, post);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/education/posts"] });
      setShowEditEducationPostDialog(false);
      setEditingEducationPost(null);
      toast({
        title: "교육정보 글 수정 완료",
        description: "교육정보가 수정되었습니다.",
      });
    },
  });

  const deleteEducationPostMutation = useMutation({
    mutationFn: async (postId: number) => {
      return apiRequest("DELETE", `/api/education/posts/${postId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/education/posts"] });
      toast({ title: "교육정보 글이 삭제되었습니다" });
    },
  });

  const handleStatusChange = (reportId: number, newStatus: string) => {
    updateReportMutation.mutate({ id: reportId, status: newStatus });
  };

  const getReportTypeText = (report: Report) => {
    if (report.postId) return "게시글";
    if (report.commentId) return "댓글";
    if (report.reportedUserId) return "사용자";
    return "기타";
  };

  const pendingReports = reports.filter(report => report.status === 'pending');
  const approvedSupervisors = allSupervisors.filter(s => s.approvalStatus === 'approved');
  const noticesAndUpdates = communityPosts.filter(post => post.category === 'notice' || post.category === 'update');
  
  // Pagination for approved supervisors
  const totalApprovedSupervisors = approvedSupervisors.length;
  const totalApprovedPages = Math.ceil(totalApprovedSupervisors / approvedSupervisorsPerPage);
  const startIndex = (approvedSupervisorsPage - 1) * approvedSupervisorsPerPage;
  const endIndex = startIndex + approvedSupervisorsPerPage;
  const paginatedApprovedSupervisors = approvedSupervisors.slice(startIndex, endIndex);

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
          <div className="flex space-x-3">
            <Button 
              onClick={() => setShowNoticeDialog(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <PenTool className="h-4 w-4 mr-2" />
              공지사항 작성
            </Button>
            <Button 
              onClick={() => setShowArticleDialog(true)}
              variant="outline"
            >
              <FileText className="h-4 w-4 mr-2" />
              심리학 글 작성
            </Button>
          </div>
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
                  {pendingSupervisors.length > 0 && (
                    <Badge variant="destructive" className="mt-1">
                      {pendingSupervisors.length}개 승인 대기
                    </Badge>
                  )}
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
                  {pendingReports.length > 0 && (
                    <Badge variant="destructive" className="mt-1">
                      {pendingReports.length}개 신고 대기
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="supervisors" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="supervisors" className="relative">
              수퍼바이저 승인
              {pendingSupervisors.length > 0 && (
                <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500">
                  {pendingSupervisors.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="reports" className="relative">
              신고 관리
              {pendingReports.length > 0 && (
                <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500">
                  {pendingReports.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="content">커뮤니티 관리</TabsTrigger>
            <TabsTrigger value="articles">심리학 글 관리</TabsTrigger>
            <TabsTrigger value="education">교육정보 관리</TabsTrigger>
            <TabsTrigger value="users">사용자 통계</TabsTrigger>
          </TabsList>

          {/* Supervisor Approval */}
          <TabsContent value="supervisors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserCheck className="h-5 w-5 mr-2 text-blue-600" />
                  수퍼바이저 승인 관리
                  {pendingSupervisors.length > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {pendingSupervisors.length}개 승인 대기
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingSupervisors.length === 0 ? (
                  <div className="text-center py-8">
                    <UserCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">승인 대기 중인 수퍼바이저가 없습니다</h3>
                    <p className="text-gray-500">모든 수퍼바이저가 승인되었습니다.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>이름</TableHead>
                          <TableHead>소속</TableHead>
                          <TableHead>전문분야</TableHead>
                          <TableHead>학회</TableHead>
                          <TableHead>신청일</TableHead>
                          <TableHead>작업</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingSupervisors.map((supervisor) => (
                          <TableRow key={supervisor.id}>
                            <TableCell className="font-medium">{supervisor.name}</TableCell>
                            <TableCell>{supervisor.affiliation}</TableCell>
                            <TableCell>{supervisor.specialization}</TableCell>
                            <TableCell>{supervisor.association}</TableCell>
                            <TableCell>
                              {new Date(supervisor.createdAt).toLocaleDateString('ko-KR')}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  onClick={() => setLocation(`/supervisor/${supervisor.id}`)}
                                  variant="outline"
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  상세보기
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleApproveSupervisor(supervisor.id)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  승인
                                </Button>
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

            {/* Approved Supervisors List */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>승인된 수퍼바이저 목록</CardTitle>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>총 {totalApprovedSupervisors}명</span>
                  {totalApprovedPages > 1 && (
                    <span>
                      ({approvedSupervisorsPage}/{totalApprovedPages} 페이지)
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {approvedSupervisors.length === 0 ? (
                  <div className="text-center py-8">
                    <UserCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">승인된 수퍼바이저가 없습니다</h3>
                    <p className="text-gray-500">아직 승인된 수퍼바이저가 없습니다.</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>이름</TableHead>
                            <TableHead>소속</TableHead>
                            <TableHead>전문분야</TableHead>
                            <TableHead>학회</TableHead>
                            <TableHead>상태</TableHead>
                            <TableHead>승인일</TableHead>
                            <TableHead>표시상태</TableHead>
                            <TableHead>작업</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedApprovedSupervisors.map((supervisor) => (
                            <TableRow key={supervisor.id}>
                              <TableCell className="font-medium">{supervisor.name}</TableCell>
                              <TableCell>{supervisor.affiliation}</TableCell>
                              <TableCell>{supervisor.specialization}</TableCell>
                              <TableCell>{supervisor.association}</TableCell>
                              <TableCell>
                                <Badge className="bg-green-500 hover:bg-green-600">승인완료</Badge>
                              </TableCell>
                              <TableCell>
                                {new Date(supervisor.updatedAt).toLocaleDateString('ko-KR')}
                              </TableCell>
                              <TableCell>
                                <Badge variant={supervisor.isVisible ? "default" : "secondary"}>
                                  {supervisor.isVisible ? "표시중" : "숨김"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    size="sm"
                                    onClick={() => setLocation(`/supervisor/${supervisor.id}`)}
                                    variant="outline"
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    상세보기
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant={supervisor.isVisible ? "secondary" : "default"}
                                    onClick={() => hideSupervisorMutation.mutate({ 
                                      id: supervisor.id, 
                                      isVisible: !supervisor.isVisible 
                                    })}
                                    className={supervisor.isVisible ? "" : "bg-green-600 hover:bg-green-700 text-white"}
                                  >
                                    {supervisor.isVisible ? "숨기기" : "표시하기"}
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    
                    {/* Pagination */}
                    {totalApprovedPages > 1 && (
                      <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-gray-500">
                          {startIndex + 1}-{Math.min(endIndex, totalApprovedSupervisors)}명 / 총 {totalApprovedSupervisors}명
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setApprovedSupervisorsPage(prev => Math.max(1, prev - 1))}
                            disabled={approvedSupervisorsPage === 1}
                          >
                            <ChevronLeft className="h-4 w-4" />
                            이전
                          </Button>
                          <span className="text-sm text-gray-500">
                            {approvedSupervisorsPage} / {totalApprovedPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setApprovedSupervisorsPage(prev => Math.min(totalApprovedPages, prev + 1))}
                            disabled={approvedSupervisorsPage === totalApprovedPages}
                          >
                            다음
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Approved Supervisors Summary */}
            <Card>
              <CardHeader>
                <CardTitle>승인된 수퍼바이저 통계</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800">총 승인 수퍼바이저</h4>
                    <p className="text-2xl font-bold text-green-900">{approvedSupervisors.length}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800">평균 평점</h4>
                    <p className="text-2xl font-bold text-blue-900">
                      {approvedSupervisors.length > 0 
                        ? (approvedSupervisors.reduce((sum, s) => sum + s.rating, 0) / approvedSupervisors.length).toFixed(1)
                        : '-'
                      }
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-800">국가사업 참여</h4>
                    <p className="text-2xl font-bold text-purple-900">
                      {approvedSupervisors.filter(s => s.participatesInNationalProgram).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

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
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Select
                                  value={report.status}
                                  onValueChange={(value) => handleStatusChange(report.id, value)}
                                  disabled={updateReportMutation.isPending}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">대기중</SelectItem>
                                    <SelectItem value="reviewed">검토중</SelectItem>
                                    <SelectItem value="completed">조치완료</SelectItem>
                                  </SelectContent>
                                </Select>
                                {report.postId && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => window.open(`/community?post=${report.postId}`, '_blank')}
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    보기
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
          </TabsContent>

          {/* Community Management */}
          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>커뮤니티 게시글 관리</CardTitle>
                <Button 
                  onClick={() => setShowNoticeDialog(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  공지글 작성
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>제목</TableHead>
                        <TableHead>카테고리</TableHead>
                        <TableHead>작성자</TableHead>
                        <TableHead>작성일</TableHead>
                        <TableHead>좋아요</TableHead>
                        <TableHead>작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {communityPosts.slice(0, 10).map((post) => (
                        <TableRow key={post.id}>
                          <TableCell className="font-medium max-w-xs truncate">
                            {post.title}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Badge variant={post.category === 'notice' ? 'destructive' : 'secondary'}>
                                {post.category === 'notice' ? '공지' : 
                                 post.category === 'question' ? '질문' :
                                 post.category === 'experience' ? '경험' :
                                 post.category === 'info' ? '정보' :
                                 post.category === 'etc' ? '기타' : '자유'}
                              </Badge>
                              {post.isPinned && (
                                <Badge variant="outline" className="text-blue-600">
                                  <Pin className="h-3 w-3 mr-1" />
                                  고정
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{post.authorNickname}</TableCell>
                          <TableCell>
                            {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                          </TableCell>
                          <TableCell>{post.likes}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(`/community?post=${post.id}`, '_blank')}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                보기
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingPost(post);
                                  setShowEditPostDialog(true);
                                }}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                수정
                              </Button>
                              <Button
                                size="sm"
                                variant={post.isPinned ? "default" : "outline"}
                                onClick={() => pinPostMutation.mutate({ id: post.id, isPinned: !post.isPinned })}
                                className={post.isPinned ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}
                              >
                                <Pin className={`h-4 w-4 mr-1 ${post.isPinned ? "fill-current" : ""}`} />
                                {post.isPinned ? "고정해제" : "상단고정"}
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    삭제
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>게시글 삭제</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      이 게시글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>취소</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => deletePostMutation.mutate(post.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      삭제
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Psychology Articles Management */}
          <TabsContent value="articles" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>심리학 글 관리</CardTitle>
                <Button 
                  onClick={() => setShowArticleDialog(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  심리학 글 작성
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>제목</TableHead>
                        <TableHead>카테고리</TableHead>
                        <TableHead>작성일</TableHead>
                        <TableHead>조회수</TableHead>
                        <TableHead>작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {psychologyArticles.slice(0, 10).map((article) => (
                        <TableRow key={article.id}>
                          <TableCell className="font-medium max-w-xs truncate">
                            {article.title}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{article.category}</Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(article.createdAt).toLocaleDateString('ko-KR')}
                          </TableCell>
                          <TableCell>{article.views || 0}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setLocation(`/psychology-info/article/${article.id}`)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                보기
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingArticle(article);
                                  setShowEditArticleDialog(true);
                                }}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                수정
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    삭제
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>심리학 글 삭제</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      이 심리학 글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>취소</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => deleteArticleMutation.mutate(article.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      삭제
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Education Management */}
          <TabsContent value="education" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-green-600" />
                  교육정보 게시판 관리
                </CardTitle>
                <Button 
                  onClick={() => setShowArticleDialog(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  심리학 글 작성
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>제목</TableHead>
                        <TableHead>카테고리</TableHead>
                        <TableHead>작성일</TableHead>
                        <TableHead>조회수</TableHead>
                        <TableHead>작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {educationPosts.slice(0, 20).map((post) => (
                        <TableRow key={post.id}>
                          <TableCell className="font-medium max-w-xs truncate">
                            {post.title}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{post.category}</Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                          </TableCell>
                          <TableCell>{post.views || 0}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(`/education-info?post=${post.id}`, '_blank')}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                보기
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingEducationPost(post);
                                  setShowEditEducationPostDialog(true);
                                }}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                수정
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    삭제
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>심리학 글 삭제</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      이 심리학 글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>취소</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => deleteEducationPostMutation.mutate(post.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      삭제
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Statistics */}
          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>수퍼바이저 통계</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>총 수퍼바이저</span>
                      <span className="font-bold">{allSupervisors.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>승인된 수퍼바이저</span>
                      <span className="font-bold text-green-600">{approvedSupervisors.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>승인 대기</span>
                      <span className="font-bold text-yellow-600">{pendingSupervisors.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>국가사업 참여</span>
                      <span className="font-bold text-blue-600">
                        {approvedSupervisors.filter(s => s.participatesInNationalProgram).length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>커뮤니티 통계</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>총 게시글</span>
                      <span className="font-bold">{communityPosts.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>공지사항</span>
                      <span className="font-bold text-red-600">
                        {communityPosts.filter(p => p.category === 'notice').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>질문 게시글</span>
                      <span className="font-bold text-blue-600">
                        {communityPosts.filter(p => p.category === 'question').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>팁 게시글</span>
                      <span className="font-bold text-green-600">
                        {communityPosts.filter(p => p.category === 'tip').length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Notice Creation Dialog */}
      <Dialog open={showNoticeDialog} onOpenChange={setShowNoticeDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>공지사항 작성</DialogTitle>
            <DialogDescription>
              새로운 공지사항을 작성합니다. 작성된 공지사항은 커뮤니티 상단에 표시됩니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="notice-title">제목</Label>
              <Input
                id="notice-title"
                value={newNotice.title}
                onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                placeholder="공지사항 제목을 입력하세요"
              />
            </div>
            <div>
              <Label htmlFor="notice-content">내용</Label>
              <Textarea
                id="notice-content"
                value={newNotice.content}
                onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                placeholder="공지사항 내용을 입력하세요"
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNoticeDialog(false)}
            >
              취소
            </Button>
            <Button
              onClick={() => createNoticeMutation.mutate(newNotice)}
              disabled={!newNotice.title || !newNotice.content}
            >
              공지사항 등록
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Article Creation Dialog */}
      <Dialog open={showArticleDialog} onOpenChange={setShowArticleDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>심리학 글 작성</DialogTitle>
            <DialogDescription>
              새로운 심리학 글을 작성합니다. 작성된 글은 심리정보 섹션에 표시됩니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="article-title">제목</Label>
              <Input
                id="article-title"
                value={newArticle.title}
                onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
                placeholder="글 제목을 입력하세요"
              />
            </div>
            <div>
              <Label htmlFor="article-category">카테고리</Label>
              <Select 
                value={newArticle.category} 
                onValueChange={(value) => setNewArticle({ ...newArticle, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="카테고리를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">일반</SelectItem>
                  <SelectItem value="therapy">치료법</SelectItem>
                  <SelectItem value="research">연구</SelectItem>
                  <SelectItem value="case">사례</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="article-summary">요약</Label>
              <Textarea
                id="article-summary"
                value={newArticle.summary}
                onChange={(e) => setNewArticle({ ...newArticle, summary: e.target.value })}
                placeholder="글 요약을 입력하세요"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="article-readTime">읽기 시간</Label>
              <Select 
                value={newArticle.readTime} 
                onValueChange={(value) => setNewArticle({ ...newArticle, readTime: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="읽기 시간을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3분">3분</SelectItem>
                  <SelectItem value="5분">5분</SelectItem>
                  <SelectItem value="7분">7분</SelectItem>
                  <SelectItem value="10분">10분</SelectItem>
                  <SelectItem value="15분">15분</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="article-content">내용</Label>
              <Textarea
                id="article-content"
                value={newArticle.content}
                onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
                placeholder="글 내용을 입력하세요 (마크다운 문법 지원)"
                rows={8}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowArticleDialog(false)}
            >
              취소
            </Button>
            <Button
              onClick={() => createArticleMutation.mutate(newArticle)}
              disabled={!newArticle.title || !newArticle.content || !newArticle.summary}
            >
              심리학 글 등록
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Post Dialog */}
      <Dialog open={showEditPostDialog} onOpenChange={setShowEditPostDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>게시글 수정</DialogTitle>
          </DialogHeader>
          {editingPost && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">카테고리</label>
                <Select 
                  value={editingPost.category} 
                  onValueChange={(value) => setEditingPost({...editingPost, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="카테고리를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="notice">공지</SelectItem>
                    <SelectItem value="question">질문</SelectItem>
                    <SelectItem value="experience">경험</SelectItem>
                    <SelectItem value="free">자유</SelectItem>
                    <SelectItem value="info">정보</SelectItem>
                    <SelectItem value="etc">기타</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">제목</label>
                <Input
                  placeholder="제목을 입력하세요"
                  value={editingPost.title}
                  onChange={(e) => setEditingPost({...editingPost, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">내용</label>
                <Textarea
                  placeholder="내용을 입력하세요"
                  className="min-h-32"
                  value={editingPost.content}
                  onChange={(e) => setEditingPost({...editingPost, content: e.target.value})}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowEditPostDialog(false)}>
                  취소
                </Button>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => updatePostMutation.mutate(editingPost)}
                  disabled={updatePostMutation.isPending || !editingPost.title || !editingPost.content}
                >
                  {updatePostMutation.isPending ? "수정 중..." : "수정 완료"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Article Dialog */}
      <Dialog open={showEditArticleDialog} onOpenChange={setShowEditArticleDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>심리학 글 수정</DialogTitle>
          </DialogHeader>
          {editingArticle && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">제목</label>
                <Input
                  placeholder="제목을 입력하세요"
                  value={editingArticle.title}
                  onChange={(e) => setEditingArticle({...editingArticle, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">요약</label>
                <Textarea
                  placeholder="요약을 입력하세요"
                  className="min-h-20"
                  value={editingArticle.summary}
                  onChange={(e) => setEditingArticle({...editingArticle, summary: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">내용</label>
                <Textarea
                  placeholder="내용을 입력하세요"
                  className="min-h-40"
                  value={editingArticle.content}
                  onChange={(e) => setEditingArticle({...editingArticle, content: e.target.value})}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowEditArticleDialog(false)}>
                  취소
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => updateArticleMutation.mutate(editingArticle)}
                  disabled={updateArticleMutation.isPending || !editingArticle.title || !editingArticle.content || !editingArticle.summary}
                >
                  {updateArticleMutation.isPending ? "수정 중..." : "수정 완료"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}