import type { Locale } from "@/lib/types";

type Dictionary = {
  title: string;
  appName: string;
  login: string;
  loginSubtitle: string;
  signOut: string;
  loginError: string;
  loginTemporaryError: string;
  selectEvaluator: string;
  evaluatorManagement: string;
  addEvaluator: string;
  email: string;
  continue: string;
  adminLogin: string;
  evaluator: string;
  admin: string;
  dashboard: string;
  newEvaluation: string;
  myEvaluations: string;
  trainers: string;
  recipients: string;
  recipient: string;
  name: string;
  department: string;
  recipientManagement: string;
  addRecipient: string;
  selectRecipient: string;
  questions: string;
  evaluationTopics: string;
  evaluationTopic: string;
  topicManagement: string;
  addTopic: string;
  selectTopic: string;
  topicName: string;
  course: string;
  round: string;
  year: string;
  topicDescription: string;
  evaluations: string;
  evaluationSummaries: string;
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
  rowsPerPage: string;
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
  deleteEvaluationWarning: string;
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
  language: string;
  lightMode: string;
  darkMode: string;
  switchToLightMode: string;
  switchToDarkMode: string;
  close: string;
  openNavigation: string;
  closeNavigation: string;
  adminNavigation: string;
  evaluatorNavigation: string;
  importResults: string;
  viewSelectedResults: string;
  selectAllFilteredResults: string;
  selectedSummaryResults: string;
  evaluationReport: string;
  summaryEvaluationReport: string;
  closeReport: string;
  closeComparison: string;
  setupEvaluation: string;
  setupEvaluationDescription: string;
  selectionLockedAfterScoring: string;
  selectRound: string;
  section: string;
  review: string;
  readyToSubmit: string;
  allQuestionsScored: string;
  evaluationItem: string;
  obtainedScore: string;
  fullScore: string;
  averageMaxFive: string;
  overallAverage: string;
  finalResult: string;
  noComment: string;
  competencyProfile: string;
  categoryScores: string;
  average: string;
  individualEvaluations: string;
  detail: string;
  hideDetail: string;
  savePng: string;
  savingPng: string;
  saving: string;
  editEvaluation: string;
  saveChanges: string;
  allFieldsRequired: string;
  unableToLoad: string;
  unableToSave: string;
  unableToUpdate: string;
  unableToDelete: string;
  unableToExport: string;
  selectedEmployees: string;
  importDescription: string;
  saveToFirestore: string;
  page: string;
  securePortal: string;
  adminAccessDescription: string;
  or: string;
  internalUseOnly: string;
};

