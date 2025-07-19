import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Edit, Trash2, Lock, Calendar, User, Settings, Upload, Mail, Phone, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/header";
import SupervisorForm from "@/components/supervisor-form";
import { CATEGORIES } from "@/lib/constants";
import type { CounselingRecord, Supervisor } from "@shared/schema";
import { insertCounselingRecordSchema } from "@shared/schema";

// Supervisor Components
function SupervisorCardManagement({ supervisor, onSuccess }: { supervisor: Supervisor; onSuccess: () => void }) {
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <BadgeManagement supervisor={supervisor} onSuccess={onSuccess} />
      <ContactInfoManagement supervisor={supervisor} onSuccess={onSuccess} />
      <FeesManagement supervisor={supervisor} onSuccess={onSuccess} />
      <VisibilitySettings supervisor={supervisor} onSuccess={onSuccess} />
    </div>
  );
}

function BadgeManagement({ supervisor, onSuccess }: { supervisor: Supervisor; onSuccess: () => void }) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const badgeSchema = z.object({
    qualifications: z.array(z.string()),
    targetGroups: z.array(z.string()),
    concernTypes: z.array(z.string()),
    counselingMethods: z.array(z.string()),
  });

  const badgeForm = useForm({
    resolver: zodResolver(badgeSchema),
    defaultValues: {
      qualifications: supervisor?.qualifications || [],
      targetGroups: supervisor?.targetGroups || [],
      concernTypes: supervisor?.concernTypes || [],
      counselingMethods: supervisor?.counselingMethods || [],
    },
  });

  const updateBadgeMutation = useMutation({
    mutationFn: async (data: z.infer<typeof badgeSchema>) => {
      return apiRequest(`/api/supervisors/${supervisor.id}`, {
        method: "PUT",
        body: data,
      });
    },
    onSuccess: () => {
      toast({
        title: "뱃지 정보 업데이트 성공",
        description: "뱃지 정보가 성공적으로 업데이트되었습니다.",
      });
      setIsEditing(false);
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "업데이트 실패",
        description: error.message || "뱃지 정보 업데이트에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof badgeSchema>) => {
    updateBadgeMutation.mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Badge className="h-5 w-5" />
            뱃지 관리
          </CardTitle>
          <Button
            variant={isEditing ? "outline" : "default"}
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "취소" : "수정"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!isEditing ? (
          <div className="space-y-4">
            <div>
              <Label className="font-medium">자격증</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {supervisor.qualifications?.length ? (
                  supervisor.qualifications.map((qual, idx) => (
                    <Badge key={idx} variant="secondary">{qual}</Badge>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">설정된 자격증이 없습니다</span>
                )}
              </div>
            </div>
            <div>
              <Label className="font-medium">대상군</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {supervisor.targetGroups?.length ? (
                  supervisor.targetGroups.map((group, idx) => (
                    <Badge key={idx} variant="outline">{group}</Badge>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">설정된 대상군이 없습니다</span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <Form {...badgeForm}>
            <form onSubmit={badgeForm.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>자격증</Label>
                <div className="text-sm text-gray-600">
                  보유하신 자격증을 쉼표로 구분하여 입력해주세요.
                </div>
                <Input
                  placeholder="예: 정신건강임상심리사 1급, 임상심리사 1급"
                  value={badgeForm.watch("qualifications").join(", ")}
                  onChange={(e) => {
                    const qualifications = e.target.value.split(",").map(q => q.trim()).filter(q => q);
                    badgeForm.setValue("qualifications", qualifications);
                  }}
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" disabled={updateBadgeMutation.isPending}>
                  {updateBadgeMutation.isPending ? "저장 중..." : "저장"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  취소
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}

function ContactInfoManagement({ supervisor, onSuccess }: { supervisor: Supervisor; onSuccess: () => void }) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const contactSchema = z.object({
    contactInfo: z.string().email("올바른 이메일을 입력해주세요").optional().or(z.literal("")),
    phoneNumber: z.string().optional(),
    contactMethods: z.array(z.string()),
  });

  const contactForm = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      contactInfo: supervisor?.contactInfo || "",
      phoneNumber: supervisor?.phoneNumber || "",
      contactMethods: supervisor?.contactMethods || [],
    },
  });

  const updateContactMutation = useMutation({
    mutationFn: async (data: z.infer<typeof contactSchema>) => {
      return apiRequest(`/api/supervisors/${supervisor.id}`, {
        method: "PUT",
        body: data,
      });
    },
    onSuccess: () => {
      toast({
        title: "연락처 정보 업데이트 성공",
        description: "연락처 정보가 성공적으로 업데이트되었습니다.",
      });
      setIsEditing(false);
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "업데이트 실패",
        description: error.message || "연락처 정보 업데이트에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof contactSchema>) => {
    updateContactMutation.mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            연락처 정보
          </CardTitle>
          <Button
            variant={isEditing ? "outline" : "default"}
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "취소" : "수정"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!isEditing ? (
          <div className="space-y-3">
            <div>
              <Label className="font-medium">이메일</Label>
              <p className="text-sm text-gray-700">{supervisor.contactInfo || "설정되지 않음"}</p>
            </div>
            <div>
              <Label className="font-medium">전화번호</Label>
              <p className="text-sm text-gray-700">{supervisor.phoneNumber || "설정되지 않음"}</p>
            </div>
            <div>
              <Label className="font-medium">상담 방식</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {supervisor.contactMethods?.length ? (
                  supervisor.contactMethods.map((method, idx) => (
                    <Badge key={idx} variant="outline">{method}</Badge>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">설정된 상담 방식이 없습니다</span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <Form {...contactForm}>
            <form onSubmit={contactForm.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={contactForm.control}
                name="contactInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이메일</FormLabel>
                    <FormControl>
                      <Input placeholder="이메일을 입력해주세요" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={contactForm.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>전화번호</FormLabel>
                    <FormControl>
                      <Input placeholder="전화번호를 입력해주세요" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex gap-2">
                <Button type="submit" disabled={updateContactMutation.isPending}>
                  {updateContactMutation.isPending ? "저장 중..." : "저장"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  취소
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}

function FeesManagement({ supervisor, onSuccess }: { supervisor: Supervisor; onSuccess: () => void }) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const feesSchema = z.object({
    clientExperienceFee: z.number().min(0, "내담자 경험 비용은 0 이상이어야 합니다"),
    canProvideClientExperience: z.boolean(),
    participatesInNationalProgram: z.boolean(),
    nationalProgramAdditionalFee: z.number().min(0, "추가 비용은 0 이상이어야 합니다").optional(),
  });

  const feesForm = useForm({
    resolver: zodResolver(feesSchema),
    defaultValues: {
      clientExperienceFee: supervisor?.clientExperienceFee || 0,
      canProvideClientExperience: supervisor?.canProvideClientExperience || false,
      participatesInNationalProgram: supervisor?.participatesInNationalProgram || false,
      nationalProgramAdditionalFee: supervisor?.nationalProgramAdditionalFee || 0,
    },
  });

  const updateFeesMutation = useMutation({
    mutationFn: async (data: z.infer<typeof feesSchema>) => {
      return apiRequest(`/api/supervisors/${supervisor.id}`, {
        method: "PUT",
        body: data,
      });
    },
    onSuccess: () => {
      toast({
        title: "비용 정보 업데이트 성공",
        description: "비용 정보가 성공적으로 업데이트되었습니다.",
      });
      setIsEditing(false);
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "업데이트 실패",
        description: error.message || "비용 정보 업데이트에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof feesSchema>) => {
    updateFeesMutation.mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            비용 정보
          </CardTitle>
          <Button
            variant={isEditing ? "outline" : "default"}
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "취소" : "수정"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!isEditing ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="font-medium">내담자 경험 비용</Label>
                <div className="text-lg font-semibold text-blue-600">
                  {supervisor.clientExperienceFee?.toLocaleString() || 0}원
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="font-medium">전마투 활용 가능</Label>
                <div className="flex items-center gap-2">
                  <Badge variant={supervisor.canProvideClientExperience ? "default" : "secondary"}>
                    {supervisor.canProvideClientExperience ? "가능" : "불가능"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="font-medium">국가정책수련 참여</Label>
                <div className="flex items-center gap-2">
                  <Badge variant={supervisor.participatesInNationalProgram ? "default" : "secondary"}>
                    {supervisor.participatesInNationalProgram ? "참여함" : "참여 안함"}
                  </Badge>
                </div>
              </div>

              {supervisor.participatesInNationalProgram && (
                <div className="space-y-2">
                  <Label className="font-medium">국가정책수련 추가 비용</Label>
                  <div className="text-lg font-semibold text-green-600">
                    {supervisor.nationalProgramAdditionalFee === 0 ? "무료" : 
                     supervisor.nationalProgramAdditionalFee ? 
                     `${supervisor.nationalProgramAdditionalFee.toLocaleString()}원` : "미설정"}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <Form {...feesForm}>
            <form onSubmit={feesForm.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={feesForm.control}
                name="clientExperienceFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>내담자 경험 비용 (원)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={feesForm.control}
                name="canProvideClientExperience"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">전마투 활용 가능</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        전문가마음치료 프로그램을 활용할 수 있나요?
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={feesForm.control}
                name="participatesInNationalProgram"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">국가정책수련 참여</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        국가정책수련 프로그램에 참여하시겠습니까?
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {feesForm.watch("participatesInNationalProgram") && (
                <FormField
                  control={feesForm.control}
                  name="nationalProgramAdditionalFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>국가정책수련 추가 비용 (원)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0 (무료)"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <p className="text-sm text-muted-foreground">
                        0원으로 설정하면 무료로 표시됩니다.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="flex gap-2">
                <Button type="submit" disabled={updateFeesMutation.isPending}>
                  {updateFeesMutation.isPending ? "저장 중..." : "저장"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  취소
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}

function VisibilitySettings({ supervisor, onSuccess }: { supervisor: Supervisor; onSuccess: () => void }) {
  const { toast } = useToast();

  const toggleVisibilityMutation = useMutation({
    mutationFn: async (data: { isProfilePublic: boolean }) => {
      return apiRequest(`/api/supervisors/${supervisor.id}`, {
        method: "PUT",
        body: data,
      });
    },
    onSuccess: () => {
      toast({
        title: "공개 설정 업데이트 성공",
        description: "공개 설정이 성공적으로 업데이트되었습니다.",
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "업데이트 실패",
        description: error.message || "공개 설정 업데이트에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleToggleVisibility = (value: boolean) => {
    toggleVisibilityMutation.mutate({ isProfilePublic: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          프로필 공개 설정
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-1">
            <Label className="text-base font-medium">프로필 공개</Label>
            <p className="text-sm text-gray-500">
              다른 사용자들이 내 프로필을 볼 수 있도록 합니다.
            </p>
          </div>
          <Switch
            checked={supervisor.isProfilePublic}
            onCheckedChange={handleToggleVisibility}
            disabled={toggleVisibilityMutation.isPending}
          />
        </div>

        <div className="bg-blue-50 p-4 rounded-lg mt-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900">알림</p>
              <p className="text-sm text-blue-700">
                프로필을 비공개로 설정하면 수련생들이 검색할 수 없습니다.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const recordSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요"),
  content: z.string().min(1, "내용을 입력해주세요"),
  supervisorName: z.string().optional(),
  counselingDate: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export default function MyPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [isRecordDialogOpen, setIsRecordDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CounselingRecord | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = '/login';
    return null;
  }

  const { data: records = [], refetch: refetchRecords } = useQuery<CounselingRecord[]>({
    queryKey: ["/api/counseling-records"],
    enabled: !!user,
  });

  const { data: supervisor, refetch: refetchSupervisor } = useQuery<Supervisor>({
    queryKey: ["/api/my-supervisor"],
    enabled: !!user && user?.role === 'supervisor',
  });



  // Create a custom schema for the form that matches the expected frontend input format
  const recordFormSchema = insertCounselingRecordSchema.omit({ 
    id: true, 
    userId: true, 
    createdAt: true, 
    updatedAt: true 
  }).extend({
    counselingDate: z.string().optional(), // Accept string for date input
    tags: z.array(z.string()).optional(),
  });

  const recordForm = useForm({
    resolver: zodResolver(recordFormSchema),
    defaultValues: {
      title: "",
      content: "",
      supervisorName: "",
      counselingDate: "",
      tags: [],
    },
  });

  const createRecordMutation = useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        ...data,
        counselingDate: data.counselingDate ? new Date(data.counselingDate) : null,
        tags: data.tags || [],
      };
      return apiRequest("/api/counseling-records", {
        method: "POST",
        body: JSON.stringify(payload)
      });
    },
    onSuccess: () => {
      toast({ title: "상담 기록이 저장되었습니다" });
      setIsRecordDialogOpen(false);
      recordForm.reset();
      refetchRecords();
    },
    onError: (error) => {
      toast({
        title: "오류",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateRecordMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const payload = {
        ...data,
        counselingDate: data.counselingDate ? new Date(data.counselingDate) : null,
        tags: data.tags || [],
      };
      return apiRequest(`/api/counseling-records/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      });
    },
    onSuccess: () => {
      toast({ title: "상담 기록이 수정되었습니다" });
      setIsRecordDialogOpen(false);
      setEditingRecord(null);
      recordForm.reset();
      refetchRecords();
    },
    onError: (error) => {
      toast({
        title: "오류",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteRecordMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/counseling-records/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      toast({ title: "상담 기록이 삭제되었습니다" });
      refetchRecords();
    },
    onError: (error) => {
      toast({
        title: "오류",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEditRecord = (record: CounselingRecord) => {
    setEditingRecord(record);
    recordForm.reset({
      title: record.title,
      content: record.content,
      supervisorName: record.supervisorName || "",
      counselingDate: record.counselingDate ? new Date(record.counselingDate).toISOString().split('T')[0] : "",
      tags: record.tags || [],
    });
    setIsRecordDialogOpen(true);
  };

  const onSubmitRecord = (data: any) => {
    if (editingRecord) {
      updateRecordMutation.mutate({ id: editingRecord.id, data });
    } else {
      createRecordMutation.mutate(data);
    }
  };

  const handleDeleteRecord = (id: number) => {
    if (window.confirm("정말로 이 기록을 삭제하시겠습니까?")) {
      deleteRecordMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">마이페이지</h1>
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-gray-500" />
            <span className="text-sm text-gray-600">
              {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.email || '사용자'}
            </span>
          </div>
        </div>

        <Tabs defaultValue="records" className="space-y-8">
          <TabsList className={user?.role === 'supervisor' ? "grid w-full grid-cols-3" : "grid w-full grid-cols-2"}>
            <TabsTrigger value="records">내 상담 기록</TabsTrigger>
            <TabsTrigger value="settings">설정</TabsTrigger>
            {user?.role === 'supervisor' && (
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                수퍼바이저 관리
              </TabsTrigger>
            )}
          </TabsList>

          {/* Counseling Records Tab */}
          <TabsContent value="records" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900">내 상담 기록</h2>
              <Dialog open={isRecordDialogOpen} onOpenChange={setIsRecordDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    setEditingRecord(null);
                    recordForm.reset();
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    새 기록 작성
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingRecord ? '상담 기록 수정' : '새 상담 기록 작성'}
                    </DialogTitle>
                  </DialogHeader>
                  <Form {...recordForm}>
                    <form onSubmit={recordForm.handleSubmit(onSubmitRecord)} className="space-y-4">
                      <FormField
                        control={recordForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>제목</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="상담 기록 제목을 입력하세요" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={recordForm.control}
                          name="supervisorName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>슈퍼바이저</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="슈퍼바이저 이름 (선택사항)" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={recordForm.control}
                          name="counselingDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>상담 날짜</FormLabel>
                              <FormControl>
                                <Input {...field} type="date" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={recordForm.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>내용</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                placeholder="상담 내용과 경험을 자유롭게 기록하세요..."
                                className="min-h-[200px]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end space-x-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsRecordDialogOpen(false)}
                        >
                          취소
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={createRecordMutation.isPending || updateRecordMutation.isPending}
                        >
                          {editingRecord ? '수정' : '저장'}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {records.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Lock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">아직 작성된 기록이 없습니다</h3>
                  <p className="text-gray-500 mb-4">
                    상담 경험을 안전하게 기록하고 관리해보세요.
                  </p>
                  <Button onClick={() => setIsRecordDialogOpen(true)}>
                    첫 번째 기록 작성하기
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {records.map((record) => (
                  <Card key={record.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{record.title}</CardTitle>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            {record.supervisorName && (
                              <div className="flex items-center">
                                <User className="h-4 w-4 mr-1" />
                                {record.supervisorName}
                              </div>
                            )}
                            {record.counselingDate && (
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {new Date(record.counselingDate).toLocaleDateString('ko-KR')}
                              </div>
                            )}
                            <div className="flex items-center">
                              <Lock className="h-4 w-4 mr-1" />
                              비공개
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditRecord(record)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteRecord(record.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 whitespace-pre-wrap">{record.content}</p>
                      {record.tags && record.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {record.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="text-xs text-gray-400 mt-4">
                        작성일: {new Date(record.createdAt).toLocaleString('ko-KR')}
                        {record.updatedAt !== record.createdAt && (
                          <span className="ml-2">
                            • 수정일: {new Date(record.updatedAt).toLocaleString('ko-KR')}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Supervisor Profile Management Tab */}
          {user?.role === 'supervisor' && (
            <TabsContent value="profile" className="space-y-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">카드 관리</h2>
                    <p className="text-gray-600 mt-1">
                      뱃지, 연락처, 비용 정보, 공개 설정을 관리할 수 있습니다.
                    </p>
                  </div>
                </div>
                
                <SupervisorForm supervisor={supervisor} onSuccess={refetchSupervisor} />
              </div>
            </TabsContent>
          )}

          {/* Basic Info Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">기본 정보</h2>
                  <p className="text-gray-600 mt-1">
                    계정 정보와 개인 설정을 관리할 수 있습니다.
                  </p>
                </div>
              </div>
              <UserProfileSettings user={user} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// User Profile Settings Component
function UserProfileSettings({ user }: { user: any }) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const profileForm = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      gender: user?.gender || '',
      birthYear: user?.birthYear?.toString() || '',
      education: user?.education || '',
      university: user?.university || '',
      currentStatus: user?.currentStatus || '',
      targetCertification: user?.targetCertification || '',
      counselingExperience: user?.counselingExperience || '',
      interests: user?.interests || '',
      license: user?.license || '',
      licenseNumber: user?.licenseNumber || '',
      association: user?.association || '',
      experience: user?.experience?.toString() || '',
      specialization: user?.specialization || '',
      therapeuticApproach: user?.therapeuticApproach || '',
      location: user?.location || '',
      introduction: user?.introduction || '',
      profileImageUrl: user?.profileImageUrl || '',
      isProfilePublic: user?.isProfilePublic ?? true,
    },
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "파일 크기 초과",
          description: "5MB 이하의 이미지만 업로드 가능합니다.",
          variant: "destructive",
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        profileForm.setValue('profileImageUrl', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest(`/api/auth/user/${user?.id}`, {
        method: "PUT",
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({ title: "회원정보가 성공적으로 수정되었습니다" });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error) => {
      toast({
        title: "오류",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmitProfile = (data: any) => {
    const formattedData = {
      ...data,
      birthYear: data.birthYear ? parseInt(data.birthYear) : null,
      experience: data.experience ? parseInt(data.experience) : null,
    };
    updateProfileMutation.mutate(formattedData);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            회원정보 수정
          </CardTitle>
          <Button
            variant={isEditing ? "outline" : "default"}
            onClick={() => {
              if (isEditing) {
                profileForm.reset();
              }
              setIsEditing(!isEditing);
            }}
          >
            {isEditing ? "취소" : "수정"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...profileForm}>
          <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-6">
            {/* 기본 정보 */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">기본 정보</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={profileForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>이름</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditing} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>성</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditing} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>전화번호</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditing} placeholder="010-0000-0000" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>성별</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!isEditing}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="성별 선택" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">남성</SelectItem>
                          <SelectItem value="female">여성</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="birthYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>출생년도</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditing} placeholder="1990" type="number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* 학력 및 자격 */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">학력 및 자격</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={profileForm.control}
                  name="university"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>대학교</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditing} placeholder="서울대학교" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="education"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>학력</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditing} placeholder="심리학 학사" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="license"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>자격증</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditing} placeholder="정신건강임상심리사 1급" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="licenseNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>자격증 번호</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditing} placeholder="자격증 번호" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* 경력 및 전문분야 */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">경력 및 전문분야</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={profileForm.control}
                  name="currentStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>현재 상태</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditing} placeholder="수련생" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>경력 (년)</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditing} placeholder="3" type="number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="association"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>소속 협회</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditing} placeholder="한국상담심리학회" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="targetCertification"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>목표 자격증</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditing} placeholder="상담심리사 1급" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* 전문분야 및 관심사 */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">전문분야 및 관심사</h3>
              <div className="space-y-4">
                <FormField
                  control={profileForm.control}
                  name="specialization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>전문분야</FormLabel>
                      <FormControl>
                        <Textarea {...field} disabled={!isEditing} placeholder="트라우마, PTSD, 불안장애 등" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="therapeuticApproach"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>치료 접근법</FormLabel>
                      <FormControl>
                        <Textarea {...field} disabled={!isEditing} placeholder="인지행동치료, EMDR, 정신분석 등" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="interests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>관심 분야</FormLabel>
                      <FormControl>
                        <Textarea {...field} disabled={!isEditing} placeholder="아동상담, 가족치료, 집단상담 등" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="counselingExperience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>상담 경험</FormLabel>
                      <FormControl>
                        <Textarea {...field} disabled={!isEditing} placeholder="상담 경험 및 케이스" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* 추가 정보 */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">추가 정보</h3>
              <div className="space-y-4">
                <FormField
                  control={profileForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>지역</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditing} placeholder="서울특별시" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="introduction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>자기소개</FormLabel>
                      <FormControl>
                        <Textarea {...field} disabled={!isEditing} placeholder="간단한 자기소개를 작성해주세요" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* 수퍼바이저 전용 설정 */}
            {user?.role === 'supervisor' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">수퍼바이저 설정</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label className="text-base">홈페이지 노출</Label>
                      <p className="text-sm text-gray-600">
                        홈페이지에서 추천 수퍼바이저로 표시됩니다
                      </p>
                    </div>
                    <Switch
                      checked={profileForm.watch('isProfilePublic') ?? true}
                      onCheckedChange={(checked) => profileForm.setValue('isProfilePublic', checked)}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  {/* 프로필 이미지 업로드 */}
                  <div className="space-y-4">
                    <Label className="text-sm font-medium">프로필 이미지</Label>
                    <div className="flex items-center space-x-6">
                      <Avatar className="w-24 h-24">
                        <AvatarImage 
                          src={profileForm.watch('profileImageUrl') || user?.profileImageUrl || undefined} 
                          alt="프로필 미리보기" 
                        />
                        <AvatarFallback className="text-lg bg-gradient-to-br from-blue-100 to-purple-100 text-gray-700">
                          {user?.firstName?.charAt(0) || '프'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            ref={fileInputRef}
                            disabled={!isEditing}
                          />
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={!isEditing}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {isEditing ? "사진 업로드" : "사진 변경"}
                          </Button>
                          {(profileForm.watch('profileImageUrl') || user?.profileImageUrl) && isEditing && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                profileForm.setValue('profileImageUrl', '');
                              }}
                            >
                              삭제
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {isEditing ? "JPG, PNG 파일 (최대 5MB)" : "수정 모드에서 이미지를 변경할 수 있습니다"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 계정 정보 */}
            <div className="pt-6 border-t">
              <h3 className="text-lg font-medium text-gray-900 mb-4">계정 정보</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                  <Input value={user?.email || ''} disabled />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">역할</label>
                  <Input value={user?.role === 'supervisor' ? '수퍼바이저' : user?.role === 'trainee' ? '수련생' : '관리자'} disabled />
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end space-x-2">
                <Button type="submit" disabled={updateProfileMutation.isPending}>
                  {updateProfileMutation.isPending ? "저장 중..." : "저장"}
                </Button>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}