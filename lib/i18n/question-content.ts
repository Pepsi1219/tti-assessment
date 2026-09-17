import type { Category, Locale, Question } from "@/lib/types";

export const localizedCategoryNames: Record<Locale, Record<string, string>> = {
  th: {
    discipline: "วินัย",
    presentation: "ทักษะการนำเสนอ/การจัดฝึกอบรม",
    communication: "ทักษะการสื่อสาร",
    knowledge: "ความสามารถด้านความรู้",
    methods: "วิธีการและเทคนิคการสอน",
    feedback: "ทักษะการประเมินและให้ข้อเสนอแนะ",
    professionalism: "ความเป็นมืออาชีพและทัศนคติของผู้ฝึกสอน",
  },
  en: {
    discipline: "Discipline",
    presentation: "Presentation and Training Skills",
    communication: "Communication Skills",
    knowledge: "Knowledge Ability",
    methods: "Teaching Methods and Techniques",
    feedback: "Assessment and Feedback Skills",
    professionalism: "Professionalism and Trainer Attitude",
  },
  lo: {
    discipline: "ຄວາມລະບຸວຽກ",
    presentation: "ທີ່ມີທັກສະໃນການນໍາສະເຫນີ/ການຝຶກອົບຮົມ",
    communication: "ທັກສະໃນການສື່ສານ",
    knowledge: "ຄວາມສາມາດໃນດ້ານຄວາມຮູ້",
    methods: "ວິທີການແລະຂັ້ນຕອນການສອນ",
    feedback: "ທັກສະໃນການປະເມີນແລະໃຫ້ຄໍາແນະນໍາ",
    professionalism: "ຄວາມເປັນມືອາຊີບແລະທັດສະນະຂອງຜູ້ຝຶກອົບຮົມ",
  },
  vi: {
    discipline: "Kỷ luật",
    presentation: "Kỹ năng trình bày / tổ chức đào tạo",
    communication: "Kỹ năng giao tiếp",
    knowledge: "Năng lực về kiến thức",
    methods: "Phương pháp và kỹ thuật giảng dạy",
    feedback: "Kỹ năng đánh giá và phản hồi",
    professionalism: "Tính chuyên nghiệp và thái độ của người huấn luyện",
  },
};

export const localizedQuestionContent: Record<
  Locale,
  Record<string, { questionText: string; options: string[] }>
