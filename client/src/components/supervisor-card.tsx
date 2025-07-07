import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, XCircle, AlertTriangle, Star, MapPin } from "lucide-react";
import type { Supervisor } from "@shared/schema";
import femaleAvatarUrl from "@assets/image_1749710433039.png";
import maleAvatarUrl from "@assets/image_1749710541796.png";

interface SupervisorCardProps {
  supervisor: Supervisor;
}

export default function SupervisorCard({ supervisor }: SupervisorCardProps) {
  const getSpecializationColor = (index: number) => {
    const colors = [
      "bg-blue-50 text-blue-700 border-blue-200",
      "bg-purple-50 text-purple-700 border-purple-200",
      "bg-green-50 text-green-700 border-green-200",
      "bg-orange-50 text-orange-700 border-orange-200",
      "bg-pink-50 text-pink-700 border-pink-200",
      "bg-indigo-50 text-indigo-700 border-indigo-200",
    ];
    return colors[index % colors.length];
  };

  const getDefaultAvatar = () => {
    // Use the uploaded user images for default avatars
    if (supervisor.gender === 'female') {
      return femaleAvatarUrl;
    } else if (supervisor.gender === 'male') {
      return maleAvatarUrl;
    }
    // Neutral fallback
    return femaleAvatarUrl;
  };

  const getAllSpecializations = () => {
    const parseArray = (field: any) => {
      if (Array.isArray(field)) return field;
      if (typeof field === 'string') {
        try {
          return JSON.parse(field || '[]');
        } catch {
          return [];
        }
      }
      return [];
    };
    
    const all = [
      ...parseArray(supervisor.targetGroups),
      ...parseArray(supervisor.concernTypes),
      ...parseArray(supervisor.emotionSymptoms),
    ];
    return all.slice(0, 3); // Show only first 3 for clean mobile layout
  };

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 hover:-translate-y-1">
      {/* Profile Image - Mobile First Portrait Layout */}
      <div className="relative">
        <div className="w-full h-48 rounded-t-xl overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100">
          <img 
            src={supervisor.profileImageUrl || getDefaultAvatar()} 
            alt={`${supervisor.name} 프로필`}
            className="w-full h-full object-cover"
            onLoad={() => {
              console.log("이미지 로드 성공:", supervisor.profileImageUrl?.substring(0, 50));
            }}
            onError={(e) => {
              console.log("이미지 로드 실패, 기본 아바타로 교체");
              const target = e.target as HTMLImageElement;
              target.src = getDefaultAvatar();
            }}
          />
        </div>
        
        {/* Rating Badge */}
        {supervisor.rating > 0 && (
          <div className="absolute top-3 right-3 bg-white rounded-full px-2 py-1 shadow-md flex items-center space-x-1">
            <Star className="h-3 w-3 text-yellow-400 fill-current" />
            <span className="text-xs font-medium text-gray-700">
              {(supervisor.rating / 10).toFixed(1)}
            </span>
          </div>
        )}
      </div>

      <CardContent className="p-6">
        {/* Header Info */}
        <div className="mb-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-1">
            {supervisor.name}
          </h4>
          {supervisor.affiliation && (
            <p className="text-sm text-gray-600 mb-2">{supervisor.affiliation}</p>
          )}
          {supervisor.summary && (
            <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
              {supervisor.summary}
            </p>
          )}
        </div>

        {/* Specializations */}
        {getAllSpecializations().length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {getAllSpecializations().map((specialization, index) => (
              <Badge 
                key={specialization} 
                variant="outline" 
                className={`text-xs ${getSpecializationColor(index)}`}
              >
                {specialization}
              </Badge>
            ))}
          </div>
        )}

        {/* Fee & Program Information - Mobile Optimized */}
        <div className="space-y-2 mb-6">
          {/* Client Experience Fee */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">내담자경험 비용</span>
            <span className="text-sm font-medium text-gray-900">
              {supervisor.clientExperienceFee ? `${supervisor.clientExperienceFee.toLocaleString()}원` : '무료'}
            </span>
          </div>

          {/* National Program */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">전국민마음투자지원사업</span>
            {supervisor.participatesInNationalProgram ? (
              <div className="flex items-center text-green-600">
                <CheckCircle className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">활용가능</span>
              </div>
            ) : (
              <div className="flex items-center text-gray-500">
                <XCircle className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">활용불가</span>
              </div>
            )}
          </div>

          {/* Additional Fee for National Program */}
          {supervisor.participatesInNationalProgram && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">전마투 추가요금</span>
              {!supervisor.nationalProgramAdditionalFee ? (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">없음</span>
                </div>
              ) : (
                <div className="flex items-center text-red-600 bg-red-50 px-2 py-1 rounded">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">있음</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Counseling Methods & Regions */}
        {(() => {
          const parseMethods = (methods: any) => {
            if (Array.isArray(methods)) return methods;
            if (typeof methods === 'string') {
              try { return JSON.parse(methods || '[]'); } catch { return []; }
            }
            return [];
          };
          
          const parsedMethods = parseMethods(supervisor.counselingMethods);
          const parsedRegions = parseMethods(supervisor.counselingRegions);
          
          return (parsedMethods.length > 0 || parsedRegions.length > 0) && (
            <div className="mb-4 space-y-2">
              {parsedMethods.length > 0 && (
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">상담방식:</span>
                  <div className="flex flex-wrap gap-1">
                    {parsedMethods.slice(0, 2).map((method: string) => (
                      <Badge key={method} variant="outline" className="text-xs">
                        {method}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {parsedRegions.length > 0 && (
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span className="mr-2">지역:</span>
                  <span className="text-xs">
                    {parsedRegions.slice(0, 2).join(", ")}
                    {parsedRegions.length > 2 && " 외"}
                  </span>
                </div>
              )}
            </div>
          );
        })()}

        {/* CTA Button */}
        <Link href={`/supervisor/${supervisor.id}`}>
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium">
            상세 프로필 보기
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
