/**
 * Job Add Modal Component
 * 
 * Modal for adding new job postings in admin panel.
 */

import { useState, useEffect } from "react";
import { Button } from "~/core/components/ui/button";
import { Input } from "~/core/components/ui/input";
import { Label } from "~/core/components/ui/label";
import { Textarea } from "~/core/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/core/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/core/components/ui/select";

interface JobAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (job: JobFormData) => void;
}

export interface JobFormData {
  position: string;
  title: string;
  employmentType: string;
  location: string;
  experience: string;
  status: string;
  deadline: string;
  description: string;
  qualifications: string;
  benefits: string;
}

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: "정규직", label: "정규직" },
  { value: "계약직", label: "계약직" },
  { value: "인턴", label: "인턴" },
];

const STATUS_OPTIONS = [
  { value: "모집중", label: "모집중" },
  { value: "마감", label: "마감" },
];

export function JobAddModal({
  open,
  onOpenChange,
  onSubmit,
}: JobAddModalProps) {
  const [formData, setFormData] = useState<JobFormData>({
    position: "",
    title: "",
    employmentType: "정규직",
    location: "",
    experience: "",
    status: "모집중",
    deadline: "",
    description: "",
    qualifications: "",
    benefits: "",
  });

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setFormData({
        position: "",
        title: "",
        employmentType: "정규직",
        location: "",
        experience: "",
        status: "모집중",
        deadline: "",
        description: "",
        qualifications: "",
        benefits: "",
      });
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">새 채용 공고 추가</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Job Position Fields */}
          <div className="space-y-4">
            {/* Position Name (Full Width) */}
            <div className="space-y-2">
              <Label htmlFor="position">채용 포지션</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) =>
                  setFormData({ ...formData, position: e.target.value })
                }
                placeholder="예: 생산관리 담당자"
                required
              />
            </div>

            {/* Title & Employment Type */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">부서</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="부서명을 입력하세요"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employmentType">고용 형태</Label>
                <Select
                  value={formData.employmentType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, employmentType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="고용 형태 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMPLOYMENT_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Location & Experience */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">근무지</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="충청북도 진천군"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">경력</Label>
                <Input
                  id="experience"
                  value={formData.experience}
                  onChange={(e) =>
                    setFormData({ ...formData, experience: e.target.value })
                  }
                  placeholder="신입/경력, 경력 3년 이상 등"
                  required
                />
              </div>
            </div>

            {/* Status & Deadline */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">모집 상태</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="모집 상태 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">마감일</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) =>
                    setFormData({ ...formData, deadline: e.target.value })
                  }
                  onFocus={(e) => {
                    try {
                      (e.target as HTMLInputElement).showPicker?.();
                    } catch (error) {
                      // showPicker not supported
                    }
                  }}
                  className="cursor-pointer [&::-webkit-calendar-picker-indicator]:ml-auto [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  style={{ userSelect: "none" }}
                  required
                />
              </div>
            </div>

            {/* Position Description */}
            <div className="space-y-2">
              <Label htmlFor="description">포지션 설명</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="포지션에 대한 설명을 입력하세요"
                rows={4}
                required
              />
            </div>

            {/* Qualifications */}
            <div className="space-y-2">
              <Label htmlFor="qualifications">자격 요건</Label>
              <Textarea
                id="qualifications"
                value={formData.qualifications}
                onChange={(e) =>
                  setFormData({ ...formData, qualifications: e.target.value })
                }
                placeholder="각 항목을 줄바꿈으로 구분하여 입력하세요"
                rows={5}
                required
              />
            </div>

            {/* Benefits */}
            <div className="space-y-2">
              <Label htmlFor="benefits">복리후생</Label>
              <Textarea
                id="benefits"
                value={formData.benefits}
                onChange={(e) =>
                  setFormData({ ...formData, benefits: e.target.value })
                }
                placeholder="각 항목을 줄바꿈으로 구분하여 입력하세요"
                rows={4}
                required
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-[#204E3A] hover:bg-[#1a3f2e]"
            >
              추가
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
            >
              취소
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

