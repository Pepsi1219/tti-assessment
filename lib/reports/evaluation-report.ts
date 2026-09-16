import type { CategorySummary, Locale } from "@/lib/types";
import {
  CRITICAL_CATEGORY_PASS_THRESHOLD,
  OVERALL_PASS_THRESHOLD,
} from "@/lib/services/evaluation-scoring";

export const REPORT_CATEGORY_NAMES: Record<Locale, Record<string, string>> = {
  th: {
    discipline: "วินัย",
    presentation: "ทักษะการนำเสนอ",
    communication: "ทักษะการสื่อสาร",
    knowledge: "ความสามารถด้านความรู้",
    methods: "วิธีการและเทคนิคการฝึกอบรม",
    feedback: "ทักษะการประเมินและให้ข้อมูลย้อนกลับ",
    professionalism: "ความเป็นมืออาชีพและทัศนคติผู้ฝึกสอน",
  },
  en: {
    discipline: "Discipline",
    presentation: "Training Delivery Skills",
    communication: "Communication Skills",
    knowledge: "Knowledge Competency",
    methods: "Training Methods & Techniques",
    feedback: "Evaluation & Feedback Skills",
    professionalism: "Professionalism & Trainer Attitude",
  },
  lo: {
    discipline: "ວິໄນ",
    presentation: "ທັກສະການນຳສະເໜີ",
    communication: "ທັກສະການສື່ສານ",
    knowledge: "ຄວາມສາມາດດ້ານຄວາມຮູ້",
    methods: "ວິທີການແລະເຕັກນິກການຝຶກອົບຮົມ",
    feedback: "ທັກສະການປະເມີນແລະຂໍ້ມູນປ້ອນກັບ",
    professionalism: "ຄວາມເປັນມືອາຊີບແລະທັດສະນະຂອງຜູ້ຝຶກສອນ",
  },
  vi: {
    discipline: "Kỷ luật",
    presentation: "Kỹ năng triển khai đào tạo",
    communication: "Kỹ năng giao tiếp",
    knowledge: "Năng lực kiến thức",
    methods: "Phương pháp và kỹ thuật đào tạo",
    feedback: "Kỹ năng đánh giá và phản hồi",
    professionalism: "Tính chuyên nghiệp và thái độ của giảng viên",
  },
};

export function getReportCategoryName(
  category: Pick<CategorySummary, "categoryId" | "categoryName" | "isCritical">,
  locale: Locale = "en",
) {
  const name = REPORT_CATEGORY_NAMES[locale][category.categoryId] ?? category.categoryName;
  return category.isCritical ? `${name}*` : name;
}

export function getPassingCriteria(
  overallAverage: number,
  categories: CategorySummary[],
  locale: Locale = "en",
) {
  const overallLabels: Record<Locale, string> = {
    th: `ค่าเฉลี่ยรวมต้องไม่น้อยกว่า ${OVERALL_PASS_THRESHOLD.toFixed(1)} จาก 5`,
    en: `Overall average must be at least ${OVERALL_PASS_THRESHOLD.toFixed(1)} out of 5`,
    lo: `ຄ່າສະເລ່ຍລວມຕ້ອງບໍ່ຕໍ່າກວ່າ ${OVERALL_PASS_THRESHOLD.toFixed(1)} ຈາກ 5`,
    vi: `Điểm trung bình chung phải đạt ít nhất ${OVERALL_PASS_THRESHOLD.toFixed(1)} trên 5`,
  };
  const criticalLabels: Record<Locale, (name: string) => string> = {
    th: (name) => `${name} ต้องไม่ต่ำกว่า ${CRITICAL_CATEGORY_PASS_THRESHOLD.toFixed(1)}`,
    en: (name) => `${name} must not be below ${CRITICAL_CATEGORY_PASS_THRESHOLD.toFixed(1)}`,
    lo: (name) => `${name} ຕ້ອງບໍ່ຕໍ່າກວ່າ ${CRITICAL_CATEGORY_PASS_THRESHOLD.toFixed(1)}`,
    vi: (name) => `${name} không được thấp hơn ${CRITICAL_CATEGORY_PASS_THRESHOLD.toFixed(1)}`,
  };
  return [
    {
      id: "overall",
      label: overallLabels[locale],
      actual: overallAverage,
      passed: overallAverage >= OVERALL_PASS_THRESHOLD,
    },
    ...categories.filter((category) => category.isCritical).map((category) => ({
      id: category.categoryId,
      label: criticalLabels[locale](
        REPORT_CATEGORY_NAMES[locale][category.categoryId] ?? category.categoryName,
      ),
      actual: category.average,
      passed: category.average >= CRITICAL_CATEGORY_PASS_THRESHOLD,
    })),
  ];
}
