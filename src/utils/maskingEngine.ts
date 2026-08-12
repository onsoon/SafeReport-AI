import { MaskingRule, MaskingCategory, DetectedPII, MaskingStats, DataColumn, ProcessedDataSet } from "../types";

export const DEFAULT_MASKING_RULES: MaskingRule[] = [
  {
    id: "rrn",
    name: "주민등록번호",
    description: "생년월일 6자리 뒤 성별/지역 7자리 마스킹",
    patternName: "\\d{6}-[1-4]\\d{6}",
    enabled: true,
    maskingCharacter: "*",
    replacementExample: "900101-1******",
  },
  {
    id: "phone",
    name: "전화번호 / 휴대전화",
    description: "휴대전화 및 유선전화 국번/중간자리 마스킹",
    patternName: "01[016789]-\\d{3,4}-\\d{4}",
    enabled: true,
    maskingCharacter: "*",
    replacementExample: "010-****-5678",
  },
  {
    id: "email",
    name: "이메일 주소",
    description: "사용자 계정 아이디 중간 문자 마스킹",
    patternName: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",
    enabled: true,
    maskingCharacter: "*",
    replacementExample: "h***g@korea.kr",
  },
  {
    id: "address",
    name: "도로명 / 지번 주소",
    description: "상세 주소 및 건물 번호 마스킹",
    patternName: "(특별|광역|특별자치)?(시|도)\\s+[가-힣]+(구|군|시)\\s+.*",
    enabled: true,
    maskingCharacter: "*",
    replacementExample: "서울특별시 종로구 ********",
  },
  {
    id: "driver_license",
    name: "운전면허번호",
    description: "면허 일련번호 마스킹",
    patternName: "\\d{2}-\\d{2}-\\d{6}-\\d{2}",
    enabled: true,
    maskingCharacter: "*",
    replacementExample: "11-12-******-**",
  },
  {
    id: "bank_account",
    name: "계좌 및 카드번호",
    description: "금융 계좌 및 신용카드 16자리 마스킹",
    patternName: "\\d{3,6}-\\d{2,6}-\\d{3,8}|\\d{4}-\\d{4}-\\d{4}-\\d{4}",
    enabled: true,
    maskingCharacter: "*",
    replacementExample: "110-***-******",
  },
  {
    id: "name",
    name: "성명 / 인적사항",
    description: "2~4글자 한글 이름 외자 마스킹",
    patternName: "[가-힣]{2,4}",
    enabled: true,
    maskingCharacter: "*",
    replacementExample: "홍*동",
  },
];

// REGEX Patterns
const REGEX_PATTERNS = {
  rrn: /\b(\d{6})[-s]?([1-4])\d{6}\b/g,
  phone: /\b(01[016789]|02|0[3-6][1-5])[-.\s]?(\d{3,4})[-.\s]?(\d{4})\b/g,
  email: /\b([a-zA-Z0-9._%+-]{1,2})[a-zA-Z0-9._%+-]*@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g,
  address: /(서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주)[가-힣A-Za-z0-9\s]+(로|길|동|읍|면|리)\s+\d+([\d-]*)/g,
  driver_license: /\b(\d{2})[-.\s]?(\d{2})[-.\s]?(\d{6})[-.\s]?(\d{2})\b/g,
  bank_account: /\b(\d{3,6})[-.\s]?(\d{2,6})[-.\s]?(\d{3,8})\b/g,
};

// Check if a column header implies name/person PII
const NAME_COLUMN_KEYWORDS = [
  "이름", "성명", "신청자", "수혜자", "대표자", "담당자", "수령인", "민원인", "대상자", "명"
];

export function maskRRN(val: string): string {
  return val.replace(REGEX_PATTERNS.rrn, "$1-$2******");
}

export function maskPhone(val: string): string {
  return val.replace(REGEX_PATTERNS.phone, (_match, p1, _p2, p3) => {
    return `${p1}-****-${p3}`;
  });
}

export function maskEmail(val: string): string {
  return val.replace(REGEX_PATTERNS.email, (_match, p1, p2) => {
    return `${p1}***@${p2}`;
  });
}

export function maskAddress(val: string): string {
  return val.replace(REGEX_PATTERNS.address, (match) => {
    const parts = match.split(" ");
    if (parts.length <= 2) return `${parts[0]} *****`;
    return `${parts.slice(0, 2).join(" ")} ********`;
  });
}

export function maskDriverLicense(val: string): string {
  return val.replace(REGEX_PATTERNS.driver_license, "$1-$2-******-$4");
}

