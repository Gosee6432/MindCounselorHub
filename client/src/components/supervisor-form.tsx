import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Upload, Eye, EyeOff, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CATEGORIES } from "@/lib/constants";
import type { Supervisor } from "@shared/schema";

const supervisorSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요"),
  gender: z.enum(["male", "female"]).optional(),
  affiliation: z.string().optional(),
  association: z.string().optional(),
  specialization: z.string().optional(),
  summary: z.string().optional(),
  profileImageUrl: z.string().optional(),
  qualifications: z.array(z.string()).optional(),
  targetGroups: z.array(z.string()).optional(),
  concernTypes: z.array(z.string()).optional(),
  emotionSymptoms: z.array(z.string()).optional(),
  specialExperiences: z.array(z.string()).optional(),
  counselingRegions: z.array(z.string()).optional(),
  counselingMethods: z.array(z.string()).optional(),
  contactMethods: z.array(z.string()).optional(),
  contactInfo: z.string().optional(),
  // 연락처 정보
  phoneNumber: z.string().optional(),
  email: z.string().optional().refine((val) => !val || z.string().email().safeParse(val).success, {
    message: "올바른 이메일 형식을 입력해주세요"
  }),
  kakaoId: z.string().optional(),
  website: z.string().optional(),
  // 비용 설정
  clientExperienceFee: z.number().min(0, "내담자 경험 비용은 0 이상이어야 합니다").default(0),
  canProvideClientExperience: z.boolean().default(false),
  clientExperienceAdditionalFee: z.number().min(0, "전마투 추가요금은 0 이상이어야 합니다").default(0),
  participatesInNationalProgram: z.boolean().default(false),
  nationalProgramAdditionalFee: z.number().min(0, "추가요금은 0원 이상이어야 합니다").default(0),
  // 프로필 설정
  isProfilePublic: z.boolean().default(true),
});

interface SupervisorFormProps {
  supervisor?: Supervisor;
  onSuccess?: () => void;
}