> = {
  th: {
    "q-5": {
      questionText: "การเข้างานและการตรงต่อเวลา",
      options: [
        "ไม่มีการมาสายเกินกว่าที่บริษัทกำหนด",
        "ไม่มีการขาดงานเกินกว่าที่บริษัทกำหนด",
        "ไม่มีการลาโดยไม่ได้รับอนุมัติ",
        "ไม่มีการมาสายหรือไม่มีการลา โดยไม่ได้แจ้งให้หัวหน้างานทราบล่วงหน้า อย่างน้อย 3 วัน",
        "ไม่มีการมาสายหรือมีการลา <3ครั้ง/เดือน โดยแจ้งให้ทราบล่วงหน้าและได้รับการอนุมัติพร้อมทั้งมีการวางแผนของตนเองโดยไม่กระทบต่อการฝึก",
      ],
    },
    "q-6": {
      questionText: "อธิบายวัตถุประสงค์ของการฝึกอบรมได้อย่างชัดเจน",
      options: [
        "มีการอธิบายวัตถุประสงค์",
        "มีการอธิบายประโยชน์ที่ผู้เรียนจะได้รับ",
        "มีการอธิบายวัตถุประสงค์และประโยชน์ที่ผู้เรียนจะได้รับครบถ้วนและชัดเจน",
        "การอธิบายวัตถประสงค์และประโยชน์ของผู้เรียนสอดคล้องกับหลักสูตรฝึกอบรม",
        "มีการอธิบายพร้อมยกตัวอย่างประกอบเพื่อให้ผู้เรียนเข้าใจง่ายขึ้น",
      ],
    },
    "q-7": {
      questionText: "กระตุ้นให้ผู้เข้าร่วมมีส่วนร่วมอย่างกระตือรือร้น (มีการตั้งคำถาม, ใช้ตัวอย่างประกอบ)",
      options: [
        "สอนเพียงฝ่ายเดียว ไม่ได้เปิดโอกาสให้ผู้เรียนได้มีการซักถาม",
        "ใช้คำถามปลายเปิดขณะที่สอน เพื่อตรวจสอบความเข้าใจของผู้เรียน",
        "กระตุ้นผู้เรียนให้มีส่วนร่วมในการลงมือทำ",
        "มีการอธิบายพร้อมยกตัวอย่างประกอบเพื่อให้ผู้เรียนเข้าใจง่ายขึ้น",
        "เปิดโอกาสให้ผู้เรียนพูดทวนหรืออธิบายถึงสิ่งที่เรียนพร้อมลงมือปฏิบัติเพื่อตรวจสอบความเข้าใจของผู้เรียน",
      ],
    },
    "q-8": {
      questionText: "ใช้สื่อประกอบการฝึกอบรมที่เหมาะสม (สไลด์, ภาพประกอบ, คู่มือการปฏิบัติงาน)",
      options: [
        "ผู้สอนเตรียมและใช้ สื่อช่วยสอนที่ถูกต้องครบถ้วนสำหรับทุกขั้นตอน (เช่น วิดีโอ NBP, Standard Mockup)",
        "ผู้สอนใช้สื่อช่วยสอนพื้นฐานที่จำเป็นทำนั้น (เช่น วัสดุเย็บ, เครื่องจักร)",
        "ผู้สอนใช้สื่ออ้างอิงมาตรฐาน (เช่น วิดีโอ NBP, Standard Mockup)",
        "ผู้สอนใช้สื่อช่วยสอนที่สอดคล้องกับเนื้อหาและทักษะที่ต้องการฝึก",
        "ผู้สอนมีการวางแผนการใช้สื่อ/อุปกรณ์ที่จำเป็นในการช่วยสอน พร้อมทั้งทดลองฝึกสอนก่อนการสอนจริง",
      ],
    },
    "q-9": {
      questionText: "การบริหารจัดการเวลา (ดำเนินการได้ตามกรอบเวลาที่กำหนด)",
      options: [
        "ผู้สอนสามารถสอนได้ตามกำหนดเวลา",
        "ผู้สอนถ่ายทอดเนื้อหาครบถ้วนภายใต้กรอบเวลา",
        "การสอนของผู้สอนมีประสิทธิผลตามกรอบเวลาที่ควบคุม",
        "ผู้สอนมีการกำหนดเวลาในแต่ละขั้นตอนการสอนได้อย่างเหมาะสม",
        "ผู้สอนมีกรอบเวลาของแต่ละขั้นตอนอย่างชัดเจน มีประสิทธิผล และการถ่ายทอดเนื้อหาถูกต้องครบถ้วนสมบูรณ์ภายใต้กรอบเวลาที่กำหนด",
      ],
    },
    "q-10": {
      questionText: "น้ำเสียงและการออกเสียงที่ชัดเจน",
      options: [
        "ผู้สอนใช้ระดับเสียงที่เหมาะสมกับสภาพแวดล้อมของพื้นที่ฝึกอบรม",
        "ผู้สอนมีการออกเสียงที่ชัดเจน ชัดถ้อยชัดคำ",
        "ผู้สอนมีจังหวะที่พอดีในการพูด ไม่ช้าหรือเร็วจนเกินไป",
        "ผู้สอนมีการใช้น้ำเสียง เน้นย้ำ ถึงจุดที่สำคัญเพื่อดึงดูดให้ผู้เรียนสนใจหรือตั้งใจฟัง",
        "ผู้สอนมีการใช้น้ำเสียงอย่างเป็นธรรมชาติ ลื่นไหล ไม่ประหม่า เสียงดังฟังชัดทุกถ้อยคำ เน้นย้ำจุดที่สำคัญให้ผู้เรียนได้ตระหนักจุดเสี่ยงในทุกครั้งที่สื่อสาร",
      ],
    },
    "q-11": {
      questionText: "ใช้ภาษาที่ง่ายและเข้าใจได้",
      options: [
        "ผู้สอนใช้ภาษาหรือคำศัพท์ที่เข้าใจง่ายๆตรงไปตรงมา",
        "ผู้สอนใช้การอธิบายที่กระชับ สั้นและเข้าใจง่ายเพื่ออธิบายคำศัพท์เทคนิค หรือคำเฉพาะ",
        "ผู้สอนใช้ภาษาหรือคำที่เหมาะสมกับประสบการณ์, ความรู้ ของผู้เรียน",
        "ผู้สอนมีการหลีกเลี่ยงการใช้คำศัพท์ที่กำกวมเข้าใจยากระหว่างที่สอน",
        "ผู้สอนเลือกใช้ภาษาหรือคำศัพท์ที่เข้าใจง่าย สั้น กระชับ ไม่กำกวมเหมาะสมกับประสบการณ์ของผู้เรียนในการสอน ทำให้ผู้เรียนเข้าใจและทำตามได้โดยง่าย",
      ],
    },
    "q-12": {
      questionText: "การสบตาและการมีภาษากายเชิงบวก",
      options: [
        "ผู้สอนสบตากับผู้เรียน และยืนโดยให้น้ำหนักทิ้งลงบนขาทั้งสองข้างเท่าๆกัน โดยที่ไม่มองไปที่อื่น (ยกตัวอย่างเพดานหรือพื้นห้อง) เวลาที่สอน",
        "ผู้สอนกวาดสายตามองผู้เรียนและเดินบรรยายโดยทั่วถึงทั้งห้อง เป็นระยะๆ",
        "ผู้สอนยืนตรงหน้าและสบตากับผู้เรียน (เฉพาะบุคคล) ประมาณ 3-5 นาทีต่อคน ในกรณีที่ผู้เรียนมีข้อสงสัยหรือซักถาม",
        "ผู้สอนใช้สายตาและท่าทางเพื่อเน้นย้ำ จุดที่น่าสนใจหรือจุดสำคัญ เพื่อดึงดูดความสนใจของผู้เรียน",
        "ผู้สอนสบสายตาผู้เรียนและใช้ท่าทางและสายตาเพื่อเน้นย้ำจุดสำคัญ ทำให้ผู้เรียนรู้สึกถึงความเป็นกันเอง สนใจสิ่งที่เรียน และกล้าที่จะซักถาม",
      ],
    },
    "q-13": {
      questionText: "รับมือกับคำถามด้วยความมั่นใจ",
      options: [
        "ผู้สอนมีการตอบสนองที่สงบ ตั้งใจฟังอย่างเต็มที่ก่อนตอบคำถาม ไม่ขัดจังหวะ และแสดงความเคารพและควบคุมตนเอง",
        "ผู้สอนมีทัศนคติเชิงบวก เปิดรับคำถามด้วยความเปิดกว้าง ส่งเสริมการมีส่วนร่วม",
        "ผู้สอนมีน้ำเสียงและภาษากายที่มั่นคง ไม่กระสับกระส่าย สื่อถึงความน่าเชื่อถือ",
        "ผู้สอนมีจัดการกับคำถามยากๆ ได้อย่างสง่างาม ไม่เก็บเอาความรู้สึกส่วนตัวมาใส่ใจหรือตั้งรับ สร้างความไว้วางใจแม้ในช่วงเวลาที่ยากลำบาก",
        "ผู้สอนมีการตอบสนองต่อคำถามที่สงบ ตั้งใจฟัง ตอบคำถามด้วยทัศนคติเชิงบวก แม้เจอคำถามยากๆยังสามารถควบคุมอารมณ์ได้ดี มีความน่าเชื่อถือ",
      ],
    },
    "q-14": {
      questionText: "แสดงให้เห็นถึงความรู้ที่ในเนื้อหาด้านการปฏิบัติงาน/ด้านเทคนิค",
      options: [
        "ผู้สอนแสดงความมั่นใจและมีความเข้าใจเนื้อหาอย่างลึกซึ้ง สามารถอธิบายรายละเอียดได้อย่างชัดเจนและถูกต้อง",
        "ผู้สอนเข้าใจความเชื่อมโยงระหว่างกระบวนการ รู้ว่าหัวข้อที่สอนเชื่อมโยงกับหน้าที่หรือหน่วยงานอื่นอย่างไร ส่งเสริมการคิดแบบเป็นระบบและประสิทธิภาพ",
        "เอกสารที่นำมาสอนมีการอัพเดตข้อมูลอย่างสม่ำเสมอ",
        "เนื้อหาการสอนสอดคล้องกับแนวปฏิบัติและนโยบายของบริษัท",
        "ผู้สอนแสดงความเชี่ยวชาญในเนื้อหาเมื่ออธิบายขั้นตอน เครื่องมือ และระบบต่าง ๆ อย่างถูกต้องและสอดคล้องกับมาตรฐานองค์กร",
      ],
    },
    "q-15": {
      questionText: "ให้ตัวอย่างที่ถูกต้องและเกี่ยวข้องกับบริบทการทำงาน",
      options: [
        "ผู้สอนใช้ตัวอย่างอ้างอิงตามระเบียบปฏิบัติจริงขององค์กร ไม่ใช่การสมมติสถานการณ์ที่ขัดกับนโยบายหรือขั้นตอนการทำงานที่เป็นทางการ",
        "ผู้สอนใช้ตัวอย่างอ้างอิงสนับสนุนเนื้อหาหลักที่กำลังสอนโดยตรง ช่วยให้ผู้เรียนเห็นความเชื่อมโยงได้ชัดเจน ไม่ใช่ตัวอย่างที่ไม่เกี่ยวข้องหรือออกนอกเรื่อง",
        "ผู้สอนเลือกใช้กรณีศึกษาที่ผู้เรียนสามารถพบเจอในงานประจำวันจริงๆ ซึ่งจะทำให้พวกเขาเห็นประโยชน์และวิธีการนำความรู้ไปใช้ได้ทันทีหลังการฝึกอบรม",
        "ตัวอย่างต้องทำหน้าที่ ทำให้ง่ายขึ้น และ เห็นภาพมากขึ้น สำหรับเนื้อหาที่ซับซ้อน ไม่ใช่เพิ่มความสับสนให้กับผู้เรียน",
        "ผู้สอนดึงประสบการณ์จริงมาใช้เป็นตัวอย่าง ซึ่งมีรายละเอียดที่สมจริงและน่าเชื่อถือ เพื่อสร้างความน่าเชื่อถือและแสดงให้เห็นการนำไปใช้ได้จริงอย่างชัดเจน",
      ],
    },
    "q-16": {
      questionText: "ประยุกต์ใช้หลักการเรียนรู้ของผู้ใหญ่ (มีการโต้ตอบ, เน้นผู้เรียนเป็นศูนย์กลาง)",
      options: [
        "ผู้สอนเชื่อมโยงเนื้อหาและวิธีการกับปัญหาจริงในการทำงาน",
        "ผู้สอน สร้างพื้นที่ให้ผู้เรียนแชร์ประสบการณ์และสะท้อนความคิด",
        "ผู้สอนออกแบบกิจกรรมที่ต้องมีส่วนร่วม ไม่ใช่เพียงฟังอย่างเดียว",
        "ผู้สอน เน้น การนำไปใช้ได้ทันที มากกว่า การรู้ทฤษฎี",
        "ผู้สอนปรับกิจกรรมให้เหมาะกับจุดอ่อนเฉพาะบุคคล เพื่อเร่งการเรียนรู้",
      ],
    },
    "q-17": {
      questionText: "ใช้การแสดงบทบาทสมมติ/การจำลองสถานการณ์ได้อย่างมีประสิทธิภาพ",
      options: [
        "ผู้สอนใช้คำถามปลายเปิด คำถามเจาะลึก และคำถามที่กระตุ้นให้สะท้อนคิด",
        "ผู้สอนจัดการการมีส่วนร่วมให้เกิดอย่างสมดุล — ป้องกันไม่ให้มีเพียงบางคนแสดงความเห็นและส่งเสริมให้ผู้ที่เงียบได้มีโอกาสพูด",
        "ผู้สอนส่งเสริมและเสริมแรงการมีส่วนร่วมด้วยการให้ข้อเสนอแนะในเชิงบวก",
        "ผู้สอนเปลี่ยนผ่านระหว่างกิจกรรมต่าง ๆ อย่างราบรื่น โดยไม่ทำให้ผู้เรียนสับสน",
        "ผู้สอนบูรณาการสื่อ (เช่น สไลด์ วิดีโอ แผนภูมิ) ที่สนับสนุนข้อความสำคัญโดยตรง ลงในการอธิบาย — ไม่ใช่การอ่านข้อความจากสไลด์",
      ],
    },
    "q-18": {
      questionText: "ปรับวิธีการให้เข้ากับรูปแบบการเรียนรู้ที่แตกต่างกัน",
      options: [
        "ผู้สอนสังเกตพฤติกรรมและทำความเข้าใจผู้เรียนแต่ละคนตั้งแต่เริ่มต้น เพื่อประเมินพื้นฐานและสไตล์การเรียนรู้ที่แตกต่างกัน",
        "ผู้สอนสามารถเปลี่ยนเทคนิคการสอนได้ในทันทีเมื่อพบว่าผู้เรียนมีปัญหากับวิธีการเดิม เช่น จากบรรยายเป็นใช้ภาพ หรือเปลี่ยนเป็นตัวอย่างที่ง่ายขึ้น",
        "เมื่อปรับวิธีการครูฝึกทำให้มั่นใจว่ากิจกรรมหรือเนื้อหานั้นยังนำไปสู่การบรรลุ จุดประสงค์การเรียนรู้ ที่ตั้งไว้อย่างชัดเจน",
        "ผู้สอนมีการวางแผนและเตรียมตัวอย่างและแนวทางการสอนที่หลากหลายไว้ล่วงหน้า",
        "ผู้สอนวิเคราะห์สาเหตุของความแตกต่างในการเข้าใจ และสรุปเป็น แนวทางปฏิบัติที่ดีที่สุดให้เหมาะสมกับแต่ละผู้เรียน",
      ],
    },
    "q-19": {
      questionText: "ให้ข้อเสนอแนะเชิงสร้างสรรค์แก่ผู้เข้าร่วม",
      options: [
        "ให้ข้อเสนอแนะเป็นการส่วนตัว ไม่เปิดเผยผลการปฏิบัติงานของผู้อื่นโดยรักษาความลับของข้อมูลแต่ละบุคคล",
        "ให้ข้อเสนอแนะโดยมุ่งเน้นไปที่งานและพฤติกรรมที่สังเกตเห็นได้ (อ้างอิงตามหลักฐาน)",
        "ให้ข้อเสนอแนะโดยเริ่มต้นจากสิ่งที่ทำได้ดีก่อน และตามด้วยสิ่งที่สามารถปรับปรุงให้ดีขึ้นได้",
        "ให้ข้อเสนอแนะโดยบอกแนวทางการแก้ไขปรับปรุงได้ชัดเจน แสดงให้ผู้เรียนมองเห็นถึงผลลัพท์ที่ดีหากมีการปรับปรุง",
        "ผู้สอนสร้างบรรยากาศเชิงบวกที่ส่งเสริมให้ผู้เรียนร่วมให้ข้อเสนอแนะ และรักษาความเป็นมืออาชีพแม้เมื่อต้องให้ข้อเสนอแนะที่ยาก",
      ],
    },
    "q-20": {
      questionText: "ประสิทธิผลของการให้ข้อเสนอแนะ",
      options: [
        "ข้อเสนอแนะช่วยให้ผู้เรียนเข้าใจและสามารถปฏิบัติตามคำแนะนำได้ทันที",
        "ข้อเสนอแนะช่วยให้ผู้เรียนไม่ทำผิดพลาดทางเทคนิคเดิมซ้ำภายในช่วงการฝึกเดียวกัน",
        "ข้อเสนอแนะช่วยให้ผู้เรียนสามารถแก้ไขข้อผิดพลาดได้ด้วยตนเองก่อนที่ข้อผิดพลาดจะเกิดขึ้น",
        "ข้อเสนอแนะช่วยให้ผู้เรียนสามารถรักษามาตรฐานคุณภาพได้",
        "ข้อเสนอแนะช่วยให้ผู้เรียนสามารถรักษาเวลาได้ตามมาตรฐานและแสดงแนวโน้มเชิงบวกในการบรรลุเป้าหมายประสิทธิภาพ",
      ],
    },
    "q-21": {
      questionText: "สนับสนุนให้มีการทบทวนและประเมินตนเอง",
      options: [
        "ผู้สอนส่งเสริมให้ผู้เรียนกลับไปทบทวนบทเรียนด้วยตัวเองหลังการฝึกอบรม",
        "ผู้สอนตั้งคำถามที่กระตุ้นให้ผู้เรียนคิดทบทวนสิ่งที่ได้เรียนรู้",
        "ผู้สอนใช้คำถามนำให้ผู้เรียนสามารถค้นพบจุดที่ต้องปรับปรุงและวางแผนแก้ไขได้ด้วยตัวเอง",
        "ผู้สอนมีการสรุปและชี้จุดที่สำคัญ พร้อมอธิบายผลลัพท์ที่จะเกิดขึ้นหากทำการปรับปรุงและแก้ไขข้อผิดพลาด",
        "ผู้สอนสร้างบรรยากาศเชิงบวกสำหรับการคิดทบทวน เช่น ผ่านกิจกรรมการทบทวนกลุ่ม",
      ],
    },
    "q-22": {
      questionText: "แสดงออกถึงความมั่นใจและความกระตือรือร้น",
      options: [
        "ระหว่างการอธิบายผู้สอนมีเสียงดังฟังชัด",
        "ผู้สอนใช้ระดับเสียง สูง ต่ำ พร้อมทั้งภาษากายเพิ่มความน่าสนใจ หรือเน้นจุดสำคัญระหว่างการสอน",
        "ผู้สอนไม่แสดงความตื่นตกใจระหว่างการสอน แม้ว่าจะได้รับคำถามที่ยาก",
        "ผู้สอนมีการอ่านคู่มือ และเตรียมตัวก่อนการสอนทุกครั้ง",
        "ผู้สอนอธิบายความสำคัญของการเรียนการสอนได้ เพื่อสร้างแรงจูงใจในการเรียนให้กับผู้เรียนได้",
      ],
    },
    "q-23": {
      questionText: "แสดงความเคารพและความอดทนต่อผู้เรียน",
      options: [
        "ผู้สอนใช้คำพูดสุภาพ และมีความใส่ใจกับผู้เรียน",
        "ผู้สอนไม่แสดงอาการหงุดหงิดหรือฉุนเฉียวเมื่อเจอผู้เรียนที่เรียนรู้ได้ช้า หรือทำผิดพลาดบ่อยครั้ง",
        "ผู้สอนสามารถอธิบายซ้ำหลายๆครั้งพร้อมแสดงตัวอย่าง เพิ่มระหว่างการอธิบาย",
        "ผู้สอนปรับเปลี่ยนวิธีการอธิบายให้สอดคล้องกับผู้เรียน",
        "ผู้สอนใช้ภาษากายเชิงบวก พูดให้กำลังใจกับผู้เรียน กล่าวชื่นชมเมื่อสามารถทำได้สำเร็จ ค้นหาวิธีการสอนแบบใหม่",
      ],
    },
    "q-24": {
      questionText: "เปิดรับข้อเสนอแนะและการพัฒนาอย่างต่อเนื่อง",
      options: [
        "ผู้สอนรับฟังความคิดเห็นและข้อเสนอแนะของผู้อื่น",
        "ผู้สอนไม่พูดแทรกระหว่างการให้ข้อเสนอแนะ",
        "ผู้สอนนำเอาความคิดเห็นและข้อเสนอแนะไปปรับปรุงตนเองและการสอน",
        "ผู้สอนตรวจสอบวิธีการสอนของตนเอง และปรับปรุงอยู่เสมอ",
        "ผู้สอนใช้ข้อมูลการฝึกของผู้เรียนนำมาวิเคราะห์เพื่อปรับปรุงเทคนิคการสอน",
      ],
    },
  },
  en: {
    "q-5": {
      questionText: "Attendance and punctuality",
      options: [
        "No lateness beyond the company standard",
        "No absences beyond the company standard",
        "No unauthorized leave",
        "No lateness or absence without notifying the supervisor at least 3 days in advance",
        "No lateness or leave for less than 3 times per month, with advance notice, approval, and proper planning without affecting training",
      ],
    },
    "q-6": {
      questionText: "Clearly explains the purpose of the training",
      options: [
        "Explains the objective",
        "Explains the benefits the learner will gain",
        "Clearly explains both the objective and the learner benefits",
        "The explanation aligns with the training curriculum",
        "Explains with examples to make it easy for learners to understand",
      ],
    },
    "q-7": {
      questionText: "Encourages active participation (questions, examples)",
      options: [
        "Teaches one-way without allowing learners to ask questions",
        "Uses open-ended questions to check learner understanding",
        "Encourages learners to participate in practice",
        "Explains with examples to make it easy to understand",
        "Gives learners a chance to repeat or explain what they learned and practice to confirm understanding",
      ],
    },
    "q-8": {
      questionText: "Uses appropriate training media (slides, illustrations, work instructions)",
      options: [
        "Prepares and uses complete teaching media for each step (e.g., NBP video, standard mockup)",
        "Uses the necessary basic media (e.g., sewing materials, machinery)",
        "Uses standard reference media (e.g., NBP video, standard mockup)",
        "Uses media consistent with the content and skills being trained",
        "Plans the use of media and equipment in advance and conducts a practice session before actual delivery",
      ],
    },
    "q-9": {
      questionText: "Time management within the planned schedule",
      options: [
        "Delivers training on time",
        "Communicates the content completely within the time frame",
        "Training is effective within the controlled time plan",
        "Allocates time appropriately for each stage",
        "Clearly defines each stage and delivers the complete content effectively within the target time",
      ],
    },
    "q-10": {
      questionText: "Clear voice and pronunciation",
      options: [
        "Uses an appropriate voice level for the training environment",
        "Speaks clearly and distinctly",
        "Uses a suitable pace, not too slow or too fast",
        "Emphasizes important points to gain learner attention",
        "Uses natural, smooth, confident vocal delivery with clear emphasis on key risks and messages",
      ],
    },
    "q-11": {
      questionText: "Uses simple and understandable language",
      options: [
        "Uses simple and direct language",
        "Uses concise explanations to explain technical terms",
        "Uses language suitable for the learners’ knowledge and experience",
        "Avoids vague or confusing technical terminology",
        "Uses simple, clear, and appropriate language that learners can follow easily",
      ],
    },
    "q-12": {
      questionText: "Eye contact and positive body language",
      options: [
        "Makes eye contact and stands with balanced posture without looking away",
        "Scans the room and moves around to reach all learners",
        "Faces learners and maintains eye contact for 3–5 minutes when answering questions",
        "Uses eye contact and gestures to highlight key points",
        "Uses eye contact and body language to make learners feel comfortable and confident to ask questions",
      ],
    },
    "q-13": {
      questionText: "Handles questions confidently",
      options: [
        "Responds calmly, listens fully, and respects the learner before answering",
        "Maintains a positive attitude and welcomes questions",
        "Uses a steady voice and confident body language",
        "Handles difficult questions gracefully without being affected emotionally",
        "Responds calmly, listens attentively, and answers positively even under pressure",
      ],
    },
    "q-14": {
      questionText: "Demonstrates solid practical and technical knowledge",
      options: [
        "Shows confidence and deep understanding of the content",
        "Understands how each process connects to related functions and teams",
        "Updates training documents consistently",
        "Aligns content with workplace policies and standards",
        "Explains procedures, tools, and systems accurately and consistently with organizational standards",
      ],
    },
    "q-15": {
      questionText: "Uses accurate examples relevant to the work context",
      options: [
        "Uses examples aligned with the organization’s actual procedures and policies",
        "Uses examples directly supporting the topic being taught",
        "Uses realistic case studies learners can relate to in daily work",
        "Uses examples that simplify complex content instead of adding confusion",
        "Uses authentic work experience examples that build credibility and practical relevance",
      ],
    },
    "q-16": {
      questionText: "Applies adult learning principles (interaction, learner-centered approach)",
      options: [
        "Connects content to real work problems",
        "Creates space for learners to share experiences and reflections",
        "Designs activities requiring active participation",
        "Focuses on immediate practical application rather than theory alone",
        "Adjusts activities to each learner’s needs to accelerate learning",
      ],
    },
    "q-17": {
      questionText: "Uses role-play or simulation effectively",
      options: [
        "Uses open-ended and probing questions to prompt reflection",
        "Balances participation to avoid only a few people speaking",
        "Encourages participation with constructive feedback",
        "Moves smoothly between activities without confusing learners",
        "Integrates media such as slides, videos, and diagrams to reinforce the key message",
      ],
    },
    "q-18": {
      questionText: "Adjusts the teaching approach to different learning styles",
      options: [
        "Observes and understands each learner’s starting point and learning style",
        "Changes teaching techniques quickly when a method is not effective",
        "Ensures the adjusted activity still meets the learning objective",
        "Plans multiple examples and teaching approaches in advance",
        "Analyzes causes of misunderstanding and identifies the best approach for each learner",
      ],
    },
    "q-19": {
      questionText: "Provides constructive feedback to participants",
      options: [
        "Provides private feedback without exposing others’ information",
        "Focuses on observable work and behaviors with evidence",
        "Starts with strengths before addressing improvements",
        "Offers clear corrective guidance and shows the expected outcome",
        "Builds a positive environment that invites feedback while maintaining professionalism",
      ],
    },
    "q-20": {
      questionText: "Effectiveness of the feedback given",
      options: [
        "Helps learners understand and act on the guidance immediately",
        "Helps prevent repeated technical mistakes during the same training period",
        "Allows learners to correct errors independently before they escalate",
        "Helps maintain quality standards",
        "Helps learners stay on schedule and shows positive progress toward performance goals",
      ],
    },
    "q-21": {
      questionText: "Encourages reflection and self-assessment",
      options: [
        "Encourages learners to review the lesson independently after training",
        "Uses questions that stimulate reflection on what has been learned",
        "Uses guided questions so learners can identify improvement areas and plan actions",
        "Summarizes key points and explains the results of corrective actions",
        "Creates a positive atmosphere for reflection, such as through group review activities",
      ],
    },
    "q-22": {
      questionText: "Shows confidence and enthusiasm",
      options: [
        "Speaks clearly and audibly during explanations",
        "Uses voice variation and gestures to add interest and emphasize key points",
        "Does not show panic when faced with difficult questions",
        "Reads the material and prepares before every training session",
        "Explains the value of learning to motivate learners",
      ],
    },
    "q-23": {
      questionText: "Shows respect and patience toward learners",
      options: [
        "Uses polite language and shows attention to learners",
        "Does not show irritation when learners learn slowly or make mistakes repeatedly",
        "Explains the same point repeatedly with examples as needed",
        "Adjusts explanation methods to fit the learner",
        "Uses positive body language, encouragement, and praise to motivate learners",
      ],
    },
    "q-24": {
      questionText: "Welcomes feedback and continuous improvement",
      options: [
        "Listens to opinions and feedback from others",
        "Does not interrupt while giving feedback",
        "Uses feedback to improve personal performance and teaching methods",
        "Regularly checks and improves their own teaching methods",
        "Uses learner feedback to refine training techniques",
      ],
    },
  },
  lo: {
    "q-5": {
      questionText: "ການເຂົ້າຮ່ວມແລະການມາຖືກເວລາ",
      options: [
        "ບໍ່ມີການມາຊ້າຫຼາຍກວ່າມາດຕະຖານຂອງບໍລິສັດ",
        "ບໍ່ມີການຂາດການເຮັດວຽກຫຼາຍກວ່າມາດຕະຖານ",
        "ບໍ່ມີການອອກທີ່ບໍ່ໄດ້ຮັບການອະນຸຍາດ",
        "ບໍ່ມີການມາຊ້າຫຼືອອກໂດຍບໍ່ໄດ້ແຈ້ງເຕືອນຫົວໜ້າວຽກມາກ່ອນເປັນເວລາ 3 ມື້",
        "ບໍ່ມີການມາຊ້າຫຼືອອກນ້ອຍກວ່າ 3 ຄັ້ງ/ເດືອນ ໂດຍແຈ້ງເຕືອນກ່ອນໄວ ແລະມີການອະນຸຍາດຢ່າງຖືກຕ້ອງ",
      ],
    },
    "q-6": {
      questionText: "ອະທິບາຍຈຸດປະສົງຂອງການຝຶກອົບຮົມໃຫ້ຊັດເຈນ",
      options: [
        "ໄດ້ອະທິບາຍຈຸດປະສົງ",
        "ໄດ້ອະທິບາຍຜົນປະໂຫຍດທີ່ນັກຮຽນຈະໄດ້ຮັບ",
        "ໄດ້ອະທິບາຍຈຸດປະສົງແລະຜົນປະໂຫຍດຢ່າງສົມບູນແລະເຂັ້ມເຈັດ",
        "ການອະທິບາຍສອດຄ່ອງກັບຫຼັກສູດການຝຶກອົບຮົມ",
        "ໄດ້ອະທິບາຍພ້ອມກັບຕົວຢ່າງເພື່ອເຮັດໃຫ້ນັກຮຽນເຂົ້າໃຈງ່າຍ",
      ],
    },
    "q-7": {
      questionText: "ກະຕຸ້ນໃຫ້ນັກຮຽນມີສ່ວນຮ່ວມຢ່າງເຂັ້ມເຫັນ",
      options: [
        "ສອນເປັນທິດດ່ຽວບໍ່ເປີດໃຫ້ນັກຮຽນຖາມຄໍາຖາມ",
        "ໃຊ້ຄໍາຖາມທີ່ເປີດເພື່ອກວດຄວາມເຂົ້າໃຈ",
        "ກະຕຸ້ນນັກຮຽນໃຫ້ມີສ່ວນຮ່ວມໃນການປະຕິບັດ",
        "ອະທິບາຍພ້ອມຕົວຢ່າງເພື່ອເຮັດໃຫ້ເຂົ້າໃຈງ່າຍ",
        "ເປີດໃຫ້ນັກຮຽນສາມາດຈື່ລົງຫຼືອະທິບາຍສິ່ງທີ່ໄດ້ຮຽນແລະປະຕິບັດເພື່ອກວດຄວາມເຂົ້າໃຈ",
      ],
    },
    "q-8": {
      questionText: "ໃຊ້ສື່ອຸປະກອນການຝຶກອົບຮົມທີ່ເຫມາະສົມ",
      options: [
        "ກຽມພ້ອມແລະໃຊ້ສື່ສະໜັບສະໜູນທີ່ຄົບຖ້ວນສໍາລັບທຸກເງື່ອນໄຂ",
        "ໃຊ້ສື່ສະໜັບສະໜູນພື້ນຖານທີ່ຈຳເປັນ",
        "ໃຊ້ສື່ອ້າງອີງມາດຕະຖານ",
        "ໃຊ້ສື່ສະໜັບສະໜຸນເຫມາະກັບເນື້ອໃນຂໍ້ມູນທີ່ຕ້ອງຝຶກອົບຮົມ",
        "ວາງແຜນການໃຊ້ສື່/ອຸປະກອນໃຫ້ເຫມາະສົມແລະແລ່ນການຝຶກອົບຮົມກ່ອນທີ່ຈະສອນຕົວຈິງ",
      ],
    },
    "q-9": {
      questionText: "ການຈັດການເວລາຢູ່ໃນกรอบເວລາທີ່ກຳນົດ",
      options: [
        "ສອນຕາມເວລາທີ່ກຳນົດ",
        "ເຊື່ອມຕໍ່ເນື້ອໃນໄດ້ຢ່າງຄົບຖ້ວນພາຍໃຕ້ເວລາ",
        "ການສອນມີປະສິດທິພາບພາຍໃຕ້ແຜນການເວລາ",
        "ມີການກຳນົດເວລາໃຫ້ເຫມາະສົມສໍາລັບທຸກເຮັດວຽກ",
        "ກຳນົດເວລາໄດ້ຢ່າງຊັດເຈນ ແລະສອນເຕັມເນື້ອໃນกรอบເວລາ",
      ],
    },
    "q-10": {
      questionText: "ສຽງແລະການອອກສຽງທີ່ຊັດເຈນ",
      options: [
        "ໃຊ້ລະດັບສຽງທີ່ເຫມາະສົມຕໍ່ສະພາບແວດລ້ອມ",
        "ເວົ້າຊັດເຈນແລະຈະເປັນບຸກຄົນ",
        "ມີອັດຕາການເວົ້າທີ່ດີ ແມ່ນບໍ່ແມ່ນຊ້າເກີນຫຼືໄວເກີນ",
        "ເນັ້ນຫຼາຍກ່ອນໄວ້ໃນຈຸດສໍາຄັນ",
        "ໃຊ້ສຽງທີ່ມີຄວາມທີ່ເຂົ້າໃຈງ່າຍ ເວົ້າຊັດເຈນຢູ່ທົ່ວເວລາ",
      ],
    },
    "q-11": {
      questionText: "ໃຊ້ພາສາງ່າຍທີ່ເຂົ້າໃຈໄດ້",
      options: [
        "ໃຊ້ພາສາງ່າຍແລະຊັດເຈນ",
        "ໃຊ້ການອະທິບາຍສັ້ນແລະເຂົ້າໃຈງ່າຍ",
        "ໃຊ້ພາສາທີ່ເຫມາະກັບຄວາມຮູ້ຂອງນັກຮຽນ",
        "ຫຼີກເວັ້ນຄໍາທີ່ບໍ່ເຂົ້າໃຈໄດ້",
        "ໃຊ້ພາສາທີ່ງ່າຍ ແລະເຫມາະກັບປະສົບການຂອງນັກຮຽນ",
      ],
    },
    "q-12": {
      questionText: "ການເບິ່ງເຫັນແລະພາສາຍ່າງຂອງຮ່າງກາຍ",
      options: [
        "ເບິ່ງເຫັນນັກຮຽນແລະຢືນຢູ່ຢ່າງຖືກຕ້ອງ",
        "ກວດເບິ່ງເຫັນທົ່ວຫ້ອງເວລາສອນ",
        "ຢືນເອົາເບິ່ງທົ່ວໄປແລະທີ່ຈະຕອບຄໍາຖາມ",
        "ໃຊ້ການເບິ່ງເຫັນແລະອົກລໍາດັບເນັ້ນຈຸດສໍາຄັນ",
        "ໃຊ້ການເບິ່ງທີ່ເປັນບຸກຄົນແລະພາສາລໍາດັບເພື່ອຊຸກຍູ້ຜູ້ຮຽນ",
      ],
    },
    "q-13": {
      questionText: "ຈັດການຄໍາຖາມເປັນທາງການ",
      options: [
        "ຕອບຄໍາຖາມເປັນທາງການ ໄດ້ຟັງຢ່າງລະອຽດກ່ອນ",
        "ມີທັດສະນະບວກ ແລະຍອມຮັບຄໍາຖາມ",
        "ໃຊ້ສຽງແລະພາສາກາຍທີ່ເປັນເງື່ອນໄຂ",
        "ຈັດການຄໍາຖາມທີ່ຍາກໄດ້ເປັນທີ່ດີ",
        "ຕອບຄໍາຖາມໄດ້ຢ່າງສະອາດ ແລະຍັງຄົງຄຸ້ມຄອງອາການໄດ້ດີ",
      ],
    },
    "q-14": {
      questionText: "ສະແດງໃຫ້ເຫັນຄວາມຮູ້ໃນເນື້ອໃນການປະຕິບັດງານ/ດ້ານເຕັກນິກ",
      options: [
        "ສະແດງຄວາມມີຄວາມເຂົ້າໃຈໃນເນື້ອໃນຢ່າງເລິກ",
        "ເຂົ້າໃຈການເຊື່ອມຕໍ່ເວດລ້ອມຂອງຂັ້ນຕອນ",
        "ເອກະສານທີ່ໃຊ້ສອນປັບປຸງຂໍ້ມູນເປັນປົກກະຕິ",
        "ເນື້ອໃນການສອນສອດຄ່ອງກັບນະໂຍບາຍຂອງບໍລິສັດ",
        "ສະແດງຄວາມຊ່ຽວຊານໃນການອະທິບາຍຂັ້ນຕອນແລະລະບົບທີ່ຖືກຕ້ອງ",
      ],
    },
    "q-15": {
      questionText: "ສະແດງຕົວຢ່າງທີ່ຖືກຕ້ອງແລະກ່ຽວຂ້ອງກັບສະພາບການເຮັດວຽກ",
      options: [
        "ໃຊ້ຕົວຢ່າງທີ່ສອດຄ່ອງກັບກົດລະບຽບຂອງອົງການ",
        "ໃຊ້ຕົວຢ່າງທີ່ສະໜັບສະໜູນເນື້ອໃນຫຼັກທີ່ກຳລັງສອນ",
        "ເລືອກໃຊ້ກໍລະນີທີ່ນັກຮຽນສາມາດພົບເຫັນໃນວຽກປະຈໍາວັນ",
        "ຕົວຢ່າງຕ້ອງຊ່ວຍສະຫນອງການເຂົ້າໃຈແທນທີ່ຈະເຮັດເພີ່ມຄວາມສັບສົນ",
        "ໃຊ້ປະຫວັດການເຮັດວຽກທີ່ແທ້ຈິງເພື່ອສ້າງຄວາມເຊື່ອຖື",
      ],
    },
    "q-16": {
      questionText: "ນໍາໃຊ້ຫຼັກການຮຽນຮູ້ຂອງຜູ້ໃຫຍ່",
      options: [
        "ເຊື່ອມຕໍ່ເນື້ອໃນກັບບັນຫາທີ່ເຮັດວຽກຈິງ",
        "ສ້າງພື້ນທີ່ໃຫ້ນັກຮຽນແບ່ງປະເດືອນ",
        "ອອກແບບກິດຈະກໍາທີ່ຕ້ອງມີສ່ວນຮ່ວມ",
        "ເນັ້ນຢຸດການນໍາໃຊ້ທີ່ເອົາທິດສະດີເປັນຫຼັກ",
        "ປັບກິດຈະກໍາໃຫ້ເຫມາະກັບຄວາມຕ້ອງການຂອງທຸກຄົນ",
      ],
    },
    "q-17": {
      questionText: "ໃຊ້ການຈັດການບົດບາດສະແກນ/ຈັດການສະຖານະການ",
      options: [
        "ໃຊ້ຄໍາຖາມເປີດແລະເປັນການສອບຄວາມເຂົ້າໃຈ",
        "ຈັດການສ່ວນຮ່ວມໃຫ້ມີຄວາມສົມດຸນ",
        "ຈັດການເພື່ອເປີດໃຫ້ມີສ່ວນຮ່ວມຫຼາຍຂຶ້ນ",
        "ປ່ຽນລະຫວ່າງກິດຈະກໍາໄດ້ຢ່າງລຽບງ່າຍ",
        "ລວມເອົາສື່ເຂົ້າກັນເພື່ອສະໜັບສະໜູນຂໍ້ຄວາມສໍາຄັນ",
      ],
    },
    "q-18": {
      questionText: "ປັບວິທີການໃຫ້ເຂົ້າກັບຮູບແບບການຮຽນຮູ້ທີ່ແຕກຕ່າງກັນ",
      options: [
        "ສັງເກດເບິ່ງແລະເຂົ້າໃຈທຸກຄົນເລີ່ມຕົ້ນ",
        "ປັບວິທີການສອນໄດ້ຢ່າງກ່ອນອັນທີ່ເຫັນການບໍ່ເຮັດວຽກ",
        "ຮັບປະກັນວ່າກິດຈະກໍາຍັງບັນລຸເປົ້າຫມາຍການຮຽນຮູ້",
        "ວາງແຜນຕົວຢ່າງແລະວິທີການສອນຫຼາຍປະເພດ",
        "ວິເຄາະເຫດຜົນຂອງຄວາມຄິດແບບແຕກຕ່າງ",
      ],
    },
    "q-19": {
      questionText: "ໃຫ້ຄໍາແນະນໍາແບບມີຄວາມສ້າງສັນແລະກ້ຽວຂ້ອງ",
      options: [
        "ໃຫ້ຄໍາແນະນໍາເປັນການເປັນສ່ວນຕົວ",
        "ເນັ້ນໃສ່ວຽກແລະພຶດຕິກຳທີ່ເຫັນເຖິງ",
        "ເລີ່ມຕົ້ນຈາກສິ່ງທີ່ເຮັດໄດ້ດີກ່ອນ",
        "ໃຫ້ຄໍາແນະນໍາຢ່າງຊັດເຈນແລະສະແດງຜົນທີ່ຄາດຫວັງ",
        "ສ້າງສະພາບອາກາດທີ່ເປັນບວກສໍາລັບການປະເມີນ",
      ],
    },
    "q-20": {
      questionText: "ປະສິດທິພາບຂອງການໃຫ້ຄໍາແນະນໍາ",
      options: [
        "ຊ່ວຍໃຫ້ນັກຮຽນເຂົ້າໃຈຄໍາແນະນໍາແລະເຮັດຕາມໄດ້ທັນທີ",
        "ຊ່ວຍປ້ອງກັນຄວາມຜິດພາດທີ່ເກີດຊ້ຳໃນລະຫວ່າງການຝຶກອົບຮົມ",
        "ເຮັດໃຫ້ນັກຮຽນແກ້ໄຂຂໍ້ຜິດພາດໄດ້ໂດຍຕົນເອງ",
        "ຊ່ວຍຮັກສາມາດຕະການຄຸນນະພາບ",
        "ຊ່ວຍບັນຈຸເວລາແລະສະແດງຄວາມຄືບໜ້າ",
      ],
    },
    "q-21": {
      questionText: "ສະໜັບສະໜູນການທົບທວນຄືນແລະການປະເມີນຕົນເອງ",
      options: [
        "ກະຕຸ້ນໃຫ້ນັກຮຽນທົບທວນຄືນຫຼັງຈາກຝຶກອົບຮົມ",
        "ໃຊ້ຄໍາຖາມເພື່ອກະຕຸ້ນໃຫ້ສະຫຼຸບສິ່ງທີ່ໄດ້ຮຽນ",
        "ໃຊ້ຄໍາຖາມເພື່ອເຮັດໃຫ້ນັກຮຽນຄົ້ນພົບຂອງແມ່ນຂອງເຮັດຂອງເຂົາ",
        "ສະຫຼຸບຈຸດສໍາຄັນແລະອະທິບາຍຜົນທີ່ຈະເກີດຂຶ້ນ",
        "ສ້າງສະພາບອາກາດທີ່ດີສໍາລັບການທົບທວນຄືນ",
      ],
    },
    "q-22": {
      questionText: "ສະແດງຄວາມເຊື່ອຖືແລະຄວາມຕ້ອງການ",
      options: [
        "ໃນລະຫວ່າງການອະທິບາຍມີສຽງທີ່ຊັດເຈນ",
        "ໃຊ້ລະດັບສຽງແລະພາສາກາຍເພື່ອເພີ່ມຄວາມສົນໃຈ",
        "ບໍ່ສະແດງຄວາມຢຸດເວລາໃນຂະນະສອນ",
        "ອ່ານເອກະສານແລະກຽມພ້ອມກ່ອນສອນທຸກຄັ້ງ",
        "ອະທິບາຍຄວາມສໍາຄັນຂອງການຮຽນເພື່ອຊຸກຍູ້ນັກຮຽນ",
      ],
    },
    "q-23": {
      questionText: "ສະແດງຄວາມเคารพຕໍ່ນັກຮຽນ",
      options: [
        "ໃຊ້ຄໍາຊຸກຍູ້ເປັນທາງການ",
        "ບໍ່ເປັນປະຕິກັນຖ້ານັກຮຽນເຂົ້າໃຈຊ້າ",
        "ອະທິບາຍຊ້າເທື່ອຫຼາຍໂດຍມີຕົວຢ່າງ",
        "ປັບວິທີການອະທິບາຍໃຫ້ເຫມາະກັບນັກຮຽນ",
        "ໃຊ້ພາສາກາຍບວກເພື່ອປະກອບໃຈຜູ້ຮຽນ",
      ],
    },
    "q-24": {
      questionText: "ຍອມຮັບຄໍາແນະນໍາແລະການພັດທະນາຢ່າງຕໍ່ເນື່ອງ",
      options: [
        "ຟັງຄວາມຄິດເຫັນແລະຄໍາແນະນໍາຂອງຄົນອື່ນ",
        "ບໍ່ແຊກຂີ້ຄໍາໃນຂະນະສອນ",
        "ໃຊ້ຄໍາແນະນໍາເພື່ອປັບປຸງຕົວເອງ",
        "ກວດສອບແລະປັບປຸງວິທີການສອນ",
        "ໃຊ້ຄໍາແນະນໍາຂອງນັກຮຽນເພື່ອປັບປຸງວິທີການສອນ",
      ],
    },
  },
  vi: {
    "q-5": {
      questionText: "Chuyên cần và đúng giờ",
      options: [
        "Không đi muộn vượt quá tiêu chuẩn của công ty",
        "Không vắng mặt vượt quá tiêu chuẩn của công ty",
        "Không nghỉ không phép",
        "Không đi muộn hoặc vắng mặt mà không báo trước ít nhất 3 ngày cho quản lý",
        "Không đi muộn hoặc nghỉ quá 3 lần/tháng, có báo trước, được phê duyệt và có kế hoạch phù hợp không ảnh hưởng đến chương trình đào tạo",
      ],
    },
    "q-6": {
      questionText: "Giải thích rõ mục tiêu của buổi đào tạo",
      options: [
        "Giải thích mục tiêu",
        "Giải thích lợi ích mà người học sẽ nhận được",
        "Giải thích đầy đủ mục tiêu và lợi ích của người học",
        "Mô tả phù hợp với chương trình đào tạo",
        "Giải thích kèm ví dụ để người học dễ hiểu",
      ],
    },
    "q-7": {
      questionText: "Khuyến khích người tham gia tích cực tham gia (đặt câu hỏi, dùng ví dụ)",
      options: [
        "Chỉ giảng dạy một chiều mà không tạo cơ hội cho người học đặt câu hỏi",
        "Dùng câu hỏi mở để kiểm tra sự hiểu biết của người học",
        "Khuyến khích người học tham gia thực hành",
        "Giải thích kèm ví dụ để người học dễ hiểu",
        "Cho người học cơ hội lặp lại hoặc giải thích những gì đã học và thực hành để xác nhận hiểu biết",
      ],
    },
    "q-8": {
      questionText: "Sử dụng phương tiện đào tạo phù hợp (slide, hình ảnh, hướng dẫn thao tác)",
      options: [
        "Chuẩn bị và sử dụng đầy đủ phương tiện giảng dạy cho từng bước",
        "Sử dụng các phương tiện cơ bản cần thiết",
        "Sử dụng tài liệu tham khảo chuẩn",
        "Sử dụng phương tiện phù hợp với nội dung và kỹ năng cần đào tạo",
        "Lên kế hoạch sử dụng phương tiện và dụng cụ trước khi giảng dạy và thực hành thử trước khi dạy chính thức",
      ],
    },
    "q-9": {
      questionText: "Quản lý thời gian trong khung thời gian đã định",
      options: [
        "Giảng đúng thời gian quy định",
        "Truyền tải nội dung đầy đủ trong khung thời gian",
        "Quá trình giảng dạy hiệu quả trong khung thời gian đã kiểm soát",
        "Phân bổ thời gian hợp lý cho từng giai đoạn",
        "Xác định rõ từng giai đoạn và truyền tải nội dung hoàn chỉnh hiệu quả trong khung thời gian quy định",
      ],
    },
    "q-10": {
      questionText: "Giọng nói rõ ràng và phát âm chuẩn",
      options: [
        "Sử dụng mức âm lượng phù hợp với môi trường đào tạo",
        "Nói rõ ràng, rành mạch",
        "Tốc độ nói vừa phải, không quá chậm hoặc quá nhanh",
        "Nhấn mạnh các điểm quan trọng để thu hút sự chú ý của người học",
        "Sử dụng giọng nói tự nhiên, trôi chảy, rõ ràng và nhấn mạnh những điểm mấu chốt",
      ],
    },
    "q-11": {
      questionText: "Sử dụng ngôn ngữ đơn giản, dễ hiểu",
      options: [
        "Sử dụng ngôn ngữ rõ ràng, trực tiếp",
        "Giải thích ngắn gọn để giải thích thuật ngữ kỹ thuật",
        "Sử dụng ngôn ngữ phù hợp với trình độ và kinh nghiệm của người học",
        "Tránh dùng từ ngữ mơ hồ, khó hiểu",
        "Sử dụng ngôn ngữ đơn giản, rõ ràng, phù hợp để người học dễ theo dõi",
      ],
    },
    "q-12": {
      questionText: "Giao tiếp bằng mắt và ngôn ngữ cơ thể tích cực",
      options: [
        "Nhìn thẳng vào người học và đứng thẳng, không nhìn chỗ khác",
        "Quét mắt khắp phòng và đi lại trong quá trình giảng",
        "Đứng đối diện và nhìn vào người học khoảng 3-5 phút khi trả lời câu hỏi",
        "Dùng ánh mắt và cử chỉ nhấn mạnh điểm quan trọng",
        "Dùng ánh mắt và cử chỉ để người học cảm thấy thoải mái và dám đặt câu hỏi",
      ],
    },
    "q-13": {
      questionText: "Xử lý câu hỏi một cách tự tin",
      options: [
        "Phản hồi bình tĩnh, lắng nghe kỹ trước khi trả lời",
        "Có thái độ tích cực và chào đón câu hỏi",
        "Sử dụng giọng nói và ngôn ngữ cơ thể ổn định",
        "Xử lý câu hỏi khó một cách điềm tĩnh và tôn trọng",
        "Trả lời bình tĩnh, lắng nghe, và vẫn giữ sự tin cậy ngay cả khi gặp câu hỏi khó",
      ],
    },
    "q-14": {
      questionText: "Thể hiện kiến thức thực hành và kỹ thuật vững chắc",
      options: [
        "Thể hiện sự tự tin và hiểu sâu về nội dung",
        "Hiểu rõ mối liên kết giữa các quy trình và các bộ phận liên quan",
        "Cập nhật tài liệu đào tạo thường xuyên",
        "Nội dung phù hợp với quy trình và chính sách của công ty",
        "Giải thích quy trình, công cụ và hệ thống chính xác phù hợp với tiêu chuẩn tổ chức",
      ],
    },
    "q-15": {
      questionText: "Dùng ví dụ chính xác và liên quan đến bối cảnh công việc",
      options: [
        "Dùng ví dụ phù hợp với quy trình thực tế của tổ chức",
        "Dùng ví dụ hỗ trợ trực tiếp nội dung đang giảng",
        "Dùng tình huống thực tế mà người học gặp trong công việc hằng ngày",
        "Ví dụ giúp đơn giản hóa nội dung phức tạp thay vì làm rối hơn",
        "Dùng kinh nghiệm thực tế để tạo độ tin cậy và tính ứng dụng thực tế",
      ],
    },
    "q-16": {
      questionText: "Áp dụng nguyên tắc học tập của người lớn (tương tác, người học là trung tâm)",
      options: [
        "Kết nối nội dung với vấn đề thực tế trong công việc",
        "Tạo không gian cho người học chia sẻ kinh nghiệm và suy nghĩ",
        "Thiết kế hoạt động cần sự tham gia tích cực",
        "Tập trung vào ứng dụng thực tế hơn là lý thuyết thuần túy",
        "Điều chỉnh hoạt động cho phù hợp với từng cá nhân để tăng hiệu quả học tập",
      ],
    },
    "q-17": {
      questionText: "Sử dụng đóng vai hoặc mô phỏng hiệu quả",
      options: [
        "Dùng câu hỏi mở và câu hỏi sâu để khuyến khích suy ngẫm",
        "Cân bằng sự tham gia để không chỉ một vài người nói",
        "Khuyến khích tham gia bằng phản hồi mang tính xây dựng",
        "Chuyển mượt giữa các hoạt động mà không làm người học bối rối",
        "Tích hợp phương tiện như slide, video, sơ đồ để củng cố thông điệp quan trọng",
      ],
    },
    "q-18": {
      questionText: "Điều chỉnh cách giảng phù hợp với phong cách học khác nhau",
      options: [
        "Quan sát và hiểu từng người học từ đầu để đánh giá nền tảng và phong cách học",
        "Thay đổi kỹ thuật giảng dạy ngay khi phát hiện phương pháp cũ không hiệu quả",
        "Đảm bảo hoạt động điều chỉnh vẫn đạt mục tiêu học tập",
        "Lên kế hoạch nhiều ví dụ và cách giảng khác nhau trước khi dạy",
        "Phân tích nguyên nhân gây hiểu nhầm và xác định cách tiếp cận tối ưu cho từng người học",
      ],
    },
    "q-19": {
      questionText: "Cung cấp phản hồi mang tính xây dựng cho người tham gia",
      options: [
        "Phản hồi riêng tư, không lộ thông tin người khác",
        "Tập trung vào công việc và hành vi quan sát được dựa trên bằng chứng",
        "Bắt đầu từ điểm mạnh trước khi nêu cải thiện",
        "Đưa ra hướng dẫn khắc phục rõ ràng và cho thấy kết quả mong đợi",
        "Xây dựng môi trường tích cực khuyến khích phản hồi đồng thời duy trì tính chuyên nghiệp",
      ],
    },
    "q-20": {
      questionText: "Hiệu quả của phản hồi",
      options: [
        "Giúp người học hiểu và hành động ngay theo hướng dẫn",
        "Giúp ngăn lỗi kỹ thuật lặp lại trong cùng giai đoạn đào tạo",
        "Giúp người học tự sửa lỗi trước khi vấn đề lớn hơn",
        "Giúp duy trì tiêu chuẩn chất lượng",
        "Giúp người học giữ đúng tiến độ và cho thấy tiến bộ tích cực theo mục tiêu hiệu suất",
      ],
    },
    "q-21": {
      questionText: "Khuyến khích phản ánh và tự đánh giá",
      options: [
        "Khuyến khích người học xem lại bài học sau đào tạo",
        "Đặt câu hỏi kích thích người học suy ngẫm về những gì đã học",
        "Dùng câu hỏi hướng dẫn để người học nhận ra điểm cần cải thiện và lập kế hoạch",
        "Tóm tắt điểm chính và giải thích kết quả của hành động khắc phục",
        "Tạo môi trường tích cực cho hoạt động phản hồi như ôn tập theo nhóm",
      ],
    },
    "q-22": {
      questionText: "Thể hiện sự tự tin và nhiệt huyết",
      options: [
        "Nói rõ và đủ to trong lúc giải thích",
        "Dùng thay đổi giọng và cử chỉ để tăng sự chú ý",
        "Không lộ vẻ hoảng hốt khi đối mặt câu hỏi khó",
        "Đọc kỹ tài liệu và chuẩn bị trước mỗi buổi đào tạo",
        "Giải thích giá trị của việc học để tạo động lực cho người học",
      ],
    },
    "q-23": {
      questionText: "Thể hiện sự tôn trọng và kiên nhẫn với người học",
      options: [
        "Sử dụng ngôn ngữ lịch sự và quan tâm đến người học",
        "Không bực bội khi người học học chậm hoặc mắc lỗi lặp lại",
        "Giải thích lại nhiều lần kèm ví dụ khi cần",
        "Điều chỉnh cách giải thích phù hợp với người học",
        "Dùng ngôn ngữ cơ thể tích cực, khích lệ và khen ngợi khi người học làm tốt",
      ],
    },
    "q-24": {
      questionText: "Chào đón phản hồi và cải tiến liên tục",
      options: [
        "Lắng nghe ý kiến và phản hồi của người khác",
        "Không ngắt lời khi đưa ra phản hồi",
        "Dùng phản hồi để cải thiện bản thân và phương pháp giảng",
        "Thường xuyên kiểm tra và cải thiện phương pháp giảng dạy",
        "Dùng phản hồi của người học để tối ưu kỹ thuật đào tạo",
      ],
    },
  },
};

export function getLocalizedCategoryName(category: Category, locale: Locale) {
  return localizedCategoryNames[locale]?.[category.id] ?? category.categoryName;
}

export function getLocalizedQuestion(question: Question, locale: Locale) {
  const localized = localizedQuestionContent[locale]?.[question.id];
  if (!localized) return question;

  return {
    ...question,
    questionText: localized.questionText,
    options: localized.options,
  };
}
