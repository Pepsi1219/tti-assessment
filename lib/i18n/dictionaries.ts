import type { Locale } from "@/lib/types";

type Dictionary = {
  title: string;
  appName: string;
  login: string;
  loginSubtitle: string;
  signOut: string;
  loginError: string;
  evaluator: string;
  admin: string;
  dashboard: string;
  newEvaluation: string;
  myEvaluations: string;
  trainers: string;
  questions: string;
  evaluations: string;
  users: string;
  analytics: string;
  settings: string;
  search: string;
  searchTrainer: string;
  selectTrainer: string;
  chooseTrainer: string;
  submit: string;
  submitting: string;
  cancel: string;
  save: string;
  edit: string;
  delete: string;
  create: string;
  back: string;
  next: string;
  previous: string;
  step: string;
  of: string;
  comment: string;
  additionalComment: string;
  commentPlaceholder: string;
  result: string;
  pass: string;
  fail: string;
  totalScore: string;
  percentage: string;
  date: string;
  trainer: string;
  trainerName: string;
  employeeId: string;
  bu: string;
  status: string;
  active: string;
  inactive: string;
  category: string;
  question: string;
  weight: string;
  maxScore: string;
  score: string;
  poor: string;
  fair: string;
  good: string;
  veryGood: string;
  excellent: string;
  critical: string;
  complete: string;
  incomplete: string;
  progress: string;
  evaluationMap: string;
  currentSession: string;
  ready: string;
  liveStatus: string;
  candidate: string;
  chooseTrainerToBegin: string;
  resultReport: string;
  categorySummary: string;
  evaluationHistory: string;
  viewResult: string;
  exportExcel: string;
  exportPdf: string;
  totalEvaluations: string;
  passRate: string;
  failRate: string;
  averageScore: string;
  topTrainers: string;
  lowestCategories: string;
  certificationOverview: string;
  trainerManagement: string;
  questionManagement: string;
  evaluationManagement: string;
  noData: string;
  loading: string;
  error: string;
  success: string;
  confirm: string;
  confirmDelete: string;
  addTrainer: string;
  addQuestion: string;
  filter: string;
  sortBy: string;
  all: string;
  evaluatedBy: string;
  evaluationDate: string;
  actions: string;
  view: string;
  noEvaluationsYet: string;
  fillAllQuestions: string;
  selectTrainerFirst: string;
  evaluationSubmitted: string;
  welcome: string;
  overview: string;
  recentEvaluations: string;
  scoreDistribution: string;
  categoryPerformance: string;
  monthlyTrend: string;
  showCriteria: string;
  hideCriteria: string;
  scoreExcellent: string;
  scorePass: string;
  scoreConditional: string;
  scoreFail: string;
  evals: string;
  total: string;
  performanceByBu: string;
  options: string;
  optionsHint: string;
  optionsPlaceholder: string;
};