export default function SupervisorForm({ supervisor, onSuccess }: SupervisorFormProps) {
  const { toast } = useToast();
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm({
    resolver: zodResolver(supervisorSchema),
    mode: "onChange",
    defaultValues: {
      name: supervisor?.name || "",
      gender: supervisor?.gender || undefined,
      affiliation: supervisor?.affiliation || "",
      association: supervisor?.association || "",
      specialization: supervisor?.specialization || "",
      summary: supervisor?.summary || "",
      profileImageUrl: supervisor?.profileImageUrl || "",
      qualifications: supervisor?.qualifications || [],
      targetGroups: supervisor?.targetGroups || [],
      concernTypes: supervisor?.concernTypes || [],
      emotionSymptoms: supervisor?.emotionSymptoms || [],
      specialExperiences: supervisor?.specialExperiences || [],
      counselingRegions: supervisor?.counselingRegions || [],
      counselingMethods: supervisor?.counselingMethods || [],
      contactMethods: supervisor?.contactMethods || [],
      contactInfo: supervisor?.contactInfo || supervisor?.email || "",
      phoneNumber: supervisor?.phoneNumber || "",
      email: supervisor?.email || "",
      kakaoId: supervisor?.kakaoId || "",
      website: supervisor?.website || "",
      clientExperienceFee: supervisor?.clientExperienceFee || 0,
      canProvideClientExperience: supervisor?.canProvideClientExperience || false,
      clientExperienceAdditionalFee: supervisor?.clientExperienceAdditionalFee || 0,
      participatesInNationalProgram: supervisor?.participatesInNationalProgram || false,
      nationalProgramAdditionalFee: supervisor?.nationalProgramAdditionalFee || 0,
      isProfilePublic: supervisor?.isProfilePublic !== false,
    },
  });

  // 수퍼바이저 데이터 로드 시 폼 값 업데이트
  useEffect(() => {
    if (supervisor) {
      console.log("Loading supervisor data into form:", supervisor);
      form.reset({
        name: supervisor.name || "",
        gender: supervisor.gender || undefined,
        affiliation: supervisor.affiliation || "",
        association: supervisor.association || "",
        specialization: supervisor.specialization || "",
        summary: supervisor.summary || "",
        profileImageUrl: supervisor.profileImageUrl || "",
        qualifications: supervisor.qualifications || [],
        targetGroups: supervisor.targetGroups || [],
        concernTypes: supervisor.concernTypes || [],
        emotionSymptoms: supervisor.emotionSymptoms || [],
        specialExperiences: supervisor.specialExperiences || [],
        counselingRegions: supervisor.counselingRegions || [],
        counselingMethods: supervisor.counselingMethods || [],
        contactMethods: supervisor.contactMethods || [],
        contactInfo: supervisor.contactInfo || supervisor.email || "",
        phoneNumber: supervisor.phoneNumber || "",
        email: supervisor.email || "",
        kakaoId: supervisor.kakaoId || "",
        website: supervisor.website || "",
        canProvideClientExperience: supervisor.canProvideClientExperience || false,
        participatesInNationalProgram: supervisor.participatesInNationalProgram || false,
        nationalProgramAdditionalFee: supervisor.nationalProgramAdditionalFee || 0,
        isProfilePublic: supervisor.isProfilePublic !== false,
        isVisible: supervisor.isVisible !== false,
        allowReviews: supervisor.allowReviews !== false,
      });
      
      // 프로필 이미지 미리보기 설정
      if (supervisor.profileImageUrl) {
        setProfileImagePreview(supervisor.profileImageUrl);
      }
    }
  }, [supervisor, form]);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log("Creating supervisor with data:", data);
      return apiRequest("/api/supervisors", {
        method: "POST",
        body: JSON.stringify(data)
      });
    },
    onSuccess: (result) => {
      console.log("Supervisor created successfully:", result);
      toast({ 
        title: "프로필 생성 완료", 
        description: "수퍼바이저 프로필이 성공적으로 생성되었습니다.",
        variant: "default"
      });
      onSuccess?.();
    },
    onError: (error) => {
      console.error("Supervisor creation error:", error);
      toast({
        title: "프로필 생성 실패",
        description: error.message || "프로필 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log("Updating supervisor with data:", data);
      console.log("Supervisor ID:", supervisor?.id);
      return apiRequest(`/api/supervisors/${supervisor!.id}`, {
        method: "PUT",
        body: JSON.stringify(data)
      });
    },
    onSuccess: (result) => {
      console.log("Supervisor updated successfully:", result);
      
      // 강력한 캐시 무효화
      queryClient.removeQueries({ queryKey: ['/api/supervisors'] });
      queryClient.removeQueries({ queryKey: [`/api/supervisors/${supervisor!.id}`] });
      queryClient.removeQueries({ queryKey: ['/api/my-supervisor'] });
      
      queryClient.invalidateQueries({ queryKey: ['/api/supervisors'] });
      queryClient.invalidateQueries({ queryKey: [`/api/supervisors/${supervisor!.id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/my-supervisor'] });
      
      // 상태 리셋
      setProfileImagePreview(null);
      setProfileImageFile(null);
      
      toast({ 
        title: "프로필 수정 완료", 
        description: "이미지가 성공적으로 업데이트되었습니다. 잠시 후 새로고침됩니다.",
        variant: "default"
      });
      
      // 확실한 반영을 위한 새로고침
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
      onSuccess?.();
    },
    onError: (error) => {
      console.error("Supervisor update error:", error);
      toast({
        title: "프로필 수정 실패",
        description: error.message || "프로필 수정 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        // 정사각형 고정 크기 (더 큰 크기로 설정)
        const targetSize = 500;
        
        canvas.width = targetSize;
        canvas.height = targetSize;
        
        // 원본 이미지에서 정사각형 부분 크롭 (중앙 기준)
        const { width, height } = img;
        const size = Math.min(width, height);
        const startX = (width - size) / 2;
        const startY = (height - size) / 2;
        
        // 배경을 흰색으로 채우기
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, targetSize, targetSize);
        
        // 이미지 그리기 (정사각형으로 크롭)
        ctx.drawImage(img, startX, startY, size, size, 0, 0, targetSize, targetSize);
        
        // JPEG로 압축 (품질 0.95로 높음)
        const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.95);
        console.log('이미지 처리 완료. 크기:', resizedDataUrl.length, 'bytes');
        resolve(resizedDataUrl);
      };
      
      img.onerror = () => {
        console.error('이미지 로드 실패');
        resolve('');
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 파일 크기 체크 (5MB 제한)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "파일 크기 초과",
          description: "5MB 이하의 이미지를 선택해주세요.",
          variant: "destructive",
        });
        return;
      }

      // 파일 타입 체크
      if (!file.type.startsWith('image/')) {
        toast({
          title: "잘못된 파일 형식",
          description: "이미지 파일만 업로드 가능합니다.",
          variant: "destructive",
        });
        return;
      }

      // 이미지 리사이즈 처리
      const img = new Image();
      const reader = new FileReader();
      
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        // 카드 표시 영역에 맞춰 리사이즈 (w-full h-48 = 약 400x192)
        const maxWidth = 400;
        const maxHeight = 192;
        let { width, height } = img;
        
        // 비율 유지하면서 최대 크기 제한
        const scale = Math.min(maxWidth / width, maxHeight / height, 1);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
        
        canvas.width = width;
        canvas.height = height;
        
        // 고품질로 그리기
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        
        // 높은 품질로 압축 (0.9)
        const processedImage = canvas.toDataURL('image/jpeg', 0.9);
        
        console.log("원본:", file.size, "bytes →", "처리된 이미지:", processedImage.length, "characters");
        
        setProfileImageFile(file);
        setProfileImagePreview(processedImage);
        form.setValue('profileImageUrl', processedImage);
        
        toast({
          title: "이미지 업로드 성공",
          description: `${file.name} 최적화 완료`,
        });
      };
      
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: any) => {
    console.log("=== FORM SUBMISSION START ===");
    console.log("Form submitted with data:", data);
    console.log("Current supervisor:", supervisor);
    console.log("Profile image preview:", profileImagePreview);
    
    try {
      // 프로필 이미지가 업로드된 경우, base64 데이터를 사용
      if (profileImagePreview) {
        data.profileImageUrl = profileImagePreview;
        console.log("Added profile image to data");
      } else if (form.watch('profileImageUrl')) {
        // 기존 이미지가 있는 경우 유지
        data.profileImageUrl = form.watch('profileImageUrl');
        console.log("Keeping existing profile image");
      }

      // Remove empty strings and undefined values
      const cleanedData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => 
          value !== undefined && value !== "" && 
          !(Array.isArray(value) && value.length === 0)
        )
      );

      // Transform array fields to ensure they're properly formatted
      const transformedData = {
        ...cleanedData,
        qualifications: data.qualifications || [],
        targetGroups: data.targetGroups || [],
        concernTypes: data.concernTypes || [],
        emotionSymptoms: data.emotionSymptoms || [],
        specialExperiences: data.specialExperiences || [],
        counselingMethods: data.counselingMethods || [],
        counselingRegions: data.counselingRegions || [],
        // Boolean 값들을 명시적으로 설정
        canProvideClientExperience: Boolean(data.canProvideClientExperience),
        participatesInNationalProgram: Boolean(data.participatesInNationalProgram),
        nationalProgramAdditionalFee: Number(data.nationalProgramAdditionalFee) || 0,
        isProfilePublic: Boolean(data.isProfilePublic),
        isVisible: Boolean(data.isVisible),
        allowReviews: Boolean(data.allowReviews),
      };

      console.log("Transformed data:", transformedData);

      if (supervisor) {
        console.log("Updating existing supervisor with ID:", supervisor.id);
        updateMutation.mutate(transformedData);
      } else {
        console.log("Creating new supervisor");
        createMutation.mutate(transformedData);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "오류",
        description: "프로필 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleArrayFieldChange = (fieldName: keyof typeof form.getValues, value: string, checked: boolean) => {
    const currentValues = form.getValues(fieldName) as string[] || [];
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter(item => item !== value);
    form.setValue(fieldName, newValues);
  };

  const CheckboxGroup = ({ 
    title, 
    options, 
    fieldName 
  }: { 
    title: string; 
    options: string[]; 
    fieldName: keyof typeof form.getValues;
  }) => {
    const currentValues = form.watch(fieldName) as string[] || [];
    
    return (
      <div className="space-y-3">
        <Label className="text-sm font-medium">{title}</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto border rounded-lg p-4">
          {options.map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <Checkbox
                id={`${fieldName}-${option}`}
                checked={currentValues.includes(option)}
                onCheckedChange={(checked) => 
                  handleArrayFieldChange(fieldName, option, !!checked)
                }
              />
              <Label 
                htmlFor={`${fieldName}-${option}`}
                className="text-sm cursor-pointer"
              >
                {option}
              </Label>
            </div>
          ))}
        </div>
        {currentValues.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {currentValues.map((value) => (
              <Badge key={value} variant="secondary" className="text-xs">
                {value}
              </Badge>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (isPreviewMode) {
    const formData = form.getValues();
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">프로필 미리보기</h3>
          <Button variant="outline" onClick={() => setIsPreviewMode(false)}>
            <EyeOff className="h-4 w-4 mr-2" />
            편집으로 돌아가기
          </Button>
        </div>

        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
              <div className="w-40 h-28 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                {formData.profileImageUrl ? (
                  <img 
                    src={formData.profileImageUrl} 
                    alt={formData.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{formData.name}</h1>
                {formData.affiliation && (
                  <p className="text-lg text-gray-600 mb-4">{formData.affiliation}</p>
                )}
                {formData.summary && (
                  <p className="text-gray-700 mb-6">{formData.summary}</p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">내담자 경험:</span>
                    <span className={`font-medium ${formData.canProvideClientExperience ? 'text-green-600' : 'text-gray-500'}`}>
                      {formData.canProvideClientExperience ? '가능' : '불가능'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">마음투자지원사업:</span>
                    <span className={`font-medium ${formData.participatesInNationalProgram ? 'text-green-600' : 'text-gray-500'}`}>
                      {formData.participatesInNationalProgram ? '참여가능' : '참여불가'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">추가요금:</span>
                    <span className={`font-medium ${formData.nationalProgramAdditionalFee === 0 ? 'text-green-600' : 'text-yellow-600'}`}>
                      {formData.nationalProgramAdditionalFee === 0 ? '없음' : `${formData.nationalProgramAdditionalFee.toLocaleString()}원`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setIsPreviewMode(false)}>
            수정하기
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={createMutation.isPending || updateMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {supervisor ? '프로필 수정' : '프로필 생성'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {supervisor ? '프로필 수정' : '프로필 생성'}
        </h3>
        <Button variant="outline" onClick={() => setIsPreviewMode(true)}>
          <Eye className="h-4 w-4 mr-2" />
          미리보기
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">기본정보</TabsTrigger>
              <TabsTrigger value="badges">카드관리</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>기본 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 프로필 사진 업로드 */}
                  <div className="space-y-4">
                    <Label className="text-sm font-medium">프로필 사진</Label>
                    <div className="flex items-center space-x-6">
                      <Avatar className="w-24 h-24">
                        <AvatarImage 
                          src={profileImagePreview || form.watch('profileImageUrl') || supervisor?.profileImageUrl || undefined} 
                          alt="프로필 미리보기" 
                        />
                        <AvatarFallback className="text-lg">
                          {form.watch('name')?.charAt(0) || '프'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            id="profile-image-upload"
                          />
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => document.getElementById('profile-image-upload')?.click()}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            사진 업로드
                          </Button>
                          {(profileImagePreview || form.watch('profileImageUrl')) && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setProfileImagePreview(null);
                                setProfileImageFile(null);
                                form.setValue('profileImageUrl', '');
                              }}
                            >
                              삭제
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          JPG, PNG 파일 (최대 5MB)<br />
                          가로형 비율 권장 (4:3 또는 16:9)
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>이름 *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="이름을 입력하세요" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>성별</FormLabel>
                        <FormControl>
                          <select {...field} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">선택하세요</option>
                            <option value="male">남성</option>
                            <option value="female">여성</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="association"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>소속협회</FormLabel>
                        <FormControl>
                          <select {...field} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">선택하세요</option>
                            <option value="한국상담심리학회">한국상담심리학회</option>
                            <option value="한국임상심리학회">한국임상심리학회</option>
                            <option value="한국상담학회">한국상담학회</option>
                            <option value="한국심리학회">한국심리학회</option>
                            <option value="기타">기타</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="specialization"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>주요 전문분야</FormLabel>
                        <FormControl>
                          <select {...field} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">선택하세요</option>
                            <option value="아동/청소년">아동/청소년 상담</option>
                            <option value="성인 개인상담">성인 개인상담</option>
                            <option value="부부/가족상담">부부/가족상담</option>
                            <option value="집단상담">집단상담</option>
                            <option value="트라우마">트라우마 상담</option>
                            <option value="중독">중독 상담</option>
                            <option value="진로상담">진로상담</option>
                            <option value="기타">기타</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="affiliation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>소속기관</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="소속 기관을 입력하세요" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />



                  <FormField
                    control={form.control}
                    name="summary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>주요 이력 및 소개</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="주요 이력과 전문 분야를 간략히 소개해주세요"
                            className="min-h-[100px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specialization" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>전문 분야</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <CheckboxGroup
                    title="학회 및 자격"
                    options={CATEGORIES.qualifications}
                    fieldName="qualifications"
                  />

                  <Separator />

                  <CheckboxGroup
                    title="대상별"
                    options={CATEGORIES.targetGroups}
                    fieldName="targetGroups"
                  />

                  <Separator />

                  <CheckboxGroup
                    title="고민상황별"
                    options={CATEGORIES.concernTypes}
                    fieldName="concernTypes"
                  />

                  <Separator />

                  <CheckboxGroup
                    title="감정과 증상별"
                    options={CATEGORIES.emotionSymptoms}
                    fieldName="emotionSymptoms"
                  />

                  <Separator />

                  <CheckboxGroup
                    title="특수 경험별"
                    options={CATEGORIES.specialExperiences}
                    fieldName="specialExperiences"
                  />

                  <Separator />

                  <CheckboxGroup
                    title="상담 방식"
                    options={CATEGORIES.counselingMethods}
                    fieldName="counselingMethods"
                  />

                  <Separator />

                  <CheckboxGroup
                    title="상담 가능 지역"
                    options={CATEGORIES.counselingRegions}
                    fieldName="counselingRegions"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Badge Management Tab */}
            <TabsContent value="badges" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>수퍼바이저 카드 뱃지 관리</CardTitle>
                  <p className="text-sm text-gray-600">
                    홈페이지의 수퍼바이저 카드에 표시될 주요 뱃지들을 관리하세요. 핵심적인 항목들만 선택하는 것을 권장합니다.
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 자격증 뱃지 */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">주요 자격증 (카드 표시용)</Label>
                      <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                        {CATEGORIES.qualifications.map((qual) => (
                          <div key={qual} className="flex items-center space-x-2 mb-2">
                            <Checkbox
                              id={`badge-qual-${qual}`}
                              checked={(form.watch("qualifications") || []).includes(qual)}
                              onCheckedChange={(checked) => 
                                handleArrayFieldChange("qualifications", qual, !!checked)
                              }
                            />
                            <Label htmlFor={`badge-qual-${qual}`} className="text-sm cursor-pointer">
                              {qual}
                            </Label>
                          </div>
                        ))}
                      </div>
                      {(form.watch("qualifications") || []).length > 0 && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-600 mb-2">미리보기:</p>
                          <div className="flex flex-wrap gap-1">
                            {(form.watch("qualifications") || []).slice(0, 3).map((qual) => (
                              <Badge key={qual} variant="secondary" className="text-xs">
                                {qual}
                              </Badge>
                            ))}
                            {(form.watch("qualifications") || []).length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{(form.watch("qualifications") || []).length - 3}개
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 대상군 뱃지 */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">주요 대상군 (카드 표시용)</Label>
                      <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                        {CATEGORIES.targetGroups.map((group) => (
                          <div key={group} className="flex items-center space-x-2 mb-2">
                            <Checkbox
                              id={`badge-target-${group}`}
                              checked={(form.watch("targetGroups") || []).includes(group)}
                              onCheckedChange={(checked) => 
                                handleArrayFieldChange("targetGroups", group, !!checked)
                              }
                            />
                            <Label htmlFor={`badge-target-${group}`} className="text-sm cursor-pointer">
                              {group}
                            </Label>
                          </div>
                        ))}
                      </div>
                      {(form.watch("targetGroups") || []).length > 0 && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-600 mb-2">미리보기:</p>
                          <div className="flex flex-wrap gap-1">
                            {(form.watch("targetGroups") || []).slice(0, 3).map((group) => (
                              <Badge key={group} variant="outline" className="text-xs">
                                {group}
                              </Badge>
                            ))}
                            {(form.watch("targetGroups") || []).length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{(form.watch("targetGroups") || []).length - 3}개
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 상담 영역 뱃지 */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">주요 상담 영역 (카드 표시용)</Label>
                      <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                        {CATEGORIES.concernTypes.map((type) => (
                          <div key={type} className="flex items-center space-x-2 mb-2">
                            <Checkbox
                              id={`badge-concern-${type}`}
                              checked={(form.watch("concernTypes") || []).includes(type)}
                              onCheckedChange={(checked) => 
                                handleArrayFieldChange("concernTypes", type, !!checked)
                              }
                            />
                            <Label htmlFor={`badge-concern-${type}`} className="text-sm cursor-pointer">
                              {type}
                            </Label>
                          </div>
                        ))}
                      </div>
                      {(form.watch("concernTypes") || []).length > 0 && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-600 mb-2">미리보기:</p>
                          <div className="flex flex-wrap gap-1">
                            {(form.watch("concernTypes") || []).slice(0, 3).map((type) => (
                              <Badge key={type} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                {type}
                              </Badge>
                            ))}
                            {(form.watch("concernTypes") || []).length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{(form.watch("concernTypes") || []).length - 3}개
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 상담 기법 뱃지 */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">주요 상담 기법 (카드 표시용)</Label>
                      <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                        {CATEGORIES.counselingMethods.map((method) => (
                          <div key={method} className="flex items-center space-x-2 mb-2">
                            <Checkbox
                              id={`badge-method-${method}`}
                              checked={(form.watch("counselingMethods") || []).includes(method)}
                              onCheckedChange={(checked) => 
                                handleArrayFieldChange("counselingMethods", method, !!checked)
                              }
                            />
                            <Label htmlFor={`badge-method-${method}`} className="text-sm cursor-pointer">
                              {method}
                            </Label>
                          </div>
                        ))}
                      </div>
                      {(form.watch("counselingMethods") || []).length > 0 && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-600 mb-2">미리보기:</p>
                          <div className="flex flex-wrap gap-1">
                            {(form.watch("counselingMethods") || []).slice(0, 3).map((method) => (
                              <Badge key={method} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                {method}
                              </Badge>
                            ))}
                            {(form.watch("counselingMethods") || []).length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{(form.watch("counselingMethods") || []).length - 3}개
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 전체 카드 미리보기 */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">카드 전체 미리보기</h4>
                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm max-w-md">
                      <div className="flex items-start space-x-4">
                        <div className="w-20 h-14 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                          {(profileImagePreview || supervisor?.profileImageUrl) ? (
                            <img 
                              src={profileImagePreview || supervisor?.profileImageUrl || undefined} 
                              alt="프로필 이미지" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {form.watch("name") || "수퍼바이저 이름"}
                          </h3>
                          <p className="text-sm text-gray-600 truncate">
                            {form.watch("affiliation") || "소속 기관"}
                          </p>
                          <div className="mt-2 space-y-1">
                            {(form.watch("qualifications") || []).slice(0, 2).length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {(form.watch("qualifications") || []).slice(0, 2).map((qual) => (
                                  <Badge key={qual} variant="secondary" className="text-xs">
                                    {qual}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            <div className="flex flex-wrap gap-1">
                              {(form.watch("targetGroups") || []).slice(0, 2).map((group) => (
                                <Badge key={group} variant="outline" className="text-xs">
                                  {group}
                                </Badge>
                              ))}
                              {(form.watch("concernTypes") || []).slice(0, 1).map((type) => (
                                <Badge key={type} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                  {type}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Separator />

                  {/* 연락처 정보 */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">연락처 정보</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="contactInfo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>이메일 주소</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" placeholder="example@email.com" />
                            </FormControl>
                            <FormDescription>주요 연락용 이메일 주소</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>전화번호 (선택)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="010-1234-5678" />
                            </FormControl>
                            <FormDescription>긴급 연락용 전화번호</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>홈페이지/블로그 (선택)</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="example.com 또는 blog.naver.com"
                                onChange={(e) => {
                                  let value = e.target.value.trim();
                                  // 도메인 형태면 자동으로 https:// 추가
                                  if (value && !value.startsWith('http://') && !value.startsWith('https://')) {
                                    if (value.includes('.') && !value.includes(' ')) {
                                      value = 'https://' + value;
                                    }
                                  }
                                  field.onChange(value);
                                }}
                              />
                            </FormControl>
                            <FormDescription>도메인만 입력하면 자동으로 https:// 가 추가됩니다</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="kakaoId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>카카오톡 ID (선택)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="kakao_id" />
                            </FormControl>
                            <FormDescription>카카오톡 상담용 아이디</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* 비용 설정 */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">비용 설정</h4>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="clientExperienceFee"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>내담자 경험 비용 (원)</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                min="0"
                                placeholder="0"
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormDescription>
                              수련생이 내담자 경험을 위해 지불하는 비용
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="canProvideClientExperience"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">전마투 활용 가능</FormLabel>
                              <FormDescription>
                                전문가마음치료 프로그램을 활용할 수 있습니다.
                              </FormDescription>
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

                      {form.watch("canProvideClientExperience") && (
                        <FormField
                          control={form.control}
                          name="clientExperienceAdditionalFee"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>전마투 활용시 추가 비용 (원)</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  min="0"
                                  placeholder="0 (무료)"
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormDescription>
                                0원으로 설정하면 무료로 표시됩니다.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* 프로필 공개 설정 */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">프로필 공개 설정</h4>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="isProfilePublic"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">프로필 공개</FormLabel>
                              <FormDescription>
                                다른 사용자들이 내 프로필을 볼 수 있도록 합니다.
                              </FormDescription>
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
                        control={form.control}
                        name="participatesInNationalProgram"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">국가정책수련 참여</FormLabel>
                              <FormDescription>
                                국가정책수련 프로그램에 참여합니다.
                              </FormDescription>
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

                      {form.watch("participatesInNationalProgram") && (
                        <FormField
                          control={form.control}
                          name="nationalProgramAdditionalFee"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>국가정책수련 추가 비용 (원)</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  min="0"
                                  placeholder="0 (무료)"
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormDescription>
                                0원으로 설정하면 무료로 표시됩니다.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => setIsPreviewMode(true)}>
              <Eye className="h-4 w-4 mr-2" />
              미리보기
            </Button>
            <Button 
              type="button"
              onClick={form.handleSubmit(onSubmit)}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="min-w-[140px]"
            >
              <Save className="h-4 w-4 mr-2" />
              {createMutation.isPending || updateMutation.isPending 
                ? "저장 중..." 
                : supervisor ? '프로필 수정' : '프로필 생성'
              }
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