export function maskBankAccount(val: string): string {
  return val.replace(REGEX_PATTERNS.bank_account, (_match, p1) => {
    return `${p1}-***-******`;
  });
}

export function maskKoreanName(nameStr: string): string {
  const trimmed = nameStr.trim();
  if (trimmed.length === 2) {
    return `${trimmed[0]}*`;
  }
  if (trimmed.length === 3) {
    return `${trimmed[0]}*${trimmed[2]}`;
  }
  if (trimmed.length === 4) {
    return `${trimmed[0]}**${trimmed[3]}`;
  }
  return trimmed;
}

/**
 * Main Masking Engine execution on Client Side memory
 */
export function processDataSet(
  rawRows: Record<string, any>[],
  fileName: string,
  fileSize: number,
  rules: MaskingRule[]
): ProcessedDataSet {
  if (!rawRows || rawRows.length === 0) {
    return {
      fileName,
      fileSize,
      uploadTime: new Date().toLocaleTimeString("ko-KR"),
      columns: [],
      headers: [],
      rawRows: [],
      maskedRows: [],
      detectedPIIs: [],
      stats: {
        totalRows: 0,
        totalCols: 0,
        piiCount: 0,
        countsByCategory: {
          rrn: 0,
          phone: 0,
          email: 0,
          address: 0,
          driver_license: 0,
          bank_account: 0,
          name: 0,
        },
        riskScore: "안전",
      },
    };
  }

  const enabledRulesMap = new Map<string, boolean>();
  rules.forEach((r) => enabledRulesMap.set(r.id, r.enabled));

  // Extract enabled custom rules with valid regex
  const customRules = rules.filter(
    (r) => r.isCustom && r.enabled && r.regexPattern && r.regexPattern.trim().length > 0
  );

  const headers = Object.keys(rawRows[0] || {});
  const detectedPIIs: DetectedPII[] = [];
  const countsByCategory: Record<string, number> = {
    rrn: 0,
    phone: 0,
    email: 0,
    address: 0,
    driver_license: 0,
    bank_account: 0,
    name: 0,
  };

  rules.forEach((r) => {
    if (!countsByCategory[r.id]) {
      countsByCategory[r.id] = 0;
    }
  });

  const maskedRows: Record<string, any>[] = [];
  const columnPIIMap = new Map<string, Set<string>>();

  headers.forEach((col) => columnPIIMap.set(col, new Set()));

  rawRows.forEach((row, rowIdx) => {
    const maskedRow: Record<string, any> = {};

    headers.forEach((col) => {
      const originalValue = String(row[col] ?? "");
      let cellValue = originalValue;
      const isNameColumn = NAME_COLUMN_KEYWORDS.some((kw) => col.includes(kw));

      // 1. RRN Check
      if (enabledRulesMap.get("rrn") && REGEX_PATTERNS.rrn.test(cellValue)) {
        const masked = maskRRN(cellValue);
        countsByCategory.rrn = (countsByCategory.rrn || 0) + 1;
        columnPIIMap.get(col)?.add("rrn");
        detectedPIIs.push({
          id: `pii-${rowIdx}-${col}-rrn`,
          rowIdx,
          colName: col,
          category: "rrn",
          categoryName: "주민등록번호",
          originalValue: cellValue,
          maskedValue: masked,
        });
        cellValue = masked;
      }

      // 2. Phone Check
      if (enabledRulesMap.get("phone") && REGEX_PATTERNS.phone.test(cellValue)) {
        const masked = maskPhone(cellValue);
        countsByCategory.phone = (countsByCategory.phone || 0) + 1;
        columnPIIMap.get(col)?.add("phone");
        detectedPIIs.push({
          id: `pii-${rowIdx}-${col}-phone`,
          rowIdx,
          colName: col,
          category: "phone",
          categoryName: "전화번호",
          originalValue: cellValue,
          maskedValue: masked,
        });
        cellValue = masked;
      }

      // 3. Email Check
      if (enabledRulesMap.get("email") && REGEX_PATTERNS.email.test(cellValue)) {
        const masked = maskEmail(cellValue);
        countsByCategory.email = (countsByCategory.email || 0) + 1;
        columnPIIMap.get(col)?.add("email");
        detectedPIIs.push({
          id: `pii-${rowIdx}-${col}-email`,
          rowIdx,
          colName: col,
          category: "email",
          categoryName: "이메일",
          originalValue: cellValue,
          maskedValue: masked,
        });
        cellValue = masked;
      }

      // 4. Address Check
      if (enabledRulesMap.get("address") && REGEX_PATTERNS.address.test(cellValue)) {
        const masked = maskAddress(cellValue);
        countsByCategory.address = (countsByCategory.address || 0) + 1;
        columnPIIMap.get(col)?.add("address");
        detectedPIIs.push({
          id: `pii-${rowIdx}-${col}-address`,
          rowIdx,
          colName: col,
          category: "address",
          categoryName: "주소",
          originalValue: cellValue,
          maskedValue: masked,
        });
        cellValue = masked;
      }

      // 5. Driver License Check
      if (enabledRulesMap.get("driver_license") && REGEX_PATTERNS.driver_license.test(cellValue)) {
        const masked = maskDriverLicense(cellValue);
        countsByCategory.driver_license = (countsByCategory.driver_license || 0) + 1;
        columnPIIMap.get(col)?.add("driver_license");
        detectedPIIs.push({
          id: `pii-${rowIdx}-${col}-driver`,
          rowIdx,
          colName: col,
          category: "driver_license",
          categoryName: "운전면허번호",
          originalValue: cellValue,
          maskedValue: masked,
        });
        cellValue = masked;
      }

      // 6. Bank Account Check
      if (enabledRulesMap.get("bank_account") && REGEX_PATTERNS.bank_account.test(cellValue)) {
        const masked = maskBankAccount(cellValue);
        countsByCategory.bank_account = (countsByCategory.bank_account || 0) + 1;
        columnPIIMap.get(col)?.add("bank_account");
        detectedPIIs.push({
          id: `pii-${rowIdx}-${col}-bank`,
          rowIdx,
          colName: col,
          category: "bank_account",
          categoryName: "계좌/카드번호",
          originalValue: cellValue,
          maskedValue: masked,
        });
        cellValue = masked;
      }

      // 7. Name Column Check
      if (
        enabledRulesMap.get("name") &&
        isNameColumn &&
        /^[가-힣]{2,4}$/.test(originalValue.trim())
      ) {
        const masked = maskKoreanName(originalValue);
        countsByCategory.name = (countsByCategory.name || 0) + 1;
        columnPIIMap.get(col)?.add("name");
        detectedPIIs.push({
          id: `pii-${rowIdx}-${col}-name`,
          rowIdx,
          colName: col,
          category: "name",
          categoryName: "성명",
          originalValue: cellValue,
          maskedValue: masked,
        });
        cellValue = masked;
      }

      // 8. Custom User-Defined Rules Check
      customRules.forEach((cRule) => {
        try {
          const reg = new RegExp(cRule.regexPattern!, "g");
          if (reg.test(cellValue)) {
            const maskChar = cRule.maskingCharacter || "*";
            const masked = cellValue.replace(new RegExp(cRule.regexPattern!, "g"), (match) => {
              return maskChar.repeat(match.length);
            });

            countsByCategory[cRule.id] = (countsByCategory[cRule.id] || 0) + 1;
            columnPIIMap.get(col)?.add(cRule.id);
            detectedPIIs.push({
              id: `pii-${rowIdx}-${col}-${cRule.id}`,
              rowIdx,
              colName: col,
              category: cRule.id,
              categoryName: cRule.name,
              originalValue: cellValue,
              maskedValue: masked,
            });
            cellValue = masked;
          }
        } catch (e) {
          console.warn(`[Custom Rule Error] ${cRule.name}:`, e);
        }
      });

      maskedRow[col] = cellValue;
    });

    maskedRows.push(maskedRow);
  });

  const columns: DataColumn[] = headers.map((h) => {
    const piiTypes = Array.from(columnPIIMap.get(h) || []);
    return {
      key: h,
      name: h,
      type: typeof rawRows[0][h] === "number" ? "number" : "text",
      hasPII: piiTypes.length > 0,
      detectedTypes: piiTypes,
    };
  });

  const totalPII = detectedPIIs.length;
  let riskScore: "안전" | "주의" | "경고" | "위험" = "안전";
  if (totalPII > 50 || countsByCategory.rrn > 5) riskScore = "위험";
  else if (totalPII > 20 || countsByCategory.rrn > 0) riskScore = "경고";
  else if (totalPII > 0) riskScore = "주의";

  return {
    fileName,
    fileSize,
    uploadTime: new Date().toLocaleTimeString("ko-KR"),
    columns,
    headers,
    rawRows,
    maskedRows,
    detectedPIIs,
    stats: {
      totalRows: rawRows.length,
      totalCols: headers.length,
      piiCount: totalPII,
      countsByCategory,
      riskScore,
    },
  };
}