export const dictionaries: Record<Locale, Dictionary> = {
  th: {
    title: "ระบบประเมินการรับรองผู้ฝึกสอน",
    appName: "Nanyang Trainer Certification",
    login: "เข้าสู่ระบบ",
    loginSubtitle: "ระบบประเมินการรับรองผู้ฝึกสอน Nanyang",
    signOut: "ออกจากระบบ",
    loginError: "ไม่พบรหัสพนักงานนี้ในระบบ",
    loginTemporaryError: "ไม่สามารถเข้าสู่ระบบได้ โปรดลองอีกครั้ง",
    selectEvaluator: "เลือกชื่อผู้ประเมินของคุณ",
    evaluatorManagement: "จัดการผู้ประเมิน",
    addEvaluator: "เพิ่มผู้ประเมิน",
    email: "อีเมล",
    continue: "เริ่มทำการประเมิน",
    adminLogin: "เข้าสู่ระบบผู้ดูแล",
    evaluator: "ผู้ประเมิน",
    admin: "ผู้ดูแลระบบ",
    dashboard: "แดชบอร์ด",
    newEvaluation: "ประเมินใหม่",
    myEvaluations: "ประวัติการประเมิน",
    trainers: "ผู้ฝึกสอน",
    recipients: "ผู้รับการประเมิน",
    recipient: "ผู้รับการประเมิน",
    name: "ชื่อ",
    department: "แผนก",
    recipientManagement: "จัดการผู้รับการประเมิน",
    addRecipient: "เพิ่มผู้รับการประเมิน",
    selectRecipient: "เลือกผู้รับการประเมิน",
    questions: "คำถาม",
    evaluationTopics: "หัวข้อประเมิน",
    evaluationTopic: "หัวข้อประเมิน",
    topicManagement: "จัดการหัวข้อประเมิน",
    addTopic: "เพิ่มหัวข้อประเมิน",
    selectTopic: "เลือกหัวข้อประเมิน",
    topicName: "ชื่อหัวข้อ",
    course: "หลักสูตร",
    round: "รอบ",
    year: "ปี",
    topicDescription: "รายละเอียดหัวข้อ",
    evaluations: "ผลการประเมิน",
    evaluationSummaries: "สรุปผลรวม",
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
    rowsPerPage: "รายการต่อหน้า",
    step: "ขั้นตอน",
    of: "จาก",
    comment: "ความคิดเห็น",
    additionalComment: "ความคิดเห็นเพิ่มเติม",
    commentPlaceholder:
      "เพิ่มหมายเหตุการประเมิน จุดแข็ง ความเสี่ยง และแผนติดตาม",
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
    deleteEvaluationWarning:
      "ผลการประเมินและรายละเอียดคะแนนทั้งหมดจะถูกลบถาวร และไม่สามารถกู้คืนได้",
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
    performanceByBu: "ประสิทธิภาพตามแผนก",
    options: "ตัวเลือก",
    optionsHint: "ตัวเลือก (1 บรรทัดต่อ 1 ตัวเลือก)",
    optionsPlaceholder:
      "คำอธิบายระดับ 1\nคำอธิบายระดับ 2\nคำอธิบายระดับ 3\nคำอธิบายระดับ 4\nคำอธิบายระดับ 5",
    language: "ภาษา",
    lightMode: "โหมดสว่าง",
    darkMode: "โหมดมืด",
    switchToLightMode: "เปลี่ยนเป็นโหมดสว่าง",
    switchToDarkMode: "เปลี่ยนเป็นโหมดมืด",
    close: "ปิด",
    openNavigation: "เปิดเมนูนำทาง",
    closeNavigation: "ปิดเมนูนำทาง",
    adminNavigation: "เมนูนำทางผู้ดูแลระบบ",
    evaluatorNavigation: "เมนูนำทางผู้ประเมิน",
    importResults: "นำเข้าผลการประเมิน",
    viewSelectedResults: "ดูผลลัพธ์ที่เลือก",
    selectAllFilteredResults: "เลือกผลลัพธ์ทั้งหมดที่กรองไว้",
    selectedSummaryResults: "สรุปผลลัพธ์ที่เลือก",
    evaluationReport: "รายงานการประเมิน",
    summaryEvaluationReport: "รายงานสรุปการประเมิน",
    closeReport: "ปิดรายงาน",
    closeComparison: "ปิดการเปรียบเทียบ",
    setupEvaluation: "ตั้งค่าการประเมิน",
    setupEvaluationDescription: "เลือกผู้รับการประเมิน หัวข้อการประเมิน และรอบเพื่อเริ่มต้น",
    selectionLockedAfterScoring: "ผู้รับการประเมิน หัวข้อ และรอบจะถูกล็อกหลังเริ่มให้คะแนน เลือกประเมินใหม่เพื่อเริ่มแบบฟอร์มใหม่",
    selectRound: "เลือกรอบ",
    section: "หมวด",
    review: "ตรวจสอบ",
    readyToSubmit: "พร้อมส่งแบบประเมิน",
    allQuestionsScored: "ตอบคำถามครบทุกข้อแล้ว สามารถเพิ่มความคิดเห็นได้หากต้องการ",
    evaluationItem: "รายการประเมิน",
    obtainedScore: "คะแนนที่ได้",
    fullScore: "คะแนนเต็ม",
    averageMaxFive: "ค่าเฉลี่ย (เต็ม 5)",
    overallAverage: "ค่าเฉลี่ยรวม",
    finalResult: "ผลลัพธ์สุดท้าย",
    noComment: "ไม่มีความคิดเห็น",
    competencyProfile: "โปรไฟล์ความสามารถ",
    categoryScores: "คะแนนตามหมวดหมู่",
    average: "ค่าเฉลี่ย",
    individualEvaluations: "การประเมินรายบุคคล",
    detail: "รายละเอียด",
    hideDetail: "ซ่อนรายละเอียด",
    savePng: "บันทึก PNG",
    savingPng: "กำลังบันทึก PNG...",
    saving: "กำลังบันทึก...",
    editEvaluation: "แก้ไขผลการประเมิน",
    saveChanges: "บันทึกการแก้ไข",
    allFieldsRequired: "กรุณากรอกข้อมูลให้ครบและตรวจสอบวันที่ รอบ และคะแนน",
    unableToLoad: "ไม่สามารถโหลดข้อมูลได้ โปรดลองอีกครั้ง",
    unableToSave: "ไม่สามารถบันทึกข้อมูลได้ โปรดลองอีกครั้ง",
    unableToUpdate: "ไม่สามารถอัปเดตข้อมูลได้ โปรดลองอีกครั้ง",
    unableToDelete: "ไม่สามารถลบข้อมูลได้ โปรดลองอีกครั้ง",
    unableToExport: "ไม่สามารถส่งออกรายงานได้ โปรดลองอีกครั้ง",
    selectedEmployees: "พนักงานที่เลือก",
    importDescription: "เลือกผู้รับการประเมิน หลักสูตร วันที่ และรอบ กรอกผลจาก MS Forms/Teams สำหรับผู้ประเมิน 1 คน แล้วบันทึก",
    saveToFirestore: "บันทึกลง Firestore",
    page: "หน้า",
    securePortal: "พอร์ทัลการประเมินภายในที่ปลอดภัย",
    adminAccessDescription: "กรอกรหัสพนักงานเพื่อเข้าถึงเครื่องมือผู้ดูแลระบบ",
    or: "หรือ",
    internalUseOnly: "สำหรับใช้งานภายใน Nanyang เท่านั้น",
  },
  en: {
    title: "Trainer Certification Evaluation",
    appName: "Nanyang Trainer Certification",
    login: "Login",
    loginSubtitle: "Nanyang Trainer Certification Evaluation System",
    signOut: "Sign Out",
    loginError: "Employee ID not found",
    loginTemporaryError: "Unable to sign in. Please try again.",
    selectEvaluator: "Select your evaluator name",
    evaluatorManagement: "Manage Evaluators",
    addEvaluator: "Add Evaluator",
    email: "Email",
    continue: "Start Evaluation",
    adminLogin: "Administrator sign in",
    evaluator: "Evaluator",
    admin: "Admin",
    dashboard: "Dashboard",
    newEvaluation: "New Evaluation",
    myEvaluations: "My Evaluations",
    trainers: "Trainers",
    recipients: "Evaluation Recipients",
    recipient: "Evaluation Recipient",
    name: "Name",
    department: "Department",
    recipientManagement: "Manage Evaluation Recipients",
    addRecipient: "Add Recipient",
    selectRecipient: "Select Recipient",
    questions: "Questions",
    evaluationTopics: "Evaluation Topics",
    evaluationTopic: "Evaluation Topic",
    topicManagement: "Manage Evaluation Topics",
    addTopic: "Add Topic",
    selectTopic: "Select Topic",
    topicName: "Topic Name",
    course: "Course",
    round: "Round",
    year: "Year",
    topicDescription: "Topic Description",
    evaluations: "Evaluations",
    evaluationSummaries: "Summary Result",
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
    rowsPerPage: "Rows per page",
    step: "Step",
    of: "of",
    comment: "Comment",
    additionalComment: "Additional Comment",
    commentPlaceholder:
      "Add evaluation notes, strengths, risks, and follow-up actions.",
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
    deleteEvaluationWarning:
      "The evaluation and all score details will be permanently deleted and cannot be recovered.",
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
    performanceByBu: "Performance by Department",
    options: "options",
    optionsHint: "Options (1 per line)",
    optionsPlaceholder:
      "Level 1 description\nLevel 2 description\nLevel 3 description\nLevel 4 description\nLevel 5 description",
    language: "Language",
    lightMode: "Light mode",
    darkMode: "Dark mode",
    switchToLightMode: "Switch to light mode",
    switchToDarkMode: "Switch to dark mode",
    close: "Close",
    openNavigation: "Open navigation",
    closeNavigation: "Close navigation",
    adminNavigation: "Admin navigation",
    evaluatorNavigation: "Evaluator navigation",
    importResults: "Import Results",
    viewSelectedResults: "View selected results",
    selectAllFilteredResults: "Select all filtered results",
    selectedSummaryResults: "Selected summary results",
    evaluationReport: "Evaluation report",
    summaryEvaluationReport: "Summary evaluation report",
    closeReport: "Close report",
    closeComparison: "Close comparison",
    setupEvaluation: "Set up the evaluation",
    setupEvaluationDescription: "Select the recipient, evaluation topic, and round to begin.",
    selectionLockedAfterScoring: "The recipient, topic, and round are locked after scoring begins. Select Evaluate next to begin a new form.",
    selectRound: "Select round",
    section: "Section",
    review: "Review",
    readyToSubmit: "Ready to submit",
    allQuestionsScored: "All questions have been scored. Add a comment if needed.",
    evaluationItem: "Evaluation Item",
    obtainedScore: "Obtained Score",
    fullScore: "Full Score",
    averageMaxFive: "Average (Max 5)",
    overallAverage: "Overall Average",
    finalResult: "Final Result",
    noComment: "No comment",
    competencyProfile: "Competency Profile",
    categoryScores: "Category Scores",
    average: "Average",
    individualEvaluations: "Individual Evaluations",
    detail: "Detail",
    hideDetail: "Hide detail",
    savePng: "Save PNG",
    savingPng: "Saving PNG...",
    saving: "Saving...",
    editEvaluation: "Edit evaluation",
    saveChanges: "Save changes",
    allFieldsRequired: "Please complete all fields and verify the date, round, and scores.",
    unableToLoad: "Unable to load data. Please try again.",
    unableToSave: "Unable to save. Please try again.",
    unableToUpdate: "Unable to update. Please try again.",
    unableToDelete: "Unable to delete. Please try again.",
    unableToExport: "Unable to export the report. Please try again.",
    selectedEmployees: "selected employees",
    importDescription: "Select the recipient, course, date, and round. Enter MS Forms/Teams results for one evaluator, then save.",
    saveToFirestore: "Save to Firestore",
    page: "Page",
    securePortal: "Secure internal assessment portal",
    adminAccessDescription: "Enter your employee ID to access administration tools.",
    or: "or",
    internalUseOnly: "Nanyang internal use only",
  },
  lo: {
    title: "ລະບົບປະເມີນການຮັບຮອງຜູ້ຝຶກສອນ",
    appName: "Nanyang Trainer Certification",
    login: "ເຂົ້າສູ່ລະບົບ",
    loginSubtitle: "ລະບົບປະເມີນການຮັບຮອງຜູ້ຝຶກສອນ Nanyang",
    signOut: "ອອກຈາກລະບົບ",
    loginError: "ບໍ່ພົບລະຫັດພະນັກງານນີ້ໃນລະບົບ",
    loginTemporaryError: "ບໍ່ສາມາດເຂົ້າລະບົບໄດ້ ກະລຸນາລອງໃໝ່",
    selectEvaluator: "ເລືອກຊື່ຜູ້ປະເມີນຂອງທ່ານ",
    evaluatorManagement: "ຈັດການຜູ້ປະເມີນ",
    addEvaluator: "ເພີ່ມຜູ້ປະເມີນ",
    email: "ອີເມວ",
    continue: "ເລີ່ມການປະເມີນ",
    adminLogin: "ເຂົ້າລະບົບຜູ້ດູແລ",
    evaluator: "ຜູ້ປະເມີນ",
    admin: "ຜູ້ດູແລ",
    dashboard: "ແດຊບອດ",
    newEvaluation: "ປະເມີນໃໝ່",
    myEvaluations: "ປະຫວັດການປະເມີນ",
    trainers: "ຜູ້ຝຶກສອນ",
    recipients: "ຜູ້ຮັບການປະເມີນ",
    recipient: "ຜູ້ຮັບການປະເມີນ",
    name: "ຊື່",
    department: "ພະແນກ",
    recipientManagement: "ຈັດການຜູ້ຮັບການປະເມີນ",
    addRecipient: "ເພີ່ມຜູ້ຮັບການປະເມີນ",
    selectRecipient: "ເລືອກຜູ້ຮັບການປະເມີນ",
    questions: "ຄຳຖາມ",
    evaluationTopics: "ຫົວຂໍ້ປະເມີນ",
    evaluationTopic: "ຫົວຂໍ້ປະເມີນ",
    topicManagement: "ຈັດການຫົວຂໍ້ປະເມີນ",
    addTopic: "ເພີ່ມຫົວຂໍ້ປະເມີນ",
    selectTopic: "ເລືອກຫົວຂໍ້ປະເມີນ",
    topicName: "ຊື່ຫົວຂໍ້",
    course: "ຫຼັກສູດ",
    round: "ຮອບ",
    year: "ປີ",
    topicDescription: "ລາຍລະອຽດຫົວຂໍ້",
    evaluations: "ຜົນການປະເມີນ",
    evaluationSummaries: "ສະຫຼຸບຜົນລວມ",
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
    rowsPerPage: "ລາຍການຕໍ່ໜ້າ",
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
    deleteEvaluationWarning:
      "ຜົນການປະເມີນ ແລະ ລາຍລະອຽດຄະແນນທັງໝົດຈະຖືກລຶບຖາວອນ ແລະ ບໍ່ສາມາດກູ້ຄືນໄດ້",
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
    performanceByBu: "ປະສິດທິພາບຕາມພະແນກ",
    options: "ຕົວເລືອກ",
    optionsHint: "ຕົວເລືອກ (1 ແຖວຕໍ່ 1 ຕົວເລືອກ)",
    optionsPlaceholder:
      "ຄຳອະທິບາຍລະດັບ 1\nຄຳອະທິບາຍລະດັບ 2\nຄຳອະທິບາຍລະດັບ 3\nຄຳອະທິບາຍລະດັບ 4\nຄຳອະທິບາຍລະດັບ 5",
    language: "ພາສາ",
    lightMode: "ໂໝດສະຫວ່າງ",
    darkMode: "ໂໝດມືດ",
    switchToLightMode: "ປ່ຽນເປັນໂໝດສະຫວ່າງ",
    switchToDarkMode: "ປ່ຽນເປັນໂໝດມືດ",
    close: "ປິດ",
    openNavigation: "ເປີດເມນູນຳທາງ",
    closeNavigation: "ປິດເມນູນຳທາງ",
    adminNavigation: "ເມນູນຳທາງຜູ້ດູແລ",
    evaluatorNavigation: "ເມນູນຳທາງຜູ້ປະເມີນ",
    importResults: "ນຳເຂົ້າຜົນການປະເມີນ",
    viewSelectedResults: "ເບິ່ງຜົນທີ່ເລືອກ",
    selectAllFilteredResults: "ເລືອກຜົນທີ່ກັ່ນຕອງໄວ້ທັງໝົດ",
    selectedSummaryResults: "ສະຫຼຸບຜົນທີ່ເລືອກ",
    evaluationReport: "ລາຍງານການປະເມີນ",
    summaryEvaluationReport: "ລາຍງານສະຫຼຸບການປະເມີນ",
    closeReport: "ປິດລາຍງານ",
    closeComparison: "ປິດການປຽບທຽບ",
    setupEvaluation: "ຕັ້ງຄ່າການປະເມີນ",
    setupEvaluationDescription: "ເລືອກຜູ້ຮັບການປະເມີນ ຫົວຂໍ້ ແລະ ຮອບເພື່ອເລີ່ມຕົ້ນ",
    selectionLockedAfterScoring: "ຜູ້ຮັບການປະເມີນ ຫົວຂໍ້ ແລະ ຮອບຈະຖືກລັອກຫຼັງຈາກເລີ່ມໃຫ້ຄະແນນ ເລືອກປະເມີນໃໝ່ເພື່ອເລີ່ມແບບຟອມໃໝ່",
    selectRound: "ເລືອກຮອບ",
    section: "ໝວດ",
    review: "ກວດສອບ",
    readyToSubmit: "ພ້ອມສົ່ງການປະເມີນ",
    allQuestionsScored: "ໃຫ້ຄະແນນຄຳຖາມຄົບແລ້ວ ເພີ່ມຄຳເຫັນໄດ້ຖ້າຕ້ອງການ",
    evaluationItem: "ລາຍການປະເມີນ",
    obtainedScore: "ຄະແນນທີ່ໄດ້",
    fullScore: "ຄະແນນເຕັມ",
    averageMaxFive: "ຄ່າສະເລ່ຍ (ເຕັມ 5)",
    overallAverage: "ຄ່າສະເລ່ຍລວມ",
    finalResult: "ຜົນສຸດທ້າຍ",
    noComment: "ບໍ່ມີຄຳເຫັນ",
    competencyProfile: "ໂປຣໄຟລ໌ຄວາມສາມາດ",
    categoryScores: "ຄະແນນຕາມໝວດໝູ່",
    average: "ຄ່າສະເລ່ຍ",
    individualEvaluations: "ການປະເມີນລາຍບຸກຄົນ",
    detail: "ລາຍລະອຽດ",
    hideDetail: "ເຊື່ອງລາຍລະອຽດ",
    savePng: "ບັນທຶກ PNG",
    savingPng: "ກຳລັງບັນທຶກ PNG...",
    saving: "ກຳລັງບັນທຶກ...",
    editEvaluation: "ແກ້ໄຂຜົນການປະເມີນ",
    saveChanges: "ບັນທຶກການແກ້ໄຂ",
    allFieldsRequired: "ກະລຸນາກອກຂໍ້ມູນໃຫ້ຄົບ ແລະ ກວດສອບວັນທີ ຮອບ ແລະ ຄະແນນ",
    unableToLoad: "ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້ ກະລຸນາລອງໃໝ່",
    unableToSave: "ບໍ່ສາມາດບັນທຶກໄດ້ ກະລຸນາລອງໃໝ່",
    unableToUpdate: "ບໍ່ສາມາດອັບເດດໄດ້ ກະລຸນາລອງໃໝ່",
    unableToDelete: "ບໍ່ສາມາດລຶບໄດ້ ກະລຸນາລອງໃໝ່",
    unableToExport: "ບໍ່ສາມາດສົ່ງອອກລາຍງານໄດ້ ກະລຸນາລອງໃໝ່",
    selectedEmployees: "ພະນັກງານທີ່ເລືອກ",
    importDescription: "ເລືອກຜູ້ຮັບການປະເມີນ ຫຼັກສູດ ວັນທີ ແລະ ຮອບ ໃສ່ຜົນຈາກ MS Forms/Teams ສຳລັບຜູ້ປະເມີນ 1 ຄົນ ແລ້ວບັນທຶກ",
    saveToFirestore: "ບັນທຶກໃນ Firestore",
    page: "ໜ້າ",
    securePortal: "ພອດທັລປະເມີນພາຍໃນທີ່ປອດໄພ",
    adminAccessDescription: "ໃສ່ລະຫັດພະນັກງານເພື່ອເຂົ້າເຖິງເຄື່ອງມືຜູ້ດູແລ",
    or: "ຫຼື",
    internalUseOnly: "ສຳລັບໃຊ້ງານພາຍໃນ Nanyang ເທົ່ານັ້ນ",
  },
  vi: {
    title: "Đánh giá chứng nhận giảng viên",
    appName: "Nanyang Trainer Certification",
    login: "Đăng nhập",
    loginSubtitle: "Hệ thống đánh giá chứng nhận giảng viên Nanyang",
    signOut: "Đăng xuất",
    loginError: "Không tìm thấy mã nhân viên",
    loginTemporaryError: "Không thể đăng nhập. Vui lòng thử lại.",
    selectEvaluator: "Chọn tên người đánh giá của bạn",
    evaluatorManagement: "Quản lý người đánh giá",
    addEvaluator: "Thêm người đánh giá",
    email: "Email",
    continue: "Bắt đầu đánh giá",
    adminLogin: "Đăng nhập quản trị viên",
    evaluator: "Người đánh giá",
    admin: "Quản trị",
    dashboard: "Bảng điều khiển",
    newEvaluation: "Đánh giá mới",
    myEvaluations: "Lịch sử đánh giá",
    trainers: "Giảng viên",
    recipients: "Người được đánh giá",
    recipient: "Người được đánh giá",
    name: "Tên",
    department: "Phòng ban",
    recipientManagement: "Quản lý người được đánh giá",
    addRecipient: "Thêm người được đánh giá",
    selectRecipient: "Chọn người được đánh giá",
    questions: "Câu hỏi",
    evaluationTopics: "Chủ đề đánh giá",
    evaluationTopic: "Chủ đề đánh giá",
    topicManagement: "Quản lý chủ đề đánh giá",
    addTopic: "Thêm chủ đề",
    selectTopic: "Chọn chủ đề đánh giá",
    topicName: "Tên chủ đề",
    course: "Khóa học",
    round: "Vòng",
    year: "Năm",
    topicDescription: "Mô tả chủ đề",
    evaluations: "Kết quả đánh giá",
    evaluationSummaries: "Kết quả tổng hợp",
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
    rowsPerPage: "Số dòng mỗi trang",
    step: "Bước",
    of: "trên",
    comment: "Nhận xét",
    additionalComment: "Nhận xét bổ sung",
    commentPlaceholder:
      "Thêm ghi chú đánh giá, điểm mạnh, rủi ro và kế hoạch theo dõi.",
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
    deleteEvaluationWarning:
      "Kết quả đánh giá và toàn bộ chi tiết điểm sẽ bị xóa vĩnh viễn và không thể khôi phục.",
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
    optionsPlaceholder:
      "Mô tả mức 1\nMô tả mức 2\nMô tả mức 3\nMô tả mức 4\nMô tả mức 5",
    language: "Ngôn ngữ",
    lightMode: "Chế độ sáng",
    darkMode: "Chế độ tối",
    switchToLightMode: "Chuyển sang chế độ sáng",
    switchToDarkMode: "Chuyển sang chế độ tối",
    close: "Đóng",
    openNavigation: "Mở điều hướng",
    closeNavigation: "Đóng điều hướng",
    adminNavigation: "Điều hướng quản trị",
    evaluatorNavigation: "Điều hướng người đánh giá",
    importResults: "Nhập kết quả",
    viewSelectedResults: "Xem kết quả đã chọn",
    selectAllFilteredResults: "Chọn tất cả kết quả đã lọc",
    selectedSummaryResults: "Kết quả tổng hợp đã chọn",
    evaluationReport: "Báo cáo đánh giá",
    summaryEvaluationReport: "Báo cáo tổng hợp đánh giá",
    closeReport: "Đóng báo cáo",
    closeComparison: "Đóng so sánh",
    setupEvaluation: "Thiết lập đánh giá",
    setupEvaluationDescription: "Chọn người được đánh giá, chủ đề đánh giá và vòng để bắt đầu.",
    selectionLockedAfterScoring: "Người được đánh giá, chủ đề và vòng sẽ bị khóa sau khi bắt đầu chấm điểm. Chọn đánh giá mới để bắt đầu biểu mẫu mới.",
    selectRound: "Chọn vòng",
    section: "Mục",
    review: "Xem lại",
    readyToSubmit: "Sẵn sàng gửi",
    allQuestionsScored: "Tất cả câu hỏi đã được chấm điểm. Thêm nhận xét nếu cần.",
    evaluationItem: "Hạng mục đánh giá",
    obtainedScore: "Điểm đạt được",
    fullScore: "Điểm tối đa",
    averageMaxFive: "Trung bình (tối đa 5)",
    overallAverage: "Điểm trung bình chung",
    finalResult: "Kết quả cuối cùng",
    noComment: "Không có nhận xét",
    competencyProfile: "Hồ sơ năng lực",
    categoryScores: "Điểm theo danh mục",
    average: "Trung bình",
    individualEvaluations: "Đánh giá cá nhân",
    detail: "Chi tiết",
    hideDetail: "Ẩn chi tiết",
    savePng: "Lưu PNG",
    savingPng: "Đang lưu PNG...",
    saving: "Đang lưu...",
    editEvaluation: "Chỉnh sửa kết quả đánh giá",
    saveChanges: "Lưu thay đổi",
    allFieldsRequired: "Vui lòng điền đủ thông tin và kiểm tra ngày, vòng và điểm.",
    unableToLoad: "Không thể tải dữ liệu. Vui lòng thử lại.",
    unableToSave: "Không thể lưu. Vui lòng thử lại.",
    unableToUpdate: "Không thể cập nhật. Vui lòng thử lại.",
    unableToDelete: "Không thể xóa. Vui lòng thử lại.",
    unableToExport: "Không thể xuất báo cáo. Vui lòng thử lại.",
    selectedEmployees: "nhân viên đã chọn",
    importDescription: "Chọn người được đánh giá, khóa học, ngày và vòng. Nhập kết quả MS Forms/Teams cho một người đánh giá rồi lưu.",
    saveToFirestore: "Lưu vào Firestore",
    page: "Trang",
    securePortal: "Cổng đánh giá nội bộ an toàn",
    adminAccessDescription: "Nhập mã nhân viên để truy cập công cụ quản trị.",
    or: "hoặc",
    internalUseOnly: "Chỉ dùng nội bộ Nanyang",
  },
};
