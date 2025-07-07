import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, MapPin, Users, Clock, DollarSign, GraduationCap, Plus, Search, Filter, ExternalLink, Eye } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Header from "@/components/header";

interface EducationProgram {
  id: number;
  title: string;
  provider: string;
  duration: string;
  type: string;
  level: string;
  description: string;
  schedule: string;
  fee: string;
  deadline: string;
  location: string;
  maxStudents: number;
  currentStudents: number;
  tags: string[];
  createdAt: string;
  userId?: string;
}

export default function EducationInfo() {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<EducationProgram | null>(null);
  const [newProgram, setNewProgram] = useState({
    title: "",
    provider: "",
    duration: "",
    type: "",
    level: "",
    description: "",
    schedule: "",
    fee: "",
    deadline: "",
    location: "",
    maxStudents: "",
    tags: ""
  });

  // Mock data for education programs
  const mockPrograms: EducationProgram[] = [
    {
      id: 1,
      title: "인지행동치료 전문가 과정",
      provider: "한국인지행동치료학회",
      duration: "3개월",
      type: "인증과정",
      level: "중급",
      description: "CBT의 이론과 실제를 체계적으로 학습하는 전문가 과정입니다.",
      schedule: "매주 토요일 10:00-17:00",
      fee: "1,200,000원",
      deadline: "2024-12-30",
      location: "서울 강남구",
      maxStudents: 30,
      currentStudents: 25,
      tags: ["CBT", "인증과정", "주말반"],
      createdAt: "2024-11-30"
    },
    {
      id: 2,
      title: "가족치료 워크숍",
      provider: "한국가족치료학회",
      duration: "2일",
      type: "워크숍",
      level: "초급",
      description: "가족 시스템과 구조적 가족치료 기법을 실습 중심으로 학습합니다.",
      schedule: "2024.12.28-29 (토-일)",
      fee: "400,000원",
      deadline: "2024-12-20",
      location: "부산 해운대구",
      maxStudents: 40,
      currentStudents: 32,
      tags: ["가족치료", "워크숍", "실습중심"],
      createdAt: "2024-11-28"
    },
    {
      id: 3,
      title: "트라우마 상담 전문가 과정",
      provider: "한국트라우마스트레스학회",
      duration: "4개월",
      type: "인증과정",
      level: "고급",
      description: "EMDR, TF-CBT 등 트라우마 치료 전문기법을 습득하는 고급과정입니다.",
      schedule: "월 2회 주말",
      fee: "1,500,000원",
      deadline: "2024-12-25",
      location: "대구 중구",
      maxStudents: 15,
      currentStudents: 8,
      tags: ["트라우마", "EMDR", "고급과정"],
      createdAt: "2024-11-25"
    },
    {
      id: 4,
      title: "온라인 집단상담 리더십 과정",
      provider: "한국집단상담학회",
      duration: "8주",
      type: "온라인과정",
      level: "중급",
      description: "집단상담의 이론과 실제, 리더십 기술을 온라인으로 체험적으로 학습합니다.",
      schedule: "매주 수요일 19:00-22:00",
      fee: "600,000원",
      deadline: "2024-12-22",
      location: "온라인",
      maxStudents: 25,
      currentStudents: 22,
      tags: ["집단상담", "온라인", "평일반"],
      createdAt: "2024-11-22"
    },
    {
      id: 5,
      title: "미술치료 기초과정",
      provider: "한국미술치료학회",
      duration: "10주",
      type: "전문과정",
      level: "초급",
      description: "미술을 활용한 치료기법의 기초를 학습하는 과정입니다.",
      schedule: "매주 목요일 18:00-21:00",
      fee: "800,000원",
      deadline: "2024-12-15",
      location: "서울 마포구",
      maxStudents: 20,
      currentStudents: 18,
      tags: ["미술치료", "기초과정", "평일반"],
      createdAt: "2024-11-20"
    }
  ];

  const { data: programs = mockPrograms, isLoading } = useQuery<EducationProgram[]>({
    queryKey: ["/api/education/programs"],
    initialData: mockPrograms
  });

  const createProgramMutation = useMutation({
    mutationFn: async (program: any) => {
      // Mock API call - in real implementation, this would be an actual API call
      return new Promise(resolve => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      setShowCreateDialog(false);
      setNewProgram({
        title: "",
        provider: "",
        duration: "",
        type: "",
        level: "",
        description: "",
        schedule: "",
        fee: "",
        deadline: "",
        location: "",
        maxStudents: "",
        tags: ""
      });
      toast({
        title: "교육과정 등록 완료",
        description: "새로운 교육과정이 등록되었습니다.",
      });
    },
  });

  const filteredPrograms = programs.filter((program) => {
    const matchesSearch = program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || program.type === selectedType;
    const matchesLevel = selectedLevel === "all" || program.level === selectedLevel;
    return matchesSearch && matchesType && matchesLevel;
  });

  const handleSubmitProgram = () => {
    if (!newProgram.title.trim() || !newProgram.provider.trim() || !newProgram.type) {
      toast({
        title: "입력 오류",
        description: "필수 항목을 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    createProgramMutation.mutate(newProgram);
  };

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "마감";
    if (diffDays === 0) return "오늘 마감";
    if (diffDays === 1) return "내일 마감";
    return `${diffDays}일 남음`;
  };

  const getDeadlineColor = (deadline: string) => {
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "text-gray-500";
    if (diffDays <= 3) return "text-red-600 font-semibold";
    if (diffDays <= 7) return "text-orange-600";
    return "text-green-600";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <GraduationCap className="mx-auto h-12 w-12 mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            교육 정보 게시판
          </h1>
          <p className="text-lg text-indigo-100 mb-6">
            심리상담 관련 교육과정, 워크숍, 세미나 정보를 공유하세요
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="교육명, 기관명, 지역으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="교육유형" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 유형</SelectItem>
                  <SelectItem value="전문과정">전문과정</SelectItem>
                  <SelectItem value="워크숍">워크숍</SelectItem>
                  <SelectItem value="온라인">온라인</SelectItem>
                  <SelectItem value="세미나">세미나</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="수준" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 수준</SelectItem>
                  <SelectItem value="초급">초급</SelectItem>
                  <SelectItem value="중급">중급</SelectItem>
                  <SelectItem value="고급">고급</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              교육과정 등록
            </Button>
          </div>
        </div>

        {/* Education Programs Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              교육과정 정보 ({filteredPrograms.length}개)
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              교육과정 정보는 참고용이며, 정확한 신청 및 비용은 각 기관에 직접 문의하세요.
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">교육명</TableHead>
                  <TableHead className="w-[150px]">장소</TableHead>
                  <TableHead className="w-[200px]">일시</TableHead>
                  <TableHead className="w-[120px]">비용</TableHead>
                  <TableHead className="w-[100px]">유형</TableHead>
                  <TableHead className="w-[120px]">마감일</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                        <span className="ml-2">로딩 중...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredPrograms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      검색 조건에 맞는 교육과정이 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPrograms.map((program) => (
                    <TableRow 
                      key={program.id} 
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setSelectedProgram(program)}
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900 mb-1">
                            {program.title}
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            {program.provider}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="secondary" className="text-xs">
                              {program.type}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {program.level}
                            </Badge>
                            {program.tags.slice(0, 2).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-1" />
                          {program.location}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center text-gray-600 mb-1">
                            <Calendar className="h-4 w-4 mr-1" />
                            {program.schedule}
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Clock className="h-4 w-4 mr-1" />
                            {program.duration}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium text-gray-900">
                          {program.fee}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <Badge 
                            variant={program.type === '온라인과정' ? 'secondary' : 'outline'}
                            className="text-xs"
                          >
                            {program.type}
                          </Badge>
                          <div className="mt-1 text-gray-600">
                            {program.level}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`text-sm ${getDeadlineColor(program.deadline)}`}>
                          {formatDeadline(program.deadline)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Create Program Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>새 교육과정 등록</DialogTitle>
            <DialogDescription>
              새로운 교육과정 정보를 등록하여 다른 회원들과 공유하세요.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">교육명 *</Label>
                <Input
                  id="title"
                  value={newProgram.title}
                  onChange={(e) => setNewProgram({...newProgram, title: e.target.value})}
                  placeholder="예: 인지행동치료 전문가 과정"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="provider">주최기관 *</Label>
                <Input
                  id="provider"
                  value={newProgram.provider}
                  onChange={(e) => setNewProgram({...newProgram, provider: e.target.value})}
                  placeholder="예: 한국인지행동치료학회"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">교육유형 *</Label>
                <Select value={newProgram.type} onValueChange={(value) => setNewProgram({...newProgram, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="인증과정">인증과정</SelectItem>
                    <SelectItem value="워크숍">워크숍</SelectItem>
                    <SelectItem value="온라인과정">온라인과정</SelectItem>
                    <SelectItem value="세미나">세미나</SelectItem>
                    <SelectItem value="수련과정">수련과정</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="level">수준</Label>
                <Select value={newProgram.level} onValueChange={(value) => setNewProgram({...newProgram, level: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="초급">초급</SelectItem>
                    <SelectItem value="중급">중급</SelectItem>
                    <SelectItem value="고급">고급</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">기간</Label>
                <Input
                  id="duration"
                  value={newProgram.duration}
                  onChange={(e) => setNewProgram({...newProgram, duration: e.target.value})}
                  placeholder="예: 3개월"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                value={newProgram.description}
                onChange={(e) => setNewProgram({...newProgram, description: e.target.value})}
                placeholder="교육과정에 대한 상세 설명을 입력하세요..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="schedule">일정</Label>
                <Input
                  id="schedule"
                  value={newProgram.schedule}
                  onChange={(e) => setNewProgram({...newProgram, schedule: e.target.value})}
                  placeholder="예: 매주 토요일 10:00-17:00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">장소</Label>
                <Input
                  id="location"
                  value={newProgram.location}
                  onChange={(e) => setNewProgram({...newProgram, location: e.target.value})}
                  placeholder="예: 서울 강남구"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fee">수강료</Label>
                <Input
                  id="fee"
                  value={newProgram.fee}
                  onChange={(e) => setNewProgram({...newProgram, fee: e.target.value})}
                  placeholder="예: 1,200,000원"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">신청마감일</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={newProgram.deadline}
                  onChange={(e) => setNewProgram({...newProgram, deadline: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxStudents">모집인원</Label>
                <Input
                  id="maxStudents"
                  type="number"
                  value={newProgram.maxStudents}
                  onChange={(e) => setNewProgram({...newProgram, maxStudents: e.target.value})}
                  placeholder="예: 30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">태그</Label>
              <Input
                id="tags"
                value={newProgram.tags}
                onChange={(e) => setNewProgram({...newProgram, tags: e.target.value})}
                placeholder="쉼표로 구분하여 입력 (예: CBT, 인증과정, 주말반)"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              취소
            </Button>
            <Button 
              onClick={handleSubmitProgram}
              disabled={createProgramMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {createProgramMutation.isPending ? "등록 중..." : "등록하기"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Program Detail Dialog */}
      <Dialog open={!!selectedProgram} onOpenChange={() => setSelectedProgram(null)}>
        <DialogContent className="max-w-2xl">
          {selectedProgram && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedProgram.title}</DialogTitle>
                <DialogDescription className="text-base">
                  {selectedProgram.provider}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{selectedProgram.type}</Badge>
                  <Badge variant="outline">{selectedProgram.level}</Badge>
                  {selectedProgram.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">{tag}</Badge>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{selectedProgram.schedule}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{selectedProgram.duration}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{selectedProgram.location}</span>
                  </div>
                  <div className="flex items-center">
                    <span>수강료: {selectedProgram.fee}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-gray-400" />
                    <span>모집인원: {selectedProgram.maxStudents}명</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <span className={getDeadlineColor(selectedProgram.deadline)}>
                      {formatDeadline(selectedProgram.deadline)}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">교육과정 설명</h4>
                  <p className="text-gray-600 leading-relaxed">
                    {selectedProgram.description}
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedProgram(null)}>
                  닫기
                </Button>
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  신청하기
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}