/**
 * Preloaded Public Sector Sample Data
 */
export const SAMPLE_PUBLIC_DATASETS = [
  {
    name: "2026년 소상공인 난방비 지원사업 신청 현황데이터.xlsx",
    description: "소상공인 지원금 신청자 목록 (주민번호, 연락처, 계좌번호 포함 샘플)",
    data: [
      {
        연번: 1,
        신청일자: "2026-02-01",
        사업장명: "드림베이커리 종로점",
        대표자명: "김철수",
        주민등록번호: "780512-1458921",
        연락처: "010-3849-2019",
        이메일: "chulsoo78@naver.com",
        사업장주소: "서울특별시 종로구 삼청로 45",
        신청금액: 500000,
        지원계좌: "110-394-281940",
        처리상태: "승인완료",
      },
      {
        연번: 2,
        신청일자: "2026-02-02",
        사업장명: "세종정밀 공업사",
        대표자명: "이영희",
        주민등록번호: "851104-2091823",
        연락처: "010-9281-3049",
        이메일: "younghee85@korea.com",
        사업장주소: "서울특별시 중구 청계천로 120",
        신청금액: 500000,
        지원계좌: "302-0192-3841-91",
        처리상태: "승인완료",
      },
      {
        연번: 3,
        신청일자: "2026-02-03",
        사업장명: "한강카페 마포점",
        대표자명: "박민수",
        주민등록번호: "920315-1829304",
        연락처: "010-5839-2049",
        이메일: "minsu92@daum.net",
        사업장주소: "서울특별시 마포구 포은로 88",
        신청금액: 300000,
        지원계좌: "1002-394-182930",
        처리상태: "보완요청",
      },
      {
        연번: 4,
        신청일자: "2026-02-04",
        사업장명: "미래IT솔루션",
        대표자명: "정수진",
        주민등록번호: "880920-2192039",
        연락처: "010-4820-1920",
        이메일: "sujin88@gmail.com",
        사업장주소: "서울특별시 강남구 테헤란로 210",
        신청금액: 500000,
        지원계좌: "010-4820-1920-1",
        처리상태: "승인완료",
      },
      {
        연번: 5,
        신청일자: "2026-02-05",
        사업장명: "동아문구점",
        대표자명: "최동수",
        주민등록번호: "650401-1029384",
        연락처: "02-739-2019",
        이메일: "dongsoo@hanmail.net",
        사업장주소: "서울특별시 서대문구 신촌로 15",
        신청금액: 500000,
        지원계좌: "110-182-392019",
        처리상태: "반려",
      },
    ],
  },
  {
    name: "2026년 공공시설 이용 민원접수 및 불만신고 내역.csv",
    description: "시민 민원 접수 내역 (전화번호, 주소, 이메일 개인정보 수집 데이터)",
    data: [
      {
        민원번호: "2026-MW-001",
        접수일시: "2026-02-10 09:30",
        민원인명: "강경호",
        연락처: "010-9382-1029",
        이메일: "kyungho@korea.kr",
        주소지: "경기도 성남시 분당구 불정로 90",
        민원분류: "공공체육시설",
        민원내용: "분당체육센터 야간 조명 고장 및 안전관리 미흡 건",
        담당부서: "체육진흥과",
        처리결과: "조치완료",
      },
      {
        민원번호: "2026-MW-002",
        접수일시: "2026-02-10 11:15",
        민원인명: "윤지선",
        연락처: "010-2910-3849",
        이메일: "jiseon.yoon@naver.com",
        주소지: "경기도 수원시 영통구 광교중앙로 170",
        민원분류: "도로교통",
        민원내용: "광교중앙역 부근 신호등 주기 연장 및 보행자 안전펜스 설치 요청",
        담당부서: "교통행정과",
        처리결과: "검토중",
      },
      {
        민원번호: "2026-MW-003",
        접수일시: "2026-02-11 14:00",
        민원인명: "임재현",
        연락처: "010-4829-1039",
        이메일: "jh_lim@gmail.com",
        주소지: "인천광역시 연수구 송도동 컨벤시아대로 100",
        민원분류: "환경위생",
        민원내용: "공원 내 쓰레기 무단투기 단속 CCTV 추가 설치 건",
        담당부서: "자원순환과",
        처리결과: "조치완료",
      },
    ],
  },
];