export const dictionaries: Record<Locale, Dictionary> = {
  th: {
    title: "ระบบประเมินการรับรองผู้ฝึกสอน",
    appName: "Nanyang Trainer Certification",
    login: "เข้าสู่ระบบ",
    loginSubtitle: "ระบบประเมินการรับรองผู้ฝึกสอน Nanyang",
    signOut: "ออกจากระบบ",
    loginError: "ไม่พบรหัสพนักงานนี้ในระบบ",
    evaluator: "ผู้ประเมิน",
    admin: "ผู้ดูแลระบบ",
    dashboard: "แดชบอร์ด",
    newEvaluation: "ประเมินใหม่",
    myEvaluations: "ประวัติการประเมิน",
    trainers: "ผู้ฝึกสอน",
    questions: "คำถาม",
    evaluations: "ผลการประเมิน",
    users: "ผู้ใช้งาน",
    analytics: "วิเคราะห์",
    settings: "ตั้งค่า",
    search: "ค้นหา",
    searchTrainer: "ค้นหาผู้ฝึกสอน",
    selectTrainer: "เลือกผู้ฝึกสอน",
    chooseTrainer: "เลือกผู้ฝึกสอน",
    submit: "ส่งแบบประเมิน",
    submitting: "กำลังส่ง...",
    cancel: "ยกเลิก",
    save: "บันทึก",
    edit: "แก้ไข",
    delete: "ลบ",
    create: "สร้าง",
    back: "กลับ",
    next: "ถัดไป",
    previous: "ก่อนหน้า",
    step: "ขั้นตอน",
    of: "จาก",
    comment: "ความคิดเห็น",
    additionalComment: "ความคิดเห็นเพิ่มเติม",
    commentPlaceholder: "เพิ่มหมายเหตุการประเมิน จุดแข็ง ความเสี่ยง และแผนติดตาม",
    result: "ผลการประเมิน",
    pass: "ผ่าน",
    fail: "ไม่ผ่าน",
    totalScore: "คะแนนรวม",
    percentage: "เปอร์เซ็นต์",
    date: "วันที่",
    trainer: "ผู้ฝึกสอน",
    trainerName: "ชื่อผู้ฝึกสอน",
    employeeId: "รหัสพนักงาน",
    bu: "หน่วยธุรกิจ",
    status: "สถานะ",
    active: "ใช้งาน",
    inactive: "ไม่ใช้งาน",
    category: "หมวดหมู่",
    question: "คำถาม",
    weight: "น้ำหนัก",
    maxScore: "คะแนนเต็ม",
    score: "คะแนน",
    poor: "ต้องปรับปรุง",
    fair: "พอใช้",
    good: "ดี",
    veryGood: "ดีมาก",
    excellent: "ยอดเยี่ยม",
    critical: "สำคัญ",
    complete: "เสร็จสิ้น",
    incomplete: "ยังไม่เสร็จ",
    progress: "ความคืบหน้า",
    evaluationMap: "แผนที่การประเมิน",
    currentSession: "เซสชันปัจจุบัน",
    ready: "พร้อม",
    liveStatus: "สถานะ",
    candidate: "ผู้สมัคร",
    chooseTrainerToBegin: "เลือกผู้ฝึกสอนเพื่อเริ่มต้น",
    resultReport: "รายงานผล",
    categorySummary: "สรุปตามหมวดหมู่",
    evaluationHistory: "ประวัติการประเมิน",
    viewResult: "ดูผลลัพธ์",
    exportExcel: "ส่งออก Excel",
    exportPdf: "ส่งออก PDF",
    totalEvaluations: "การประเมินทั้งหมด",
    passRate: "อัตราผ่าน",
    failRate: "อัตราไม่ผ่าน",
    averageScore: "คะแนนเฉลี่ย",
    topTrainers: "ผู้ฝึกสอนดีเด่น",
    lowestCategories: "หมวดหมู่ที่ต้องปรับปรุง",
    certificationOverview: "ภาพรวมการรับรอง",
    trainerManagement: "จัดการผู้ฝึกสอน",
    questionManagement: "จัดการคำถาม",
    evaluationManagement: "จัดการการประเมิน",
    noData: "ไม่มีข้อมูล",
    loading: "กำลังโหลด...",
    error: "เกิดข้อผิดพลาด",
    success: "สำเร็จ",
    confirm: "ยืนยัน",
    confirmDelete: "ยืนยันการลบ?",
    addTrainer: "เพิ่มผู้ฝึกสอน",
    addQuestion: "เพิ่มคำถาม",
    filter: "กรอง",
    sortBy: "เรียงตาม",
    all: "ทั้งหมด",
    evaluatedBy: "ประเมินโดย",
    evaluationDate: "วันที่ประเมิน",
    actions: "การดำเนินการ",
    view: "ดู",
    noEvaluationsYet: "ยังไม่มีการประเมิน",
    fillAllQuestions: "กรุณาตอบคำถามทั้งหมด",
    selectTrainerFirst: "กรุณาเลือกผู้ฝึกสอนก่อน",
    evaluationSubmitted: "ส่งการประเมินเรียบร้อยแล้ว",
    welcome: "ยินดีต้อนรับ",
    overview: "ภาพรวม",
    recentEvaluations: "การประเมินล่าสุด",
    scoreDistribution: "การกระจายคะแนน",
    categoryPerformance: "ประสิทธิภาพตามหมวดหมู่",
    monthlyTrend: "แนวโน้มรายเดือน",
    showCriteria: "ดูเกณฑ์การให้คะแนน",
    hideCriteria: "ซ่อนเกณฑ์",
    scoreExcellent: "ยอดเยี่ยม (4.5-5.0)",
    scorePass: "ผ่าน (3.5-4.49)",
    scoreConditional: "มีเงื่อนไข (3.0-3.49)",
    scoreFail: "ไม่ผ่าน (<3.0)",
    evals: "การประเมิน",
    total: "ทั้งหมด",
    performanceByBu: "ประสิทธิภาพตามหน่วยธุรกิจ",
    options: "ตัวเลือก",
    optionsHint: "ตัวเลือก (1 บรรทัดต่อ 1 ตัวเลือก)",
    optionsPlaceholder: "คำอธิบายระดับ 1\nคำอธิบายระดับ 2\nคำอธิบายระดับ 3\nคำอธิบายระดับ 4\nคำอธิบายระดับ 5"
  },
  en: {
    title: "Trainer Certification Evaluation",
    appName: "Nanyang Trainer Certification",
    login: "Login",
    loginSubtitle: "Nanyang Trainer Certification Evaluation System",
    signOut: "Sign Out",
    loginError: "Employee ID not found",
    evaluator: "Evaluator",
    admin: "Admin",
    dashboard: "Dashboard",
    newEvaluation: "New Evaluation",
    myEvaluations: "My Evaluations",
    trainers: "Trainers",
    questions: "Questions",
    evaluations: "Evaluations",
    users: "Users",
    analytics: "Analytics",
    settings: "Settings",
    search: "Search",
    searchTrainer: "Search Trainer",
    selectTrainer: "Select Trainer",
    chooseTrainer: "Choose Trainer",
    submit: "Submit Evaluation",
    submitting: "Submitting...",
    cancel: "Cancel",
    save: "Save",
    edit: "Edit",
    delete: "Delete",
    create: "Create",
    back: "Back",
    next: "Next",
    previous: "Previous",
    step: "Step",
    of: "of",
    comment: "Comment",
    additionalComment: "Additional Comment",
    commentPlaceholder: "Add evaluation notes, strengths, risks, and follow-up actions.",
    result: "Result",
    pass: "Pass",
    fail: "Fail",
    totalScore: "Total Score",
    percentage: "Percentage",
    date: "Date",
    trainer: "Trainer",
    trainerName: "Trainer Name",
    employeeId: "Employee ID",
    bu: "Business Unit",
    status: "Status",
    active: "Active",
    inactive: "Inactive",
    category: "Category",
    question: "Question",
    weight: "Weight",
    maxScore: "Max Score",
    score: "Score",
    poor: "Poor",
    fair: "Fair",
    good: "Good",
    veryGood: "Very Good",
    excellent: "Excellent",
    critical: "Critical",
    complete: "Complete",
    incomplete: "Incomplete",
    progress: "Progress",
    evaluationMap: "Evaluation Map",
    currentSession: "Current Session",
    ready: "ready",
    liveStatus: "Live Status",
    candidate: "Candidate",
    chooseTrainerToBegin: "Choose a trainer to begin.",
    resultReport: "Result Report",
    categorySummary: "Category Summary",
    evaluationHistory: "Evaluation History",
    viewResult: "View Result",
    exportExcel: "Export Excel",
    exportPdf: "Export PDF",
    totalEvaluations: "Total Evaluations",
    passRate: "Pass Rate",
    failRate: "Fail Rate",
    averageScore: "Average Score",
    topTrainers: "Top Trainers",
    lowestCategories: "Lowest Categories",
    certificationOverview: "Certification Overview",
    trainerManagement: "Trainer Management",
    questionManagement: "Question Management",
    evaluationManagement: "Evaluation Management",
    noData: "No data",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    confirm: "Confirm",
    confirmDelete: "Confirm delete?",
    addTrainer: "Add Trainer",
    addQuestion: "Add Question",
    filter: "Filter",
    sortBy: "Sort by",
    all: "All",
    evaluatedBy: "Evaluated by",
    evaluationDate: "Evaluation Date",
    actions: "Actions",
    view: "View",
    noEvaluationsYet: "No evaluations yet",
    fillAllQuestions: "Please answer all questions",
    selectTrainerFirst: "Please select a trainer first",
    evaluationSubmitted: "Evaluation submitted successfully",
    welcome: "Welcome",
    overview: "Overview",
    recentEvaluations: "Recent Evaluations",
    scoreDistribution: "Score Distribution",
    categoryPerformance: "Category Performance",
    monthlyTrend: "Monthly Trend",
    showCriteria: "Show Scoring Criteria",
    hideCriteria: "Hide Criteria",
    scoreExcellent: "Excellent (4.5-5.0)",
    scorePass: "Pass (3.5-4.49)",
    scoreConditional: "Conditional (3.0-3.49)",
    scoreFail: "Fail (<3.0)",
    evals: "evals",
    total: "Total",
    performanceByBu: "Performance by Business Unit",
    options: "options",
    optionsHint: "Options (1 per line)",
    optionsPlaceholder: "Level 1 description\nLevel 2 description\nLevel 3 description\nLevel 4 description\nLevel 5 description"
  },
  lo: {
    title: "ລະບົບປະເມີນການຮັບຮອງຜູ້ຝຶກສອນ",
    appName: "Nanyang Trainer Certification",
    login: "ເຂົ້າສູ່ລະບົບ",
    loginSubtitle: "ລະບົບປະເມີນການຮັບຮອງຜູ້ຝຶກສອນ Nanyang",
    signOut: "ອອກຈາກລະບົບ",
    loginError: "ບໍ່ພົບລະຫັດພະນັກງານນີ້ໃນລະບົບ",
    evaluator: "ຜູ້ປະເມີນ",
    admin: "ຜູ້ດູແລ",
    dashboard: "ແດຊບອດ",
    newEvaluation: "ປະເມີນໃໝ່",
    myEvaluations: "ປະຫວັດການປະເມີນ",
    trainers: "ຜູ້ຝຶກສອນ",
    questions: "ຄຳຖາມ",
    evaluations: "ຜົນການປະເມີນ",
    users: "ຜູ້ໃຊ້ງານ",
    analytics: "ວິເຄາະ",
    settings: "ຕັ້ງຄ່າ",
    search: "ຄົ້ນຫາ",
    searchTrainer: "ຄົ້ນຫາຜູ້ຝຶກສອນ",
    selectTrainer: "ເລືອກຜູ້ຝຶກສອນ",
    chooseTrainer: "ເລືອກຜູ້ຝຶກສອນ",
    submit: "ສົ່ງການປະເມີນ",
    submitting: "ກຳລັງສົ່ງ...",
    cancel: "ຍົກເລີກ",
    save: "ບັນທຶກ",
    edit: "ແກ້ໄຂ",
    delete: "ລຶບ",
    create: "ສ້າງ",
    back: "ກັບ",
    next: "ຕໍ່ໄປ",
    previous: "ກ່ອນໜ້າ",
    step: "ຂັ້ນຕອນ",
    of: "ຈາກ",
    comment: "ຄວາມຄິດເຫັນ",
    additionalComment: "ຄວາມຄິດເຫັນເພີ່ມເຕີມ",
    commentPlaceholder: "ເພີ່ມບັນທຶກການປະເມີນ ຈຸດແຂງ ຄວາມສ່ຽງ ແລະແຜນຕິດຕາມ",
    result: "ຜົນ",
    pass: "ຜ່ານ",
    fail: "ບໍ່ຜ່ານ",
    totalScore: "ຄະແນນລວມ",
    percentage: "ເປີເຊັນ",
    date: "ວັນທີ",
    trainer: "ຜູ້ຝຶກສອນ",
    trainerName: "ຊື່ຜູ້ຝຶກສອນ",
    employeeId: "ລະຫັດພະນັກງານ",
    bu: "ໜ່ວຍທຸລະກິດ",
    status: "ສະຖານະ",
    active: "ໃຊ້ງານ",
    inactive: "ບໍ່ໃຊ້ງານ",
    category: "ໝວດໝູ່",
    question: "ຄຳຖາມ",
    weight: "ນ້ຳໜັກ",
    maxScore: "ຄະແນນເຕັມ",
    score: "ຄະແນນ",
    poor: "ຕ້ອງປັບປຸງ",
    fair: "ພໍໃຊ້",
    good: "ດີ",
    veryGood: "ດີຫຼາຍ",
    excellent: "ດີເດັ່ນ",
    critical: "ສຳຄັນ",
    complete: "ສຳເລັດ",
    incomplete: "ຍັງບໍ່ສຳເລັດ",
    progress: "ຄວາມຄືບໜ້າ",
    evaluationMap: "ແຜນທີ່ການປະເມີນ",
    currentSession: "ເຊສຊັນປັດຈຸບັນ",
    ready: "ພ້ອມ",
    liveStatus: "ສະຖານະ",
    candidate: "ຜູ້ສະໝັກ",
    chooseTrainerToBegin: "ເລືອກຜູ້ຝຶກສອນເພື່ອເລີ່ມຕົ້ນ",
    resultReport: "ລາຍງານຜົນ",
    categorySummary: "ສະຫຼຸບຕາມໝວດໝູ່",
    evaluationHistory: "ປະຫວັດການປະເມີນ",
    viewResult: "ເບິ່ງຜົນ",
    exportExcel: "ສົ່ງອອກ Excel",
    exportPdf: "ສົ່ງອອກ PDF",
    totalEvaluations: "ການປະເມີນທັງໝົດ",
    passRate: "ອັດຕາຜ່ານ",
    failRate: "ອັດຕາບໍ່ຜ່ານ",
    averageScore: "ຄະແນນສະເລ່ຍ",
    topTrainers: "ຜູ້ຝຶກສອນດີເດັ່ນ",
    lowestCategories: "ໝວດໝູ່ທີ່ຕ້ອງປັບປຸງ",
    certificationOverview: "ພາບລວມການຮັບຮອງ",
    trainerManagement: "ຈັດການຜູ້ຝຶກສອນ",
    questionManagement: "ຈັດການຄຳຖາມ",
    evaluationManagement: "ຈັດການການປະເມີນ",
    noData: "ບໍ່ມີຂໍ້ມູນ",
    loading: "ກຳລັງໂຫຼດ...",
    error: "ເກີດຂໍ້ຜິດພາດ",
    success: "ສຳເລັດ",
    confirm: "ຢືນຢັນ",
    confirmDelete: "ຢືນຢັນການລຶບ?",
    addTrainer: "ເພີ່ມຜູ້ຝຶກສອນ",
    addQuestion: "ເພີ່ມຄຳຖາມ",
    filter: "ກັ່ນຕອງ",
    sortBy: "ຮຽງຕາມ",
    all: "ທັງໝົດ",
    evaluatedBy: "ປະເມີນໂດຍ",
    evaluationDate: "ວັນທີປະເມີນ",
    actions: "ການດຳເນີນການ",
    view: "ເບິ່ງ",
    noEvaluationsYet: "ຍັງບໍ່ມີການປະເມີນ",
    fillAllQuestions: "ກະລຸນາຕອບຄຳຖາມທັງໝົດ",
    selectTrainerFirst: "ກະລຸນາເລືອກຜູ້ຝຶກສອນກ່ອນ",
    evaluationSubmitted: "ສົ່ງການປະເມີນສຳເລັດແລ້ວ",
    welcome: "ຍິນດີຕ້ອນຮັບ",
    overview: "ພາບລວມ",
    recentEvaluations: "ການປະເມີນລ່າສຸດ",
    scoreDistribution: "ການກະຈາຍຄະແນນ",
    categoryPerformance: "ປະສິດທິພາບຕາມໝວດໝູ່",
    monthlyTrend: "ແນວໂນ້ມລາຍເດືອນ",
    showCriteria: "ເບິ່ງເກນການໃຫ້ຄະແນນ",
    hideCriteria: "ເຊື່ອງເກນ",
    scoreExcellent: "ດີເດັ່ນ (4.5-5.0)",
    scorePass: "ຜ່ານ (3.5-4.49)",
    scoreConditional: "ມີເງື່ອນໄຂ (3.0-3.49)",
    scoreFail: "ບໍ່ຜ່ານ (<3.0)",
    evals: "ການປະເມີນ",
    total: "ທັງໝົດ",
    performanceByBu: "ປະສິດທິພາບຕາມໜ່ວຍທຸລະກິດ",
    options: "ຕົວເລືອກ",
    optionsHint: "ຕົວເລືອກ (1 ແຖວຕໍ່ 1 ຕົວເລືອກ)",
    optionsPlaceholder: "ຄຳອະທິບາຍລະດັບ 1\nຄຳອະທິບາຍລະດັບ 2\nຄຳອະທິບາຍລະດັບ 3\nຄຳອະທິບາຍລະດັບ 4\nຄຳອະທິບາຍລະດັບ 5"
  },
  vi: {
    title: "Đánh giá chứng nhận giảng viên",
    appName: "Nanyang Trainer Certification",
    login: "Đăng nhập",
    loginSubtitle: "Hệ thống đánh giá chứng nhận giảng viên Nanyang",
    signOut: "Đăng xuất",
    loginError: "Không tìm thấy mã nhân viên",
    evaluator: "Người đánh giá",
    admin: "Quản trị",
    dashboard: "Bảng điều khiển",
    newEvaluation: "Đánh giá mới",
    myEvaluations: "Lịch sử đánh giá",
    trainers: "Giảng viên",
    questions: "Câu hỏi",
    evaluations: "Kết quả đánh giá",
    users: "Người dùng",
    analytics: "Phân tích",
    settings: "Cài đặt",
    search: "Tìm kiếm",
    searchTrainer: "Tìm giảng viên",
    selectTrainer: "Chọn giảng viên",
    chooseTrainer: "Chọn giảng viên",
    submit: "Gửi đánh giá",
    submitting: "Đang gửi...",
    cancel: "Hủy",
    save: "Lưu",
    edit: "Sửa",
    delete: "Xóa",
    create: "Tạo",
    back: "Quay lại",
    next: "Tiếp theo",
    previous: "Trước đó",
    step: "Bước",
    of: "trên",
    comment: "Nhận xét",
    additionalComment: "Nhận xét bổ sung",
    commentPlaceholder: "Thêm ghi chú đánh giá, điểm mạnh, rủi ro và kế hoạch theo dõi.",
    result: "Kết quả",
    pass: "Đạt",
    fail: "Không đạt",
    totalScore: "Tổng điểm",
    percentage: "Phần trăm",
    date: "Ngày",
    trainer: "Giảng viên",
    trainerName: "Tên giảng viên",
    employeeId: "Mã nhân viên",
    bu: "Bộ phận",
    status: "Trạng thái",
    active: "Hoạt động",
    inactive: "Không hoạt động",
    category: "Danh mục",
    question: "Câu hỏi",
    weight: "Trọng số",
    maxScore: "Điểm tối đa",
    score: "Điểm",
    poor: "Kém",
    fair: "Trung bình",
    good: "Tốt",
    veryGood: "Rất tốt",
    excellent: "Xuất sắc",
    critical: "Quan trọng",
    complete: "Hoàn thành",
    incomplete: "Chưa hoàn thành",
    progress: "Tiến độ",
    evaluationMap: "Bản đồ đánh giá",
    currentSession: "Phiên hiện tại",
    ready: "sẵn sàng",
    liveStatus: "Trạng thái",
    candidate: "Ứng viên",
    chooseTrainerToBegin: "Chọn giảng viên để bắt đầu.",
    resultReport: "Báo cáo kết quả",
    categorySummary: "Tóm tắt theo danh mục",
    evaluationHistory: "Lịch sử đánh giá",
    viewResult: "Xem kết quả",
    exportExcel: "Xuất Excel",
    exportPdf: "Xuất PDF",
    totalEvaluations: "Tổng đánh giá",
    passRate: "Tỷ lệ đạt",
    failRate: "Tỷ lệ không đạt",
    averageScore: "Điểm trung bình",
    topTrainers: "Giảng viên xuất sắc",
    lowestCategories: "Danh mục cần cải thiện",
    certificationOverview: "Tổng quan chứng nhận",
    trainerManagement: "Quản lý giảng viên",
    questionManagement: "Quản lý câu hỏi",
    evaluationManagement: "Quản lý đánh giá",
    noData: "Không có dữ liệu",
    loading: "Đang tải...",
    error: "Lỗi",
    success: "Thành công",
    confirm: "Xác nhận",
    confirmDelete: "Xác nhận xóa?",
    addTrainer: "Thêm giảng viên",
    addQuestion: "Thêm câu hỏi",
    filter: "Lọc",
    sortBy: "Sắp xếp",
    all: "Tất cả",
    evaluatedBy: "Đánh giá bởi",
    evaluationDate: "Ngày đánh giá",
    actions: "Hành động",
    view: "Xem",
    noEvaluationsYet: "Chưa có đánh giá",
    fillAllQuestions: "Vui lòng trả lời tất cả câu hỏi",
    selectTrainerFirst: "Vui lòng chọn giảng viên trước",
    evaluationSubmitted: "Đã gửi đánh giá thành công",
    welcome: "Chào mừng",
    overview: "Tổng quan",
    recentEvaluations: "Đánh giá gần đây",
    scoreDistribution: "Phân bố điểm",
    categoryPerformance: "Hiệu suất theo danh mục",
    monthlyTrend: "Xu hướng hàng tháng",
    showCriteria: "Xem tiêu chí chấm điểm",
    hideCriteria: "Ẩn tiêu chí",
    scoreExcellent: "Xuất sắc (4.5-5.0)",
    scorePass: "Đạt (3.5-4.49)",
    scoreConditional: "Có điều kiện (3.0-3.49)",
    scoreFail: "Không đạt (<3.0)",
    evals: "đánh giá",
    total: "Tổng",
    performanceByBu: "Hiệu suất theo bộ phận",
    options: "tùy chọn",
    optionsHint: "Tùy chọn (1 dòng mỗi tùy chọn)",
    optionsPlaceholder: "Mô tả mức 1\nMô tả mức 2\nMô tả mức 3\nMô tả mức 4\nMô tả mức 5"
  }
};
