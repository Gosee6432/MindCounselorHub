import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MessageSquare, ThumbsUp, Eye, PenTool, User, Calendar, Pin, Heart, Search, Filter, Flag } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/header";
import type { CommunityPost } from "@shared/schema";

export default function Community() {
  const [selectedTab, setSelectedTab] = useState("all");
  const [showWriteDialog, setShowWriteDialog] = useState(false);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "",
    nickname: "",
    password: ""
  });
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [commentReplies, setCommentReplies] = useState<Record<number, any[]>>({});
  
  const [newComment, setNewComment] = useState({
    nickname: "",
    password: "",
    content: ""
  });
  const [replyContent, setReplyContent] = useState({
    nickname: "",
    password: "",
    content: "",
  });
  const [editingComment, setEditingComment] = useState<number | null>(null);
  const [editCommentData, setEditCommentData] = useState({
    nickname: "",
    password: "",
    content: ""
  });
  const [deletingComment, setDeletingComment] = useState<number | null>(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const { toast } = useToast();

  // Helper function to render replies recursively
  const renderReplies = (parentId: number, allComments: any[], depth: number): React.ReactNode => {
    const replies = allComments.filter((comment: any) => comment.parentId === parentId);
    if (replies.length === 0) return null;

    const maxDepth = 3; // Maximum nesting depth

    return (
      <div className={`mt-3 space-y-3 ${depth <= maxDepth ? `ml-${Math.min(depth * 6, 18)} pl-4 border-l-2 border-gray-300` : ''}`}>
        {replies.map((reply: any) => (
          <div key={reply.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{reply.anonymousNickname}</span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">답글</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{formatDate(reply.createdAt)}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingComment(reply.id)}
                  className="text-xs text-gray-600 hover:text-gray-800"
                >
                  수정
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeletingComment(reply.id)}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  삭제
                </Button>
                {depth < maxDepth && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyingTo(reply.id)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    답글
                  </Button>
                )}
              </div>
            </div>
            
            {editingComment === reply.id ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input 
                    placeholder="닉네임"
                    value={editCommentData.nickname}
                    onChange={(e) => setEditCommentData({...editCommentData, nickname: e.target.value})}
                  />
                  <Input 
                    type="password" 
                    placeholder="비밀번호"
                    value={editCommentData.password}
                    onChange={(e) => setEditCommentData({...editCommentData, password: e.target.value})}
                  />
                </div>
                <Textarea 
                  value={editCommentData.content}
                  onChange={(e) => setEditCommentData({...editCommentData, content: e.target.value})}
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleEditComment(reply.id)}
                    disabled={editCommentMutation.isPending}
                  >
                    {editCommentMutation.isPending ? "수정 중..." : "수정 완료"}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setEditingComment(null)}
                  >
                    취소
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-gray-700 leading-relaxed mb-3">{reply.content}</p>
            )}

            {/* Reply form for this comment */}
            {replyingTo === reply.id && (
              <div className="mt-3 bg-white rounded-lg p-3 border border-blue-200">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <Input 
                    placeholder="닉네임"
                    value={replyContent.nickname}
                    onChange={(e) => setReplyContent({...replyContent, nickname: e.target.value})}
                    className="text-sm"
                  />
                  <Input 
                    type="password" 
                    placeholder="비밀번호"
                    value={replyContent.password}
                    onChange={(e) => setReplyContent({...replyContent, password: e.target.value})}
                    className="text-sm"
                  />
                </div>
                <Textarea 
                  placeholder="답글 내용을 입력하세요..." 
                  rows={2} 
                  className="mb-2 text-sm"
                  value={replyContent.content}
                  onChange={(e) => setReplyContent({...replyContent, content: e.target.value})}
                />
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="bg-blue-600 hover:bg-blue-700 text-xs"
                    onClick={() => {
                      if (!replyContent.nickname.trim() || !replyContent.content.trim()) {
                        toast({
                          title: "입력 오류",
                          description: "닉네임과 답글 내용을 입력해주세요.",
                          variant: "destructive",
                        });
                        return;
                      }
                      createCommentMutation.mutate({
                        ...replyContent,
                        parentId: reply.id
                      });
                    }}
                  >
                    답글 작성
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-xs"
                    onClick={() => setReplyingTo(null)}
                  >
                    취소
                  </Button>
                </div>
              </div>
            )}

            {/* Render nested replies */}
            {depth < maxDepth && renderReplies(reply.id, allComments, depth + 1)}
          </div>
        ))}
      </div>
    );
  };

  const { data: posts = [], isLoading } = useQuery<CommunityPost[]>({
    queryKey: ["/api/community/posts", searchQuery, selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      
      const url = `/api/community/posts${params.toString() ? '?' + params.toString() : ''}`;
      return apiRequest(url);
    },
  });

  const { data: comments = [], refetch: refetchComments } = useQuery({
    queryKey: ["/api/community/posts", selectedPost?.id, "comments"],
    enabled: !!selectedPost?.id,
    queryFn: async () => {
      if (!selectedPost?.id) return [];
      const response = await fetch(`/api/community/posts/${selectedPost.id}/comments`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      return response.json();
    },
  });

  const createCommentMutation = useMutation({
    mutationFn: async (comment: { nickname: string; password: string; content: string; parentId?: number }) => {
      if (!selectedPost) throw new Error("No post selected");
      return await apiRequest(`/api/community/posts/${selectedPost.id}/comments`, {
        method: "POST",
        body: JSON.stringify(comment)
      });
    },
    onSuccess: (_, variables) => {
      refetchComments();
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
      
      setNewComment({ nickname: "", password: "", content: "" });
      setReplyContent({ nickname: "", password: "", content: "" });
      setReplyingTo(null);
      
      toast({
        title: "댓글 작성 완료",
        description: variables.parentId ? "답글이 성공적으로 작성되었습니다." : "댓글이 성공적으로 작성되었습니다.",
      });
    },
    onError: (error) => {
      console.error("Error creating comment:", error);
      toast({
        title: "오류",
        description: "댓글 작성에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  // Edit comment mutation
  const editCommentMutation = useMutation({
    mutationFn: async (data: { commentId: number; nickname: string; password: string; content: string }) => {
      return apiRequest(`/api/community/comments/${data.commentId}`, {
        method: "PUT",
        body: JSON.stringify({
          nickname: data.nickname,
          password: data.password,
          content: data.content
        })
      });
    },
    onSuccess: () => {
      toast({ title: "댓글이 수정되었습니다" });
      setEditingComment(null);
      setEditCommentData({ nickname: "", password: "", content: "" });
      refetchComments();
    },
    onError: (error) => {
      toast({
        title: "댓글 수정 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (data: { commentId: number; password: string }) => {
      return apiRequest(`/api/community/comments/${data.commentId}`, {
        method: "DELETE",
        body: JSON.stringify({
          password: data.password
        })
      });
    },
    onSuccess: () => {
      toast({ title: "댓글이 삭제되었습니다" });
      setDeletingComment(null);
      setDeletePassword("");
      refetchComments();
    },
    onError: (error) => {
      toast({
        title: "댓글 삭제 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEditComment = (commentId: number) => {
    if (!editCommentData.nickname.trim() || !editCommentData.password.trim() || !editCommentData.content.trim()) {
      toast({
        title: "입력 오류",
        description: "닉네임, 비밀번호, 댓글 내용을 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }
    editCommentMutation.mutate({
      commentId,
      ...editCommentData
    });
  };

  const handleDeleteComment = (commentId: number) => {
    if (!deletePassword.trim()) {
      toast({
        title: "입력 오류",
        description: "비밀번호를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }
    deleteCommentMutation.mutate({
      commentId,
      password: deletePassword
    });
  };

  const createReportMutation = useMutation({
    mutationFn: async (report: { reason: string; description: string; postId: number }) => {
      return apiRequest("/api/reports", {
        method: "POST",
        body: JSON.stringify({
          postId: report.postId,
          reason: report.reason,
          description: report.description
        })
      });
    },
    onSuccess: () => {
      setShowReportDialog(false);
      setReportReason("");
      setReportDescription("");
      toast({
        title: "신고 접수 완료",
        description: "신고가 접수되었습니다. 관리자가 검토 후 조치하겠습니다.",
      });
    },
    onError: () => {
      toast({
        title: "신고 실패",
        description: "신고 접수 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  // Fetch replies for a comment
  const fetchReplies = async (commentId: number) => {
    try {
      const response = await fetch(`/api/community/comments/${commentId}/replies`);
      if (response.ok) {
        const replies = await response.json();
        setCommentReplies(prev => ({ ...prev, [commentId]: replies }));
      }
    } catch (error) {
      console.error("Failed to fetch replies:", error);
    }
  };

  const createPostMutation = useMutation({
    mutationFn: async (post: { title: string; content: string; category: string }) => {
      return await apiRequest(`/api/community/posts`, {
        method: "POST",
        body: JSON.stringify(post)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
      setShowWriteDialog(false);
      setNewPost({ title: "", content: "", category: "", nickname: "", password: "" });
      toast({
        title: "게시글 작성 완료",
        description: "게시글이 등록되었습니다.",
      });
    },
  });

  const likePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      const response = await fetch(`/api/community/posts/${postId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to like post");
      return response.json();
    },
    onSuccess: (response, postId) => {
      // Update local state immediately based on server response
      setLikedPosts(prev => {
        const newSet = new Set(prev);
        if (response.message.includes("취소")) {
          newSet.delete(postId);
        } else {
          newSet.add(postId);
        }
        return newSet;
      });
      
      // Refresh posts data
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "추천 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const categories = [
    { value: "notice", label: "공지", color: "bg-red-100 text-red-800" },
    { value: "question", label: "질문", color: "bg-green-100 text-green-800" },
    { value: "experience", label: "경험", color: "bg-purple-100 text-purple-800" },
    { value: "free", label: "자유", color: "bg-blue-100 text-blue-800" },
    { value: "info", label: "정보", color: "bg-indigo-100 text-indigo-800" },
    { value: "etc", label: "기타", color: "bg-pink-100 text-pink-800" }
  ];

  // 랜덤 닉네임 생성
  const generateRandomNickname = () => {
    const adjectives = ['익명의', '조용한', '열정적인', '성실한', '배우는', '노력하는', '진실한', '따뜻한'];
    const nouns = ['수련생', '상담사', '학습자', '연구자', '실습생', '전문가', '동료', '멘티'];
    const numbers = Math.floor(Math.random() * 9999) + 1;
    
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    
    return `${adjective}${noun}${numbers}`;
  };

  // 컴포넌트 마운트 시 랜덤 닉네임 설정
  useEffect(() => {
    if (!newPost.nickname) {
      setNewPost(prev => ({ ...prev, nickname: generateRandomNickname() }));
    }
    if (!newComment.nickname) {
      setNewComment(prev => ({ ...prev, nickname: generateRandomNickname() }));
    }
  }, []);

  // Initialize liked posts state - start fresh each session
  useEffect(() => {
    setLikedPosts(new Set());
  }, []);

  // 게시글 필터링 및 정렬
  const processedPosts = () => {
    let filteredPosts = posts;

    // 탭별 필터링
    if (selectedTab === "popular") {
      filteredPosts = posts.filter(post => (post.likes || 0) >= 10);
    } else if (selectedTab === "notice") {
      filteredPosts = posts.filter(post => post.category === "notice");
    }

    // 추천수 10개 이상인 게시글을 상단 고정 (3일 이내)
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000));
    
    const pinnedPosts = filteredPosts.filter(post => {
      const postDate = new Date(post.createdAt || 0);
      return (post.likes || 0) >= 10 && postDate >= threeDaysAgo;
    });

    const regularPosts = filteredPosts.filter(post => {
      const postDate = new Date(post.createdAt || 0);
      return !((post.likes || 0) >= 10 && postDate >= threeDaysAgo);
    });

    // 고정글은 추천수 순, 일반글은 최신순
    pinnedPosts.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    regularPosts.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    return [...pinnedPosts, ...regularPosts];
  };

  const sortedPosts = processedPosts();

  const handleSubmitPost = () => {
    if (!newPost.title.trim() || !newPost.content.trim() || !newPost.category) {
      toast({
        title: "입력 오류",
        description: "제목, 내용, 카테고리를 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    createPostMutation.mutate({
      title: newPost.title,
      content: newPost.content,
      category: newPost.category
    });
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return "-";
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return "-";
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${month}.${day}. ${hours}:${minutes}`;
  };

  const getCategoryInfo = (category: string) => {
    return categories.find(cat => cat.value === category) || { label: category, color: "bg-gray-100 text-gray-800" };
  };

  const isPinnedPost = (post: CommunityPost) => {
    return (post as any).isPinned || false;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <MessageSquare className="mx-auto h-10 w-10 mb-3" />
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            익명 커뮤니티
          </h1>
          <p className="text-green-100 mb-4">
            심리상담 수련생들의 소통 공간
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="제목, 내용으로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="lg:w-48">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="카테고리" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 카테고리</SelectItem>
                  <SelectItem value="공지">공지</SelectItem>
                  <SelectItem value="질문">질문</SelectItem>
                  <SelectItem value="경험">경험</SelectItem>
                  <SelectItem value="자유">자유</SelectItem>
                  <SelectItem value="정보">정보</SelectItem>
                  <SelectItem value="기타">기타</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Top Navigation */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant={selectedTab === "all" ? "default" : "outline"}
                onClick={() => setSelectedTab("all")}
                className={selectedTab === "all" ? "bg-blue-600 hover:bg-blue-700" : ""}
              >
                전체글
              </Button>
              <Button
                variant={selectedTab === "popular" ? "default" : "outline"}
                onClick={() => setSelectedTab("popular")}
                className={selectedTab === "popular" ? "bg-red-600 hover:bg-red-700" : ""}
              >
                추천글
              </Button>
              <Button
                variant={selectedTab === "notice" ? "default" : "outline"}
                onClick={() => setSelectedTab("notice")}
                className={selectedTab === "notice" ? "bg-yellow-600 hover:bg-yellow-700" : ""}
              >
                공지
              </Button>
            </div>
            
            <Button 
              onClick={() => setShowWriteDialog(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <PenTool className="h-4 w-4 mr-2" />
              글쓰기
            </Button>
          </div>
        </div>

        {/* Show Post Detail or Posts Table */}
        {selectedPost ? (
          <div className="bg-white rounded-lg shadow-sm border">
            {/* Post Detail View */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedPost(null)}
                  className="mb-4"
                >
                  ← 목록으로 돌아가기
                </Button>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getCategoryInfo(selectedPost.category).color}>
                    {getCategoryInfo(selectedPost.category).label}
                  </Badge>
                  {isPinnedPost(selectedPost) && (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                      <Pin className="h-3 w-3 mr-1" />
                      고정
                    </Badge>
                  )}
                </div>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-4">{selectedPost.title}</h1>
              
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 pb-4 border-b">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {selectedPost.anonymousNickname}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(selectedPost.createdAt)}
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  조회 {selectedPost.views || 0}
                </div>
              </div>

              <div className="prose max-w-none mb-8">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-base">
                  {selectedPost.content}
                </div>
              </div>

              {/* Like and Report Buttons */}
              <div className="border-t pt-6 flex items-center justify-between">
                <div></div> {/* Empty div for left spacing */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => likePostMutation.mutate(selectedPost.id)}
                  disabled={likePostMutation.isPending}
                  className="flex items-center space-x-1 hover:bg-red-50 px-2 py-1"
                >
                  <Heart 
                    className={`w-5 h-5 transition-all duration-200 ${
                      likedPosts.has(selectedPost.id) 
                        ? 'fill-red-500 text-red-500' 
                        : 'text-gray-400 hover:text-red-400'
                    }`} 
                  />
                  <span className="text-sm text-gray-600">
                    {posts.find(p => p.id === selectedPost.id)?.likes || selectedPost.likes || 0}
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReportDialog(true)}
                  className="flex items-center space-x-1 hover:bg-red-50 px-2 py-1 text-red-600"
                >
                  <Flag className="w-4 h-4" />
                  <span className="text-sm">신고하기</span>
                </Button>
              </div>

              {/* Comments Section */}
              <div className="mt-8 border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">댓글</h3>
                
                {/* Comment Form */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <Input 
                      placeholder="닉네임"
                      value={newComment.nickname}
                      onChange={(e) => setNewComment({...newComment, nickname: e.target.value})}
                    />
                    <Input 
                      type="password" 
                      placeholder="비밀번호"
                      value={newComment.password}
                      onChange={(e) => setNewComment({...newComment, password: e.target.value})}
                    />
                  </div>
                  <Textarea 
                    placeholder="댓글 내용을 입력하세요..." 
                    rows={3} 
                    className="mb-3"
                    value={newComment.content}
                    onChange={(e) => setNewComment({...newComment, content: e.target.value})}
                  />
                  <Button 
                    size="sm" 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      if (!newComment.nickname.trim() || !newComment.password.trim() || !newComment.content.trim()) {
                        toast({
                          title: "입력 오류",
                          description: "닉네임, 비밀번호, 댓글 내용을 모두 입력해주세요.",
                          variant: "destructive",
                        });
                        return;
                      }
                      createCommentMutation.mutate(newComment);
                    }}
                    disabled={createCommentMutation.isPending}
                  >
                    {createCommentMutation.isPending ? "작성 중..." : "댓글 작성"}
                  </Button>
                </div>

                {/* Comments List */}
                <div className="space-y-4">
                  <div className="text-sm text-gray-600 mb-4">
                    총 {comments?.length || 0}개의 댓글
                  </div>
                  {!comments || comments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                      아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {comments.filter((comment: any) => !comment.parentId).map((comment: any) => (
                        <div key={comment.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">{comment.anonymousNickname}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">{formatDate(comment.createdAt)}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingComment(comment.id)}
                                className="text-xs text-gray-600 hover:text-gray-800"
                              >
                                수정
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeletingComment(comment.id)}
                                className="text-xs text-red-600 hover:text-red-800"
                              >
                                삭제
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setReplyingTo(comment.id)}
                                className="text-xs text-blue-600 hover:text-blue-800"
                              >
                                답글
                              </Button>
                            </div>
                          </div>
                          
                          {editingComment === comment.id ? (
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <Input 
                                  placeholder="닉네임"
                                  value={editCommentData.nickname}
                                  onChange={(e) => setEditCommentData({...editCommentData, nickname: e.target.value})}
                                />
                                <Input 
                                  type="password" 
                                  placeholder="비밀번호"
                                  value={editCommentData.password}
                                  onChange={(e) => setEditCommentData({...editCommentData, password: e.target.value})}
                                />
                              </div>
                              <Textarea 
                                value={editCommentData.content}
                                onChange={(e) => setEditCommentData({...editCommentData, content: e.target.value})}
                                rows={3}
                              />
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  onClick={() => handleEditComment(comment.id)}
                                  disabled={editCommentMutation.isPending}
                                >
                                  {editCommentMutation.isPending ? "수정 중..." : "수정 완료"}
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => setEditingComment(null)}
                                >
                                  취소
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-700 leading-relaxed mb-3">{comment.content}</p>
                          )}

                          {/* Show replies hierarchically */}
                          {renderReplies(comment.id, comments, 1)}

                          {/* Reply form */}
                          {replyingTo === comment.id && (
                            <div className="mt-3 ml-6 bg-gray-50 rounded-lg p-3 border-l-2 border-blue-200">
                              <div className="grid grid-cols-2 gap-3 mb-3">
                                <Input 
                                  placeholder="닉네임"
                                  value={replyContent.nickname}
                                  onChange={(e) => setReplyContent({...replyContent, nickname: e.target.value})}
                                  className="text-sm"
                                />
                                <Input 
                                  type="password" 
                                  placeholder="비밀번호"
                                  value={replyContent.password}
                                  onChange={(e) => setReplyContent({...replyContent, password: e.target.value})}
                                  className="text-sm"
                                />
                              </div>
                              <Textarea 
                                placeholder="답글 내용을 입력하세요..." 
                                rows={2} 
                                className="mb-2 text-sm"
                                value={replyContent.content}
                                onChange={(e) => setReplyContent({...replyContent, content: e.target.value})}
                              />
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  className="bg-blue-600 hover:bg-blue-700 text-xs"
                                  onClick={() => {
                                    if (!replyContent.nickname.trim() || !replyContent.content.trim()) {
                                      toast({
                                        title: "입력 오류",
                                        description: "닉네임과 답글 내용을 입력해주세요.",
                                        variant: "destructive",
                                      });
                                      return;
                                    }
                                    createCommentMutation.mutate({
                                      ...replyContent,
                                      parentId: comment.id
                                    });
                                  }}
                                  disabled={createCommentMutation.isPending}
                                >
                                  {createCommentMutation.isPending ? "작성 중..." : "답글 작성"}
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => setReplyingTo(null)}
                                  className="text-xs"
                                >
                                  취소
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-16">번호</TableHead>
                  <TableHead className="w-24">카테고리</TableHead>
                  <TableHead>제목</TableHead>
                  <TableHead className="w-24">글쓴이</TableHead>
                  <TableHead className="w-20">작성일</TableHead>
                  <TableHead className="w-16">조회</TableHead>
                  <TableHead className="w-16">추천</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="ml-2">로딩 중...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : sortedPosts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      게시글이 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedPosts.map((post, index) => {
                    const categoryInfo = getCategoryInfo(post.category);
                    const isPostPinned = isPinnedPost(post);
                    return (
                      <TableRow 
                        key={post.id} 
                        className={`hover:bg-gray-50 cursor-pointer ${isPostPinned ? 'bg-yellow-50' : ''}`}
                        onClick={() => setSelectedPost(post)}
                      >
                        <TableCell className="text-center text-gray-500">
                          {isPostPinned ? (
                            <Pin className="h-4 w-4 text-yellow-600 mx-auto" />
                          ) : (
                            posts.length - index
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs ${categoryInfo.color}`}>
                            {categoryInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {isPostPinned && (
                              <Pin className="h-3 w-3 text-yellow-600" />
                            )}
                            <span className="font-medium text-gray-900">{post.title}</span>
                            {post.commentCount && post.commentCount > 0 && (
                              <span className="text-blue-600 text-sm">
                                [{post.commentCount}]
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {post.anonymousNickname}
                        </TableCell>
                        <TableCell className="text-gray-500 text-sm">
                          {formatDate(post.createdAt)}
                        </TableCell>
                        <TableCell className="text-center text-gray-500">
                          {post.views || 0}
                        </TableCell>
                        <TableCell className="text-center text-gray-500">
                          {post.likes || 0}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Delete Comment Dialog */}
      <Dialog open={!!deletingComment} onOpenChange={() => setDeletingComment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>댓글 삭제</DialogTitle>
            <DialogDescription>
              댓글을 삭제하려면 작성 시 입력한 비밀번호를 입력해주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="비밀번호"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeletingComment(null);
                setDeletePassword("");
              }}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDeleteComment(deletingComment!)}
              disabled={deleteCommentMutation.isPending}
            >
              {deleteCommentMutation.isPending ? "삭제 중..." : "삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Write Post Dialog */}
      <Dialog open={showWriteDialog} onOpenChange={setShowWriteDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>새 게시글 작성</DialogTitle>
            <DialogDescription>
              게시글을 작성해 주세요. 개인정보가 노출되지 않도록 주의해주세요.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nickname">닉네임</Label>
                <Input
                  id="nickname"
                  value={newPost.nickname}
                  onChange={(e) => setNewPost({...newPost, nickname: e.target.value})}
                  placeholder="닉네임"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">글 수정 비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  value={newPost.password}
                  onChange={(e) => setNewPost({...newPost, password: e.target.value})}
                  placeholder="수정/삭제시 사용할 비밀번호"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">카테고리</Label>
              <Select value={newPost.category} onValueChange={(value) => setNewPost({...newPost, category: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="카테고리를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="title">제목</Label>
              <Input
                id="title"
                value={newPost.title}
                onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                placeholder="게시글 제목을 입력하세요"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content">내용</Label>
              <Textarea
                id="content"
                value={newPost.content}
                onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                placeholder="게시글 내용을 입력하세요..."
                rows={12}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWriteDialog(false)}>
              취소
            </Button>
            <Button 
              onClick={handleSubmitPost}
              disabled={createPostMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {createPostMutation.isPending ? "등록 중..." : "등록하기"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>게시글 신고하기</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reportReason">신고 사유</Label>
              <Select value={reportReason} onValueChange={setReportReason}>
                <SelectTrigger>
                  <SelectValue placeholder="신고 사유를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="부적절한 내용">부적절한 내용</SelectItem>
                  <SelectItem value="스팸/광고">스팸/광고</SelectItem>
                  <SelectItem value="욕설/비방">욕설/비방</SelectItem>
                  <SelectItem value="개인정보 노출">개인정보 노출</SelectItem>
                  <SelectItem value="기타">기타</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="reportDescription">상세 내용 (선택사항)</Label>
              <Textarea
                id="reportDescription"
                placeholder="신고 사유에 대한 상세 내용을 입력해주세요"
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReportDialog(false)}>
              취소
            </Button>
            <Button 
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (!reportReason) {
                  toast({
                    title: "입력 오류",
                    description: "신고 사유를 선택해주세요.",
                    variant: "destructive",
                  });
                  return;
                }
                if (selectedPost) {
                  createReportMutation.mutate({
                    reason: reportReason,
                    description: reportDescription,
                    postId: selectedPost.id
                  });
                }
              }}
              disabled={createReportMutation.isPending}
            >
              {createReportMutation.isPending ? "신고 중..." : "신고하기"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}