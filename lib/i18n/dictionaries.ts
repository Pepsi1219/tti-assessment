import type { Locale } from "@/lib/types";

type Dictionary = {
  title: string;
  appName: string;
  login: string;
  loginSubtitle: string;
  signOut: string;
  loginError: string;
  loginTemporaryError: string;
  evaluationClosedTitle: string;
  evaluationClosedDescription: string;
  evaluationOpenDescription: string;
  evaluationAccess: string;
  evaluationsOpen: string;
  evaluationsClosed: string;
  openEvaluations: string;
  closeEvaluations: string;
  closeEvaluationConfirm: string;
  selectEvaluator: string;
  evaluatorManagement: string;
  addEvaluator: string;
  adminManagement: string;
  addAdmin: string;
  administratorType: string;
  developer: string;
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
  selectAssessment: string;
  selectCourseAssessment: string;
  publishedButCourseNotUpdated: string;
  evaluationCourseHelp: string;
  topicName: string;
  course: string;
  round: string;
  latestRoundForBu: string;
  useLatestRound: string;
  chooseCustomRound: string;
  year: string;
  topicDescription: string;
  assessmentVersions: string;
  assessmentVersion: string;
  assessmentName: string;
  versionLabel: string;
  unassignedAssessmentVersions: string;
  assessmentType: string;
  assessmentMode: string;
  examMode: string;
  correctAnswer: string;
  selectCorrectAnswer: string;
  startExam: string;
  submitExam: string;
  pendingExams: string;
  noPendingExams: string;
  awaitingGrading: string;
  candidateAnswer: string;
  manualScore: string;
  autoScored: string;
  examSubmitted: string;
  gradeExam: string;
  submitGrade: string;
  previewAssessment: string;
  previewModeNotice: string;
  legacyAssessment: string;
  dashboardProfile: string;
  overallPassThreshold: string;
  overallPassThresholdType: string;
  averageOutOfFive: string;
  criticalPassThreshold: string;
  publishAssessment: string;
  draft: string;
  published: string;
  publishedVersionHelp: string;
  createRevision: string;
  revisionReady: string;
  draftSaved: string;
  versionPublished: string;
  assessmentVersionInUse: string;
  assessmentVersionDeleted: string;
  deleteAssessmentVersionWarning: string;
  createAssessment: string;
  addCategory: string;
  questionType: string;
  required: string;
  scored: string;
  allowMultiple: string;
  statements: string;
  scoreAllChoiceQuestions: string;
  categoryScoreProfile: string;
  overallScoreProfile: string;
  passFailProfile: string;
  evaluations: string;
  loadMore: string;
  evaluationsLog: string;
  evaluationSummaries: string;
  users: string;
  analytics: string;
  settings: string;
  system: string;
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
  clearDate: string;
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
  responses: string;
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
    evaluationClosedTitle: "ระบบยังไม่เปิดให้ทำการประเมิน",
    evaluationClosedDescription: "ขณะนี้ปิดรับแบบประเมิน กรุณารอให้ผู้ดูแลระบบเปิดรับอีกครั้ง",
    evaluationOpenDescription: "ผู้ประเมินสามารถเปิดลิงก์และทำแบบประเมินได้",
    evaluationAccess: "การเปิดรับแบบประเมิน",
    evaluationsOpen: "เปิดรับแบบประเมิน",
    evaluationsClosed: "ปิดรับแบบประเมิน",
    openEvaluations: "เปิดรับแบบประเมิน",
    closeEvaluations: "ปิดรับแบบประเมิน",
    closeEvaluationConfirm: "ยืนยันการปิดรับแบบประเมินหรือไม่? ผู้ที่เปิดลิงก์จะเห็นหน้าแจ้งว่าระบบยังไม่เปิดให้ทำการประเมิน",
    selectEvaluator: "เลือกชื่อผู้ประเมินของคุณ",
    evaluatorManagement: "จัดการผู้ประเมิน",
    addEvaluator: "เพิ่มผู้ประเมิน",
    adminManagement: "จัดการผู้ดูแลระบบ",
    addAdmin: "เพิ่มผู้ดูแลระบบ",
    administratorType: "ประเภทบัญชี",
    developer: "Developer",
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
    evaluationTopics: "หลักสูตร",
    evaluationTopic: "หลักสูตร",
    topicManagement: "จัดการหลักสูตร",
    addTopic: "เพิ่มหลักสูตร",
    selectTopic: "เลือกหลักสูตร",
    selectAssessment: "เลือกแบบประเมิน",
    selectCourseAssessment: "เลือกหลักสูตรเพื่อเปิดแบบประเมินที่ผูกไว้",
    publishedButCourseNotUpdated: "เผยแพร่แบบประเมินแล้ว แต่กำหนดเวอร์ชันใหม่ให้หลักสูตรนี้ไม่สำเร็จ กรุณาเลือกเวอร์ชันในหน้าหลักสูตร",
    evaluationCourseHelp: "เลือกหลักสูตรที่ต้องการประเมิน ระบบจะโหลดแบบประเมินที่ผูกกับหลักสูตรนี้",
    topicName: "ชื่อหลักสูตร",
    course: "หลักสูตร",
    round: "รอบ",
    latestRoundForBu: "รอบล่าสุดของ BU นี้",
    useLatestRound: "ใช้รอบล่าสุด",
    chooseCustomRound: "กำหนดรอบเอง",
    year: "ปี",
    topicDescription: "รายละเอียดหลักสูตร",
    assessmentVersions: "แบบประเมิน",
    assessmentVersion: "เวอร์ชันแบบประเมิน",
    assessmentName: "ชื่อแบบประเมิน",
    versionLabel: "เวอร์ชัน",
    unassignedAssessmentVersions: "เวอร์ชันแบบประเมินที่ยังไม่ผูกกับหลักสูตร",
    assessmentType: "ประเภทแบบประเมิน",
    assessmentMode: "Assessment",
    examMode: "Exam",
    correctAnswer: "คำตอบที่ถูกต้อง",
    selectCorrectAnswer: "เลือกคำตอบที่ถูกต้อง",
    startExam: "เริ่มทำข้อสอบ",
    submitExam: "ส่งข้อสอบ",
    pendingExams: "ข้อสอบรอตรวจ",
    noPendingExams: "ไม่มีข้อสอบที่รอตรวจ",
    awaitingGrading: "รอตรวจคำตอบ",
    candidateAnswer: "คำตอบของผู้เข้าสอบ",
    manualScore: "คะแนนที่ให้",
    autoScored: "ตรวจอัตโนมัติ",
    examSubmitted: "ส่งข้อสอบแล้วและเพิ่มในคิวรอตรวจ",
    gradeExam: "ตรวจข้อสอบ",
    submitGrade: "บันทึกคะแนน",
    previewAssessment: "ดูตัวอย่างแบบประเมิน",
    previewModeNotice: "โหมดตัวอย่างเท่านั้น คำตอบจะไม่ถูกบันทึกหรือส่งเข้าระบบ",
    legacyAssessment: "00",
    dashboardProfile: "รูปแบบแดชบอร์ด",
    overallPassThreshold: "เกณฑ์คะแนนรวมผ่าน",
    overallPassThresholdType: "รูปแบบเกณฑ์คะแนนรวม",
    averageOutOfFive: "คะแนนเฉลี่ย (เต็ม 5)",
    criticalPassThreshold: "เกณฑ์หมวดสำคัญผ่าน",
    publishAssessment: "เผยแพร่แบบประเมิน",
    draft: "ฉบับร่าง",
    published: "เผยแพร่แล้ว",
    publishedVersionHelp: "เวอร์ชันที่เผยแพร่แล้วแก้ไขทับไม่ได้ ให้สร้างเวอร์ชันใหม่เพื่อเก็บผลเดิมไว้",
    createRevision: "สร้างเวอร์ชันใหม่จากแบบนี้",
    revisionReady: "เตรียมเวอร์ชันใหม่สำหรับแก้ไขแล้ว กดบันทึกหรือเผยแพร่เพื่อสร้างเวอร์ชันนี้ในระบบ",
    draftSaved: "บันทึกฉบับร่างเรียบร้อยแล้ว",
    versionPublished: "เผยแพร่เวอร์ชันเรียบร้อยแล้ว",
    assessmentVersionInUse: "ลบไม่ได้ เพราะเวอร์ชันนี้ยังถูกใช้งานหรือมีผลประเมิน/ข้อสอบอ้างอิงอยู่",
    assessmentVersionDeleted: "ลบเวอร์ชันแบบประเมินเรียบร้อยแล้ว",
    deleteAssessmentVersionWarning: "การลบเวอร์ชันนี้ไม่สามารถย้อนกลับได้ หากยังมีหลักสูตรหรือผลประเมินอ้างอิง ระบบจะไม่อนุญาตให้ลบ",
    createAssessment: "สร้างแบบประเมินใหม่",
    addCategory: "เพิ่ม Section",
    questionType: "ประเภทคำตอบ",
    required: "จำเป็นต้องตอบ",
    scored: "นำไปคำนวณคะแนน",
    allowMultiple: "เลือกได้หลายข้อ",
    statements: "ข้อความในแต่ละแถว",
    scoreAllChoiceQuestions: "เปิดคะแนนให้ Choice แบบเลือกข้อเดียวทั้งหมด",
    categoryScoreProfile: "คะแนนแยกหมวด",
    overallScoreProfile: "คะแนนรวม",
    passFailProfile: "ผ่าน / ไม่ผ่าน",
    evaluations: "ผลการประเมิน",
    loadMore: "โหลดเพิ่มเติม",
    evaluationsLog: "บันทึกผลการประเมิน",
    evaluationSummaries: "สรุปผลรวม",
    users: "ผู้ใช้งาน",
    analytics: "วิเคราะห์",
    settings: "ตั้งค่า",
    system: "ระบบ",
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
    clearDate: "ล้างวันที่",
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
    optionsPlaceholder: "ตัวเลือก 1\nตัวเลือก 2\nตัวเลือก 3",
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
    responses: "คำตอบ",
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
    evaluationClosedTitle: "Evaluations are not open yet",
    evaluationClosedDescription: "Evaluation submissions are currently closed. Please wait for an administrator to open them.",
    evaluationOpenDescription: "Evaluators can open the link and submit evaluations.",
    evaluationAccess: "Evaluation availability",
    evaluationsOpen: "Evaluations open",
    evaluationsClosed: "Evaluations closed",
    openEvaluations: "Open evaluations",
    closeEvaluations: "Close evaluations",
    closeEvaluationConfirm: "Close evaluations? Anyone opening the link will see the closed page.",
    selectEvaluator: "Select your evaluator name",
    evaluatorManagement: "Manage Evaluators",
    addEvaluator: "Add Evaluator",
    adminManagement: "Manage Administrators",
    addAdmin: "Add Administrator",
    administratorType: "Account Type",
    developer: "Developer",
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
    evaluationTopics: "Courses",
    evaluationTopic: "Course",
    topicManagement: "Manage Courses",
    addTopic: "Add Course",
    selectTopic: "Select a course",
    selectAssessment: "Select an assessment",
    selectCourseAssessment: "Select a course to load its assigned assessment",
    publishedButCourseNotUpdated: "The assessment was published, but this course was not updated. Assign the new version from Courses.",
    evaluationCourseHelp: "Choose the course to evaluate. Its assigned assessment will load automatically.",
    topicName: "Course Name",
    course: "Course",
    round: "Round",
    latestRoundForBu: "Latest round for this BU",
    useLatestRound: "Use latest round",
    chooseCustomRound: "Choose a different round",
    year: "Year",
    topicDescription: "Course Description",
    assessmentVersions: "Assessments",
    assessmentVersion: "Assessment Version",
    assessmentName: "Assessment Name",
    versionLabel: "Version",
    unassignedAssessmentVersions: "Unassigned Assessment Versions",
    assessmentType: "Type",
    assessmentMode: "Assessment",
    examMode: "Exam",
    correctAnswer: "Correct answer",
    selectCorrectAnswer: "Select the correct answer",
    startExam: "Start exam",
    submitExam: "Submit exam",
    pendingExams: "Pending exams",
    noPendingExams: "No exams are waiting for grading",
    awaitingGrading: "Awaiting grading",
    candidateAnswer: "Candidate answer",
    manualScore: "Score given",
    autoScored: "Auto-graded",
    examSubmitted: "Exam submitted and added to the grading queue",
    gradeExam: "Grade exam",
    submitGrade: "Save scores",
    previewAssessment: "Preview Assessment",
    previewModeNotice: "Preview only. Responses will not be saved or submitted.",
    legacyAssessment: "00",
    dashboardProfile: "Dashboard Profile",
    overallPassThreshold: "Overall Pass Threshold",
    overallPassThresholdType: "Overall threshold scale",
    averageOutOfFive: "Average (out of 5)",
    criticalPassThreshold: "Critical Category Threshold",
    publishAssessment: "Publish Assessment",
    draft: "Draft",
    published: "Published",
    publishedVersionHelp: "Published versions are locked. Create a new version to keep previous evaluation results unchanged.",
    createRevision: "Create New Version",
    revisionReady: "New version is ready to edit. Save it as a draft or publish it to create the version.",
    draftSaved: "Draft saved successfully.",
    versionPublished: "Version published successfully.",
    assessmentVersionInUse: "This version cannot be deleted because it is active or referenced by an evaluation or exam.",
    assessmentVersionDeleted: "Assessment version deleted successfully.",
    deleteAssessmentVersionWarning: "This action cannot be undone. Versions still used by a course, evaluation, or exam cannot be deleted.",
    createAssessment: "Create New Assessment",
    addCategory: "Add Section",
    questionType: "Response type",
    required: "Required",
    scored: "Include in scoring",
    allowMultiple: "Allow multiple selections",
    statements: "Statements",
    scoreAllChoiceQuestions: "Score all single-choice questions",
    categoryScoreProfile: "Category Scores",
    overallScoreProfile: "Overall Score",
    passFailProfile: "Pass / Fail",
    evaluations: "Evaluations",
    loadMore: "Load more",
    evaluationsLog: "Evaluations Log",
    evaluationSummaries: "Summary Result",
    users: "Users",
    analytics: "Analytics",
    settings: "Settings",
    system: "System",
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
    clearDate: "Clear date",
    trainer: "Trainer",
    trainerName: "Trainer Name",
    employeeId: "ID",
    bu: "BU",
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
    optionsPlaceholder: "Option 1\nOption 2\nOption 3",
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
    responses: "Responses",
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
    evaluationClosedTitle: "ລະບົບຍັງບໍ່ເປີດໃຫ້ປະເມີນ",
    evaluationClosedDescription: "ຂະນະນີ້ປິດຮັບການປະເມີນ ກະລຸນາລໍຖ້າຜູ້ດູແລເປີດຮັບອີກຄັ້ງ",
    evaluationOpenDescription: "ຜູ້ປະເມີນສາມາດເປີດລິ້ງ ແລະ ເຮັດການປະເມີນໄດ້",
    evaluationAccess: "ການເປີດຮັບການປະເມີນ",
    evaluationsOpen: "ເປີດຮັບການປະເມີນ",
    evaluationsClosed: "ປິດຮັບການປະເມີນ",
    openEvaluations: "ເປີດຮັບການປະເມີນ",
    closeEvaluations: "ປິດຮັບການປະເມີນ",
    closeEvaluationConfirm: "ຢືນຢັນການປິດຮັບການປະເມີນບໍ? ຜູ້ທີ່ເປີດລິ້ງຈະເຫັນໜ້າແຈ້ງປິດຮັບ",
    selectEvaluator: "ເລືອກຊື່ຜູ້ປະເມີນຂອງທ່ານ",
    evaluatorManagement: "ຈັດການຜູ້ປະເມີນ",
    addEvaluator: "ເພີ່ມຜູ້ປະເມີນ",
    adminManagement: "ຈັດການຜູ້ດູແລ",
    addAdmin: "ເພີ່ມຜູ້ດູແລ",
    administratorType: "ປະເພດບັນຊີ",
    developer: "Developer",
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
    evaluationTopics: "ຫຼັກສູດ",
    evaluationTopic: "ຫຼັກສູດ",
    topicManagement: "ຈັດການຫຼັກສູດ",
    addTopic: "ເພີ່ມຫຼັກສູດ",
    selectTopic: "ເລືອກຫຼັກສູດ",
    selectAssessment: "ເລືອກແບບປະເມີນ",
    selectCourseAssessment: "ເລືອກຫຼັກສູດເພື່ອໂຫຼດແບບປະເມີນທີ່ຜູກໄວ້",
    publishedButCourseNotUpdated: "ເຜີຍແຜ່ແບບປະເມີນແລ້ວ ແຕ່ອັບເດດຫຼັກສູດນີ້ບໍ່ສຳເລັດ ກະລຸນາເລືອກລຸ້ນໃໝ່ໃນໜ້າຫຼັກສູດ",
    evaluationCourseHelp: "ເລືອກຫຼັກສູດທີ່ຈະປະເມີນ ລະບົບຈະໂຫຼດແບບປະເມີນທີ່ຜູກກັບຫຼັກສູດນີ້ອັດຕະໂນມັດ",
    topicName: "ຊື່ຫຼັກສູດ",
    course: "ຫຼັກສູດ",
    round: "ຮອບ",
    latestRoundForBu: "ຮອບຫຼ້າສຸດຂອງ BU ນີ້",
    useLatestRound: "ໃຊ້ຮອບຫຼ້າສຸດ",
    chooseCustomRound: "ກຳນົດຮອບເອງ",
    year: "ປີ",
    topicDescription: "ລາຍລະອຽດຫຼັກສູດ",
    assessmentVersions: "ແບບປະເມີນ",
    assessmentVersion: "ລຸ້ນແບບປະເມີນ",
    assessmentName: "ຊື່ແບບປະເມີນ",
    versionLabel: "ລຸ້ນ",
    unassignedAssessmentVersions: "ສະບັບແບບປະເມີນທີ່ຍັງບໍ່ໄດ້ຜູກກັບຫຼັກສູດ",
    assessmentType: "ປະເພດແບບປະເມີນ",
    assessmentMode: "Assessment",
    examMode: "Exam",
    correctAnswer: "ຄຳຕອບທີ່ຖືກຕ້ອງ",
    selectCorrectAnswer: "ເລືອກຄຳຕອບທີ່ຖືກຕ້ອງ",
    startExam: "ເລີ່ມເຮັດຂໍ້ສອບ",
    submitExam: "ສົ່ງຂໍ້ສອບ",
    pendingExams: "ຂໍ້ສອບລໍຖ້າກວດ",
    noPendingExams: "ບໍ່ມີຂໍ້ສອບລໍຖ້າກວດ",
    awaitingGrading: "ລໍຖ້າກວດຄຳຕອບ",
    candidateAnswer: "ຄຳຕອບຂອງຜູ້ເຂົ້າສອບ",
    manualScore: "ຄະແນນທີ່ໃຫ້",
    autoScored: "ກວດຄະແນນອັດຕະໂນມັດ",
    examSubmitted: "ສົ່ງຂໍ້ສອບແລ້ວ ແລະເພີ່ມໃນຄິວລໍຖ້າກວດ",
    gradeExam: "ກວດຂໍ້ສອບ",
    submitGrade: "ບັນທຶກຄະແນນ",
    previewAssessment: "ເບິ່ງຕົວຢ່າງແບບປະເມີນ",
    previewModeNotice: "ໂໝດຕົວຢ່າງເທົ່ານັ້ນ ຄຳຕອບຈະບໍ່ຖືກບັນທຶກ ຫຼື ສົ່ງເຂົ້າລະບົບ",
    legacyAssessment: "00",
    dashboardProfile: "ຮູບແບບແດຊບອດ",
    overallPassThreshold: "ເກນຄະແນນລວມຜ່ານ",
    overallPassThresholdType: "ຮູບແບບເກນຄະແນນລວມ",
    averageOutOfFive: "ຄະແນນສະເລ່ຍ (ເຕັມ 5)",
    criticalPassThreshold: "ເກນໝວດສຳຄັນຜ່ານ",
    publishAssessment: "ເຜີຍແຜ່ແບບປະເມີນ",
    draft: "ສະບັບຮ່າງ",
    published: "ເຜີຍແຜ່ແລ້ວ",
    publishedVersionHelp: "ບໍ່ສາມາດແກ້ໄຂທັບສະບັບທີ່ເຜີຍແຜ່ແລ້ວໄດ້ ໃຫ້ສ້າງສະບັບໃໝ່ເພື່ອຮັກສາຜົນປະເມີນເກົ່າ",
    createRevision: "ສ້າງສະບັບໃໝ່ຈາກແບບນີ້",
    revisionReady: "ກຽມສະບັບໃໝ່ໃຫ້ແກ້ໄຂແລ້ວ ກົດບັນທຶກ ຫຼື ເຜີຍແຜ່ເພື່ອສ້າງສະບັບນີ້ໃນລະບົບ",
    draftSaved: "ບັນທຶກສະບັບຮ່າງສຳເລັດແລ້ວ",
    versionPublished: "ເຜີຍແຜ່ສະບັບໃໝ່ສຳເລັດແລ້ວ",
    assessmentVersionInUse: "ລຶບບໍ່ໄດ້ ເພາະສະບັບນີ້ຍັງຖືກໃຊ້ ຫຼື ມີຜົນປະເມີນ/ຂໍ້ສອບອ້າງອີງຢູ່",
    assessmentVersionDeleted: "ລຶບສະບັບແບບປະເມີນສຳເລັດແລ້ວ",
    deleteAssessmentVersionWarning: "ການລຶບນີ້ບໍ່ສາມາດຍ້ອນກັບໄດ້ ຖ້າຍັງມີຫຼັກສູດ ຫຼື ຜົນປະເມີນອ້າງອີງຢູ່ ລະບົບຈະບໍ່ອະນຸຍາດໃຫ້ລຶບ",
    createAssessment: "ສ້າງແບບປະເມີນໃໝ່",
    addCategory: "ເພີ່ມ Section",
    questionType: "ປະເພດຄຳຕອບ",
    required: "ຈຳເປັນຕ້ອງຕອບ",
    scored: "ນຳໄປຄຳນວນຄະແນນ",
    allowMultiple: "ເລືອກໄດ້ຫຼາຍຂໍ້",
    statements: "ຂໍ້ຄວາມແຕ່ລະແຖວ",
    scoreAllChoiceQuestions: "ເປີດຄະແນນໃຫ້ Choice ທີ່ເລືອກຂໍ້ດຽວທັງໝົດ",
    categoryScoreProfile: "ຄະແນນແຍກຕາມໝວດ",
    overallScoreProfile: "ຄະແນນລວມ",
    passFailProfile: "ຜ່ານ / ບໍ່ຜ່ານ",
    evaluations: "ຜົນການປະເມີນ",
    loadMore: "ໂຫຼດເພີ່ມເຕີມ",
    evaluationsLog: "ບັນທຶກຜົນການປະເມີນ",
    evaluationSummaries: "ສະຫຼຸບຜົນລວມ",
    users: "ຜູ້ໃຊ້ງານ",
    analytics: "ວິເຄາະ",
    settings: "ຕັ້ງຄ່າ",
    system: "ລະບົບ",
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
    clearDate: "ລ້າງວັນທີ",
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
    optionsPlaceholder: "ຕົວເລືອກ 1\nຕົວເລືອກ 2\nຕົວເລືອກ 3",
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
    responses: "ຄຳຕອບ",
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
    evaluationClosedTitle: "Hệ thống chưa mở đánh giá",
    evaluationClosedDescription: "Hiện tại không nhận đánh giá. Vui lòng chờ quản trị viên mở lại.",
    evaluationOpenDescription: "Người đánh giá có thể mở liên kết và gửi đánh giá.",
    evaluationAccess: "Trạng thái nhận đánh giá",
    evaluationsOpen: "Đang nhận đánh giá",
    evaluationsClosed: "Đã đóng nhận đánh giá",
    openEvaluations: "Mở nhận đánh giá",
    closeEvaluations: "Đóng nhận đánh giá",
    closeEvaluationConfirm: "Đóng nhận đánh giá? Người mở liên kết sẽ thấy trang thông báo đã đóng.",
    selectEvaluator: "Chọn tên người đánh giá của bạn",
    evaluatorManagement: "Quản lý người đánh giá",
    addEvaluator: "Thêm người đánh giá",
    adminManagement: "Quản lý quản trị viên",
    addAdmin: "Thêm quản trị viên",
    administratorType: "Loại tài khoản",
    developer: "Developer",
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
    evaluationTopics: "Khóa học",
    evaluationTopic: "Khóa học",
    topicManagement: "Quản lý khóa học",
    addTopic: "Thêm khóa học",
    selectTopic: "Chọn khóa học",
    selectAssessment: "Chọn bài đánh giá",
    selectCourseAssessment: "Chọn khóa học để tải bài đánh giá đã gán",
    publishedButCourseNotUpdated: "Đã xuất bản bài đánh giá nhưng chưa cập nhật khóa học này. Hãy gán phiên bản mới trong trang Courses.",
    evaluationCourseHelp: "Chọn khóa học cần đánh giá. Bài đánh giá được gán cho khóa học sẽ tự động tải.",
    topicName: "Tên khóa học",
    course: "Khóa học",
    round: "Vòng",
    latestRoundForBu: "Vòng gần nhất của BU này",
    useLatestRound: "Dùng vòng gần nhất",
    chooseCustomRound: "Chọn vòng khác",
    year: "Năm",
    topicDescription: "Mô tả khóa học",
    assessmentVersions: "Bài đánh giá",
    assessmentVersion: "Phiên bản đánh giá",
    assessmentName: "Tên bài đánh giá",
    versionLabel: "Phiên bản",
    unassignedAssessmentVersions: "Phiên bản đánh giá chưa gán cho khóa học",
    assessmentType: "Loại bài đánh giá",
    assessmentMode: "Assessment",
    examMode: "Exam",
    correctAnswer: "Đáp án đúng",
    selectCorrectAnswer: "Chọn đáp án đúng",
    startExam: "Bắt đầu làm bài",
    submitExam: "Nộp bài thi",
    pendingExams: "Bài thi chờ chấm",
    noPendingExams: "Không có bài thi chờ chấm",
    awaitingGrading: "Đang chờ chấm điểm",
    candidateAnswer: "Câu trả lời của thí sinh",
    manualScore: "Điểm chấm",
    autoScored: "Chấm tự động",
    examSubmitted: "Đã nộp bài thi và đưa vào hàng đợi chấm",
    gradeExam: "Chấm bài thi",
    submitGrade: "Lưu điểm",
    previewAssessment: "Xem trước bài đánh giá",
    previewModeNotice: "Chỉ xem trước. Câu trả lời sẽ không được lưu hoặc gửi đi.",
    legacyAssessment: "00",
    dashboardProfile: "Bố cục bảng điều khiển",
    overallPassThreshold: "Ngưỡng đạt tổng điểm",
    overallPassThresholdType: "Thang ngưỡng tổng điểm",
    averageOutOfFive: "Điểm trung bình (trên 5)",
    criticalPassThreshold: "Ngưỡng đạt danh mục quan trọng",
    publishAssessment: "Xuất bản bài đánh giá",
    draft: "Bản nháp",
    published: "Đã xuất bản",
    publishedVersionHelp: "Phiên bản đã xuất bản không thể sửa trực tiếp. Hãy tạo phiên bản mới để giữ nguyên kết quả đánh giá cũ.",
    createRevision: "Tạo phiên bản mới từ bài này",
    revisionReady: "Phiên bản mới đã sẵn sàng để chỉnh sửa. Hãy lưu bản nháp hoặc xuất bản để tạo phiên bản này.",
    draftSaved: "Đã lưu bản nháp thành công.",
    versionPublished: "Đã xuất bản phiên bản thành công.",
    assessmentVersionInUse: "Không thể xóa vì phiên bản này đang được sử dụng hoặc được đánh giá/bài thi tham chiếu.",
    assessmentVersionDeleted: "Đã xóa phiên bản bài đánh giá.",
    deleteAssessmentVersionWarning: "Không thể hoàn tác thao tác này. Phiên bản vẫn được khóa nếu còn khóa học, bài đánh giá hoặc bài thi tham chiếu.",
    createAssessment: "Tạo bài đánh giá mới",
    addCategory: "Thêm phần",
    questionType: "Loại câu trả lời",
    required: "Bắt buộc trả lời",
    scored: "Tính vào điểm số",
    allowMultiple: "Cho phép chọn nhiều",
    statements: "Các phát biểu",
    scoreAllChoiceQuestions: "Tính điểm cho tất cả câu hỏi chọn một",
    categoryScoreProfile: "Điểm theo danh mục",
    overallScoreProfile: "Điểm tổng thể",
    passFailProfile: "Đạt / Không đạt",
    evaluations: "Kết quả đánh giá",
    loadMore: "Tải thêm",
    evaluationsLog: "Nhật ký đánh giá",
    evaluationSummaries: "Kết quả tổng hợp",
    users: "Người dùng",
    analytics: "Phân tích",
    settings: "Cài đặt",
    system: "Hệ thống",
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
    clearDate: "Xóa ngày",
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
    optionsPlaceholder: "Tùy chọn 1\nTùy chọn 2\nTùy chọn 3",
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
    responses: "Câu trả lời",
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
