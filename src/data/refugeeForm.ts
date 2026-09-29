/**
 * Structure of the "Application for Recognition of Refugee Status" (난민인정신청서)
 * — 난민법 시행규칙 [별지 제1호서식] <개정 2019. 12. 31.>, 22 pages.
 * Question numbers, Korean/English wording and follow-up rules follow the official form.
 * `say` (plain-language script) and `tip` (practice pointer) are aids added for lawyers — not part of the form.
 */
export type Opt = { v: string; ko: string; en: string }
export type Col = { k: string; ko: string; en: string; date?: boolean; wide?: boolean }
export type Kind = 'text' | 'long' | 'date' | 'choice' | 'multi' | 'table' | 'story' | 'check'
export type Field = {
  id: string; ko: string; en: string; kind: Kind
  opts?: Opt[]; cols?: Col[]; prompts?: { ko: string; en: string }[]
  say?: string; tip?: string; na?: boolean
  when?: { id: string; is?: string | string[] }      // follow-up: shown when parent answer matches (or is non-empty)
  special?: 'over1yr'                                 // shown/required only if application is >1 year after entry
}
export type Sec = { n: string; ko: string; en: string; note?: { ko: string; en: string }; fields: Field[] }

const o = (v: string, ko: string, en: string): Opt => ({ v, ko, en })
const YN = [o('yes', '예', 'Yes'), o('no', '아니요', 'No')]
const f = (id: string, ko: string, en: string, kind: Kind = 'text', x: Partial<Field> = {}): Field => ({ id, ko, en, kind, ...x })
const yn = (id: string, ko: string, en: string, x: Partial<Field> = {}) => f(id, ko, en, 'choice', { opts: YN, ...x })
const c = (k: string, ko: string, en: string, x: Partial<Col> = {}): Col => ({ k, ko, en, ...x })
const YES = (id: string) => ({ id, is: 'yes' })
const NO = (id: string) => ({ id, is: 'no' })

export const SECTIONS: Sec[] = [
  {
    n: '1', ko: '실제 인적사항', en: 'Personal Information',
    fields: [
      f('1.1', '신청인의 신분', 'Applicant’s status', 'choice', { opts: [o('principal', '주신청자', 'The principal applicant'), o('family', '동반가족(배우자, 사실혼, 미성년 또는 성년 자녀 등)', 'Family (spouse, de facto partner, minor or adult child etc.)')] }),
      f('1.2', '성(姓)', 'Family name'),
      f('1.3', '명(名)', 'Given name(s)'),
      f('1.4', '다른 이름 (혼전 성명, 종교적 이름, 가명, 별명 등)', 'Other names you have ever used incl. maiden names, religious names, aliases, nicknames', 'text', { na: true, tip: 'List every variant, spelling and transliteration. Mismatches with documents or earlier records (e.g. UNHCR, other countries) can later be read as credibility problems.' }),
      f('1.5', '생년월일', 'Date of birth (yyyy/mm/dd)', 'date', { tip: 'If only the year is known, record what the client knows and say so in the statement. The date drives the minor rules in the instructions (≤9 / 10–18).' }),
      f('1.6', '성별', 'Gender', 'choice', { opts: [o('m', '남', 'Male'), o('f', '여', 'Female'), o('x', '기타', 'Other')] }),
      f('1.7', '국적', 'Nationality'),
      f('1.8', '현재의 직업', 'Occupation'),
      f('1.9', '출생지(국가, 시, 도, 마을 이름 등 행정구역을 상세히 기재)', 'Place of birth (village, town, city, county, district, province, country)', 'long', { say: 'Where were you born — the village or town, the district, the province and the country?' }),
      f('1.10', '자국 주소지(국가, 시, 도, 마을 이름 등 행정구역을 상세히 기재)', 'Registered address in home country (village, town, city, county, district, province, country)', 'long'),
      f('1.11', '종교 및 종파', 'Religion and sect'),
      f('1.12', '인종, 종족(민족)', 'Race, ethnic or tribal group'),
      f('1.13', '모국어', 'Mother language'),
      f('1.13b', '유창하게 할 수 있는 언어', 'Language(s) you can speak most fluently', 'multi', { opts: [o('ko', '한국어', 'Korean'), o('en', '영어', 'English'), o('fr', '불어', 'French'), o('other', '기타', 'Other')] }),
      f('1.13c', '기타 언어', 'Other language(s)', 'text', { when: { id: '1.13b', is: 'other' } }),
      yn('1.14', '난민심사관이 면접할 때 통역이 필요합니까?', 'Do you need an interpreter during an interview?', { tip: 'The instructions give the right to an interpreter in the requested language and to have a trusted person present at the interview. Confirm both with the client now.', say: 'At your interview you can have an interpreter in the language you choose. Do you want one? Which language?' }),
      f('1.14a', '통역을 희망하는 언어', 'Language requested for interpretation', 'text', { when: YES('1.14') }),
      f('1.14b', '통역과 관련하여 특별히 요청할 사항', 'Anything specific you would like to request regarding interpretation?', 'long', { when: YES('1.14'), na: true }),
    ],
  },
  {
    n: '2', ko: '국적(시민권) 및 영주권', en: 'Nationality (Citizenship) and Permanent Resident Status',
    fields: [
      yn('2.1', '과거에 다른 나라 국적이나 영주권을 취득한 적이 있거나 현재 다른 나라 국적이나 영주권을 가지고 있습니까?', 'Have you ever acquired, or do you currently hold, any other country’s nationality or permanent resident status?', { tip: 'Any other nationality or residence right is directly relevant to protection in another country — confirm carefully and record dates.' }),
      f('2.2', '나라 이름, 취득일자, 상실일자, 현재 상태', 'Country, date of acquisition, date of loss, current status', 'table', { when: YES('2.1'), cols: [c('country', '국가명', 'Country'), c('from', '취득일자', 'Acquired (yyyy/mm/dd)', { date: true }), c('to', '상실일자', 'Lost (yyyy/mm/dd)', { date: true }), c('status', '현재 상태', 'Current status')] }),
    ],
  },
  {
    n: '3', ko: '혼인사항', en: 'Marital Status',
    note: { ko: '혼인사항 등을 표시하고 자세한 내용을 발생연도 순으로 쓰세요.', en: 'Check the appropriate box and indicate your marital status in chronological order.' },
    fields: [
      f('3.1', '혼인 상태', 'Marital status', 'choice', { opts: [o('single', '미혼', 'Single'), o('married', '결혼', 'Married'), o('defacto', '사실혼', 'De facto marriage'), o('divorced', '이혼', 'Divorced'), o('widowed', '사별', 'Widowed'), o('samesex', '동성혼', 'Same-sex marriage'), o('separated', '별거', 'Living separately'), o('other', '기타', 'Other')] }),
      f('3.2', '혼인 이력 (발생연도 순)', 'Marriage history (chronological)', 'table', { cols: [c('date', '발생일자', 'Date (yyyy/mm/dd)', { date: true }), c('fn', '배우자 성(姓)', 'Spouse family name'), c('gn', '배우자 명(名)', 'Spouse given name'), c('dob', '생년월일', 'Date of birth', { date: true }), c('status', '현재 상태(혼인, 이혼, 사별 등)', 'Current status (married, divorced, widowed)')] }),
    ],
  },
  {
    n: '4', ko: '가족사항', en: 'Family Information',
    note: { ko: '사망자를 포함하여 가족 구성원 모두를 빠짐없이 쓰세요 — 부모, 형제자매, 배우자, 자녀(혼외출생자 및 입양 포함).', en: 'List family members, living or deceased: father, mother, brother(s), sister(s), spouse and children (incl. born outside marriage or adopted).' },
    fields: [
      f('4.1', '가족 구성원', 'Family members', 'table', { tip: 'Complete lists matter: unexplained gaps (a sibling not mentioned, a deceased parent without a date) are easy to spot in interviews. Ask about half-siblings and adopted children.', cols: [c('rel', '관계', 'Relationship'), c('name', '성명', 'Full name'), c('dob', '생년월일', 'Date of birth', { date: true }), c('nat', '국적', 'Nationality'), c('city', '거주 도시 (사망자는 사망일)', 'City of residence (if deceased: date of death)')] }),
    ],
  },
  {
    n: '5', ko: '학력사항', en: 'Education',
    note: { ko: '초등학교부터 최종학교까지(직업훈련학교 포함) 연도 순으로 쓰세요.', en: 'List in chronological order all schools and training institutions attended, beginning with primary education.' },
    fields: [
      f('5.1', '학력', 'Education history', 'table', { cols: [c('from', '입학연도', 'From (yyyy/mm)'), c('to', '졸업연도', 'To (yyyy/mm)'), c('school', '학교 또는 교육기관명', 'Name of school or institution', { wide: true }), c('loc', '소재지', 'Location (address)'), c('deg', '졸업 여부(학위, 자격증)', 'Degrees or qualifications')] }),
    ],
  },
  {
    n: '6', ko: '경력사항', en: 'Work Experience',
    note: { ko: '직업 등 경력사항을 최근 연도 순으로 모두 쓰세요(자영업, 시간제 근무, 인턴 포함).', en: 'List all jobs in chronological order (full-time, part-time, self-employment and internships).' },
    fields: [
      f('6.1', '경력', 'Work history', 'table', { tip: 'Gaps in the timeline (education → work → residence) should be explained; cross-check with Sections 5 and 8.', cols: [c('from', '근무 시작', 'From (yyyy/mm)'), c('to', '근무 종료', 'To (yyyy/mm)'), c('work', '직장명', 'Name of workplace', { wide: true }), c('loc', '소재지(주소)', 'Location (address)'), c('type', '담당업무(직위)', 'Type of work')] }),
    ],
  },
  {
    n: '7', ko: '군 복무 사항', en: 'Military Service',
    note: { ko: '군 복무 경력이 없으면 7.3~7.9에 “해당 없음”으로 씁니다.', en: 'If the client did not serve, write “non applicable” for 7.3–7.9.' },
    fields: [
      f('7.1', '본국의 군 복무제도', 'Is military service compulsory or voluntary in your home country?', 'choice', { opts: [o('compulsory', '의무 복무', 'Compulsory'), o('voluntary', '지원 복무', 'Voluntary')] }),
      yn('7.2', '귀하는 군 복무를 한 적이 있나요?', 'Did you serve in the military?'),
      f('7.3', '군 복무기간', 'If yes, when did you serve?', 'text', { when: YES('7.2') }),
      f('7.4', '군 복무한 국가(지명 포함)', 'What country did you serve in? (include the specific location)', 'text', { when: YES('7.2') }),
      f('7.5', '복무한 군대', 'In which military branch did you serve?', 'multi', { when: YES('7.2'), opts: [o('army', '육군', 'Army'), o('navy', '해군', 'Navy'), o('air', '공군', 'Air Force'), o('marine', '해병대', 'Marine Corps'), o('other', '기타(민병대 등)', 'Others (militia, etc.)')] }),
      f('7.6', '소속 부대명', 'Name of regiment (unit)', 'text', { when: YES('7.2') }),
      f('7.7', '전역 당시 계급', 'Rank at the conclusion of service', 'text', { when: YES('7.2') }),
      f('7.8', '전역 사유', 'Reason for discharge', 'text', { when: YES('7.2') }),
      yn('7.9', '전투에 참가한 경력이 있나요?', 'Do you have combat experience?', { when: YES('7.2') }),
      f('7.9a', '전투 참가 경력의 내용', 'If yes, please explain in detail', 'long', { when: { id: '7.9', is: 'yes' }, tip: 'Combat or unit involvement can raise exclusion questions as well as persecution ones. Take a careful, chronological account before the client writes anything.' }),
    ],
  },
  {
    n: '8', ko: '거주사항', en: 'Residence Records',
    note: { ko: '본국이나 외국에서 거주한 사항을 최근 연도 순으로 모두 쓰세요.', en: 'List all places of residence in your home country and abroad, in chronological order.' },
    fields: [
      f('8.1', '거주 이력', 'Residence history', 'table', { cols: [c('from', '거주 시작', 'From (yyyy/mm)'), c('to', '거주 종료', 'To (yyyy/mm)'), c('country', '거주국가', 'Country of residence'), c('addr', '상세 주소', 'Address (village, town, city, district, province)', { wide: true }), c('status', '신분(국민, 체류자격 등)', 'Status (citizen, type of visa, etc.)')] }),
    ],
  },
  {
    n: '9', ko: '여권사항', en: 'Travel Documents',
    fields: [
      yn('9.1', '현재 여권 또는 여행증명서를 소지하고 있나요?', 'Do you currently possess your passport or travel document?'),
      f('9.2', '여권 등 발급기관명', 'If yes, by whom was it issued?', 'text', { when: YES('9.1') }),
      f('9.3', '발급일', 'Date of issuance (yyyy/mm/dd)', 'date', { when: YES('9.1') }),
      f('9.4', '취득 목적', 'Purpose of obtaining', 'text', { when: YES('9.1') }),
      yn('9.5', '여권 또는 여행증명서는 진본이며 적법하게 취득한 것인가요? (아니요: 위조, 변조 또는 그 밖의 불법 취득)', 'Is the passport or travel document genuine and legally obtained? (No: falsified, forged or otherwise illegally obtained)', { when: YES('9.1'), tip: 'Ask this privately and early. The form states that false statements or concealed facts can lead to denial or cancellation (Art. 22(1)) and penalties (Art. 47). An honest, detailed explanation is safer than a later discovery.' }),
      f('9.6', '여권 또는 여행증명서를 취득하게 된 경위를 자세히 쓰세요', 'Explain in detail where and how you obtained your passport or travel document', 'long', { when: YES('9.1') }),
      f('9.7', '여권이 진본이 아니거나 적법하지 않게 취득하였다면 그 이유', 'If not genuine or illegally obtained, explain the reason in detail', 'long', { when: NO('9.5') }),
      f('9.8', '현재 여권이나 여행증명서를 가지고 있지 않다면 그 이유', 'If you do not currently have a passport or travel document, explain the reason in detail', 'long', { when: NO('9.1') }),
      yn('9.9', '여권이나 여행증명서를 가지고 있지 않은 경우 발급받을 수 있나요?', 'If you do not have one, can you have it issued?', { when: NO('9.1') }),
      f('9.10', '취득 가능한 항목', 'What can you get issued?', 'multi', { when: YES('9.9'), opts: [o('passport', '여권', 'Passport'), o('travel', '여행증명서', 'Travel document'), o('id', '국가 신분증', 'I.D. card'), o('other', '기타', 'Others')] }),
      f('9.11', '취득할 수 없는 이유', 'If no, explain the reason in detail', 'long', { when: NO('9.9') }),
    ],
  },
  {
    n: '10', ko: '대한민국 입국사항', en: 'Entry to the Republic of Korea',
    fields: [
      yn('10.1', '귀하는 한국 사증을 발급받아 입국하였나요?', 'Do you have a Korean visa?'),
      f('10.2', '사증 발급 기관명 또는 지역', 'Which consulate/embassy did you apply at?', 'text', { when: YES('10.1') }),
      f('10.3', '사증 종류', 'Visa type', 'text', { when: YES('10.1') }),
      f('10.4', '사증 발급일자', 'Date of issuance (yyyy/mm/dd)', 'date', { when: YES('10.1') }),
      f('10.5', '사증 신청 시 제출한 서류', 'Document(s) you submitted to apply for a Korean visa', 'long', { when: YES('10.1') }),
      f('10.6', '사증 발급·입국을 도와준 사람의 인적사항과 경위', 'Did anyone help you obtain a Korean visa or enter Korea? If yes, explain in detail', 'long', { na: true }),
      f('10.7', '입국일자 (마지막 입국)', 'Date of the last entry into Korea (yyyy/mm/dd)', 'date', { tip: 'This date is used for the one-year check in 14.18 — record it precisely.' }),
      f('10.8', '입국장소 (마지막 입국)', 'Place of the last entry into Korea'),
      f('10.9', '처음 또는 난민인정 신청 전 입국 목적(관광, 상용, 방문 등)', 'Purpose of visit when you first entered Korea, or before applying (tourism, business, visiting, etc.)'),
      yn('10.10', '한국에 입국할 때 입국심사를 받았나요?', 'Did you go through immigration inspection at the time of entry into Korea?'),
      f('10.10a', '어떻게 입국했는지', 'If no, explain in detail how you entered Korea', 'long', { when: NO('10.10') }),
      yn('10.11', '입국할 때 ‘1. 실제 인적사항’으로 발급받은 여권으로 입국하였나요?', 'Did you present your passport issued under the identity in “1. Personal Information” at entry?', { say: 'When you entered Korea, was the passport in the same name and date of birth you gave in Section 1?', tip: '“Yes” → go to Section 11. “No” → complete 10.12–10.15 with the details exactly as printed on the passport used.' }),
      f('10.12', '여권상 성(姓)', 'Family name on passport', 'text', { when: NO('10.11') }),
      f('10.13', '여권상 명(名)', 'Given name(s) on passport', 'text', { when: NO('10.11') }),
      f('10.14', '여권상 생년월일', 'Date of birth on passport', 'date', { when: NO('10.11') }),
      f('10.15', '여권상 국적', 'Nationality on passport', 'text', { when: NO('10.11') }),
    ],
  },
  {
    n: '11', ko: '대한민국 내 체류사항', en: 'Status of Stay in the Republic of Korea',
    fields: [
      f('11.1', '현재 체류자격', 'Type of current visa'),
      f('11.2', '체류기간 만료일자', 'Expiration date (yyyy/mm/dd)', 'date'),
      f('11.3', '과거부터 현재까지의 법 위반사항 (모두 표시)', 'If you have ever committed a violation of the laws below, check all that apply', 'multi', { tip: 'Ask openly: overstays, irregular entry, criminal cases, forged passports. The form warns that concealing important facts can lead to denial or cancellation.', opts: [o('overstay', '불법체류', 'Illegal stay'), o('illegal-entry', '한국 밀입국', 'Illegal entry into Korea'), o('criminal', '형사법 위반', 'Criminal offence'), o('forged', '위조ㆍ변조 여권 사용', 'Usage of falsified or forged passport'), o('other', '기타', 'Others')] }),
      f('11.3a', '위 법 위반사항의 내용', 'Explain in detail the reason(s) for the above', 'long', { when: { id: '11.3' } }),
      f('11.4', '한국 내 주소', 'Address in Korea', 'long'),
      f('11.5', '연락처', 'Contact information'),
      f('11.6', '전자우편', 'E-mail address'),
      f('11.7', '한국 내 연고자', 'Anyone in Korea (check all that apply)', 'multi', { opts: [o('family', '가족 또는 친척', 'Family or relatives'), o('rep', '대리인', 'Representative'), o('lawyer', '변호인', 'Lawyer'), o('interp', '통역인', 'Interpreter'), o('friend', '친구', 'Friends'), o('other', '기타', 'Others')] }),
      f('11.7a', '연고자 상세', 'Details of contacts in Korea', 'table', { when: { id: '11.7' }, cols: [c('name', '성명', 'Full name'), c('rel', '신청인과의 관계', 'Relationship'), c('tel', '전화번호', 'Telephone number')] }),
      f('11.8', '현재 생활비 조달 방법', 'How are you financing your living expenses?', 'multi', { opts: [o('wage', '급여', 'Wage'), o('savings', '예금', 'Savings'), o('other', '기타', 'Others')], tip: 'Reminder from the instructions: applicants may work only with permission after 6 months from applying; working earlier or without permission can be punished under the Immigration Control Act.' }),
      f('11.8a', '생활비 조달 내용', 'Explain in detail', 'long', { when: { id: '11.8' } }),
      f('11.9', '현재 건강상태', 'How is your health condition at the moment?', 'choice', { opts: [o('good', '좋다', 'Good'), o('bad', '나쁘다', 'Not good')] }),
      f('11.9a', '건강 문제의 구체적 내용', 'If not good, explain in detail', 'long', { when: { id: '11.9', is: 'bad' }, tip: 'Health and trauma issues can affect how an applicant gives evidence. Consider medical/psychological documentation and tell the officer if the client needs adjustments at interview.' }),
      yn('11.10', '한국정부의 생계비 지원이 필요한가요?', 'Do you need living expenses support from the Korean government?', { tip: 'Support is available after review for up to 6 months from the date of application.' }),
      f('11.10a', '지원이 필요한 이유', 'If yes, explain in detail', 'long', { when: YES('11.10') }),
    ],
  },
  {
    n: '12', ko: '본국 출입국사항', en: 'Record of Entry Into and Departure From Home Country',
    fields: [
      f('12.1', '가장 최근에 본국에서 출국한 날짜', 'When did you last leave your home country? (yyyy/mm/dd)', 'date', { tip: 'Compare with 14.7 — the two dates should match, or the difference should be explained.' }),
      f('12.2', '출국 공항ㆍ항만 또는 지역', 'Place of departure (airport, port, or region)'),
      f('12.3', '출국 교통수단(비행기, 선박 등)', 'Means of transportation (airplane, ship, etc.)'),
      f('12.4', '출국 목적', 'Reason(s) for departure', 'long'),
      yn('12.5', '출국할 때 출국허가나 출국사증을 받아야 하나요?', 'Were you required to obtain an exit permit or exit visa from the authorities of your country?'),
      yn('12.6', '적법한 허가를 받았나요?', 'If yes, did you obtain it legally?', { when: YES('12.5') }),
      f('12.7', '출국허가를 받은 시기', 'If yes, when was it issued? (yyyy/mm/dd)', 'date', { when: YES('12.6') }),
      f('12.8', '출국허가를 받지 않았다면 그 이유와 출국 방법', 'If no, explain why and how you left your country in detail', 'long', { when: NO('12.6') }),
      yn('12.9', '한국에 입국하기 전에 다른 나라에 입국한 적이 있나요?', 'Have you traveled through any other countries before coming to Korea?', { tip: 'List every country, including transit. Any stay in a third country invites the question why protection was not sought there.' }),
      f('12.9a', '방문한 나라 (연도 순, 경유국가 포함)', 'Countries visited in chronological order (incl. transit)', 'table', { when: YES('12.9'), cols: [c('in', '입국일자', 'Date of entry (yyyy/mm/dd)', { date: true }), c('out', '출국일자', 'Date of departure (yyyy/mm/dd)', { date: true }), c('country', '방문국가', 'Country'), c('loc', '체류지', 'Location'), c('visa', '체류자격', 'Visa status'), c('why', '방문목적', 'Purpose of visit')] }),
      yn('12.10', '과거 외국정부로부터(한국 포함) 입국거부, 체류불허, 강제퇴거 등 처분을 받은 사실이 있나요?', 'Have you ever been deported from, denied a visa, or refused entry to any country, including Korea?'),
      f('12.10a', '처분 내역 (연도 순)', 'Details in chronological order', 'table', { when: YES('12.10'), cols: [c('date', '처분일자', 'Date (yyyy/mm/dd)', { date: true }), c('action', '처분 사항', 'Action (deportation, visa denial, entry refusal)'), c('country', '처분 국가', 'Country'), c('reason', '사유', 'Reason', { wide: true })] }),
    ],
  },
  {
    n: '13', ko: '난민인정 신청사항', en: 'Information on Application for Refugee Status',
    note: { ko: '※ 서식에서는 이 항목의 질문 번호가 14.1~14.18로 매겨져 있습니다. 이 부분의 답변이 난민인정 여부 결정에서 가장 중요한 정보로 사용됩니다.', en: 'In the official form these questions are numbered 14.1–14.18 under heading 13. Your answers here are the most crucial information in determining refugee status — include important dates, names and places and attach supporting documents.' },
    fields: [
      f('14.1', '난민인정 신청 사유 (해당하는 것 모두)', 'I am claiming protection as a refugee based on (check all that apply)', 'multi', {
        opts: [o('race', '인종', 'Race'), o('religion', '종교', 'Religion'), o('nationality', '국적', 'Nationality'), o('political', '정치적 의견', 'Political opinion'), o('psg', '특정사회집단의 구성원 신분', 'Membership of a particular social group'), o('family', '가족결합 (다른 사유가 있으면 중복 표시)', 'Family reunion (multiple selections allowed with other reasons)'), o('other', '기타', 'Others')],
        tip: 'These are the five Convention grounds in the form’s definition. Map each event in the narrative to at least one ground, and use “family reunion” only in addition to — not instead of — another ground where one exists.',
      }),
      f('14.1a', '난민인정 신청 사유를 간략하게', 'Please state briefly the reason for applying for refugee status', 'long', { when: { id: '14.1' } }),
      yn('14.2', '14.1의 사유 때문에 과거에 부당한 처분, 박해, 위협(조사, 폭행, 체포, 구금 또는 구속 등)을 받은 적이 있나요?', 'Have you ever experienced harm, mistreatment or threats due to the reasons in 14.1?'),
      f('14.2a', '과거에 받은 부당한 처분·박해·위협', 'If yes, explain in detail', 'story', {
        when: YES('14.2'),
        say: 'Tell me about the worst thing that happened to you because of who you are or what you believe. Start from the beginning. When was it? Where were you? Who did it? What exactly happened?',
        tip: 'Elicit one event at a time in date order. Ask for dates, names, places, injuries, medical records, witnesses, and how the client was released. Extra sheets of the same size may be attached if space is short.',
        prompts: [
          { ko: '무슨 일이 있었나요?', en: 'What happened' }, { ko: '어떤 부당한 처분이나 박해, 위협을 받았나요?', en: 'What kind of harm, mistreatment or threats' },
          { ko: '언제 받았나요?', en: 'When it occurred' }, { ko: '누가 하였나요?', en: 'Who caused it' },
          { ko: '그렇게 믿는 이유가 무엇인가요?', en: 'Why you believe it occurred' }, { ko: '어디에서 받았나요?', en: 'Where it occurred' }, { ko: '어떻게, 왜 풀려났나요?', en: 'How / why you were released' },
        ],
      }),
      yn('14.3', '14.1의 사유 때문에 귀국하면 부당한 처분이나 박해를 받을 것이라고 생각하나요?', 'Do you fear you would be harmed or mistreated if you return to your country due to the reasons in 14.1?'),
      f('14.3a', '귀국 시 두려워하는 내용', 'If yes, explain in detail', 'story', {
        when: YES('14.3'), say: 'If you had to go back tomorrow, what do you think would happen to you? Who would do it? Why would they?',
        prompts: [{ ko: '어떤 부당한 처분 등을 받을 것을 두려워하나요?', en: 'What kind of harm, mistreatment or threats you fear' }, { ko: '누가 그럴 것이라고 생각하나요?', en: 'Who you believe would harm, mistreat or threaten you' }, { ko: '그렇게 생각하는 이유는 무엇인가요?', en: 'Why you believe you would or could be harmed or mistreated' }],
      }),
      yn('14.4', '가족이나 친구가 14.1의 사유 때문에 부당한 처분 또는 박해(조사, 폭행, 체포, 구금 또는 구속 등)를 받은 적이 있나요?', 'Have you or your family members / friends ever faced mistreatment or persecution in your country due to the reasons in 14.1?'),
      f('14.4a', '가족·친구가 받은 처분', 'If yes, explain what happened in detail', 'story', {
        when: YES('14.4'),
        prompts: [{ ko: '언제 그런 일이 일어났나요?', en: 'When the action occurred' }, { ko: '누가 가족 등을 체포 또는 구금하였나요?', en: 'Who detained or arrested them' }, { ko: '이유는 무엇인가요?', en: 'Why they were detained or arrested' }, { ko: '어디에서 일어났나요?', en: 'Where the action occurred' }, { ko: '어떻게, 왜 풀려났나요?', en: 'How / why they were released' }],
      }),
      yn('14.5', '14.1의 사유 때문에 본국에서 경찰이나 권한 있는 정부기관 등에 보호나 지원을 요청한 적이 있나요?', 'Have you ever requested protection or support from the police or authorised government agencies in your home country due to the reasons in 14.1?', { tip: 'State protection is part of the analysis. Either record what was tried and the result — or, if nothing was tried, why (fear, futility, the authorities being the persecutor).' }),
      f('14.5a', '요청 결과', 'If yes, explain the result in detail (dates, names and places where possible)', 'story', {
        when: YES('14.5'),
        prompts: [{ ko: '누구에게 도움을 요청하였나요?', en: 'Whom you approached for help' }, { ko: '어떤 조치를 취했나요?', en: 'What measures you took' }, { ko: '그 결과는 어떻게 되었나요?', en: 'What happened as a result' }],
      }),
      f('14.5b', '요청하지 않은 이유', 'If no, explain the reasons in detail', 'long', { when: NO('14.5') }),
      yn('14.6', '14.1의 사유 때문에 안전을 위하여 본국 내 다른 지역으로 피신한 적이 있나요?', 'Have you ever fled to another region of your country to seek safety due to the reasons in 14.1?'),
      f('14.6a', '피신 결과', 'If yes, explain the result in detail', 'story', {
        when: YES('14.6'),
        prompts: [{ ko: '언제 다른 지역으로 피신했나요? (구체적인 날짜)', en: 'When you fled to other region(s) (provide dates)' }, { ko: '왜 이주했던 지역을 떠났나요?', en: 'Why you left the region you had moved to' }, { ko: '이주했던 지역이나 다른 지역에서 살 수 없었던 이유는 무엇인가요?', en: 'Why you could no longer live there or in other regions' }],
      }),
      f('14.6b', '피신하지 않은 이유', 'If no, explain the reasons in detail', 'long', { when: NO('14.6'), tip: 'Internal relocation is commonly examined. Record concrete reasons it was not possible or reasonable.' }),
      f('14.7', '본국을 떠난 날짜 (구체적인 날짜)', 'When did you leave your country? (provide the date)', 'date'),
      yn('14.8', '귀하 또는 가족이 본국에서 가입했거나 활동했던 단체가 있나요?', 'Have you or any family members ever joined or been associated with any organisation or group in your home country?'),
      f('14.8a', '단체 활동', 'Level of participation, positions held and length of involvement (each person)', 'table', { when: YES('14.8'), cols: [c('name', '성명', "Participant's name"), c('rel', '관계', 'Relationship'), c('period', '활동기간(부터~까지)', 'Period of activity (from–to)'), c('org', '소속 또는 활동 단체', 'Name of organisation'), c('role', '활동 내용', 'Position / level of participation', { wide: true })] }),
      yn('14.9', '본국 정부나 특정 단체에 적대적인 활동을 한 사실이 있나요? (한국에 온 후의 활동 포함)', 'Have you ever been involved in hostile activity against your government or any group (incl. after entering Korea)?'),
      f('14.9a', '적대적 활동의 시기·장소·내용', 'If yes, explain in detail including date, location and activities', 'long', { when: YES('14.9') }),
      yn('14.10', '본국이나 제3국에서 범죄를 저질러 체포되거나 처벌받은 적이 있습니까?', 'Have you ever been arrested or punished for a criminal offence in your home country or a third country?', { tip: 'Politically motivated charges are part of many claims — record the charge, the date, the outcome and why the client says it was pretextual.' }),
      f('14.10a', '체포·처벌 내용', 'If yes, fill out the form below', 'table', { when: YES('14.10'), cols: [c('date', '발생일자', 'Date (yyyy/mm/dd)', { date: true }), c('offence', '죄명', 'Name of offence'), c('punishment', '처벌받은 내용', 'Punishment', { wide: true })] }),
      yn('14.11', '귀하 또는 가족이 외국정부나 유엔난민기구(UNHCR)에 난민인정 신청을 한 적이 있나요?', 'Have you or any family members ever applied for refugee status in any other country or at UNHCR?'),
      f('14.11a', '신청 내역', 'Explain the decision and any status received', 'table', { when: YES('14.11'), cols: [c('name', '성명(관계)', 'Name (relationship to you)'), c('date', '신청일자', 'Date of application', { date: true }), c('country', '신청국가', 'Country of asylum claim'), c('decision', '신청결과(인정, 불허 등)', 'Decision (accepted, rejected, etc.)'), c('cancel', '취소ㆍ철회 여부', 'Cancellation or withdrawal')] }),
      f('14.12', '다른 나라에서 난민인정을 받았다면 그 나라를 출국한 이유', 'If you or a family member was recognised as a refugee in another country, explain in detail why you left', 'long', { na: true }),
      yn('14.13', '19세 미만의 미성년자와 함께 난민인정 신청을 하였나요?', 'Did you apply for refugee status with a minor child under 19?'),
      f('14.13a', '미성년자와의 관계', 'If yes, check the correct box', 'choice', {
        when: YES('14.13'),
        opts: [o('both', '귀하는 아이의 부모이고 다른 부모도 한국에 있습니다.', 'You are the child’s parent, and the other parent is in Korea.'), o('notparent', '귀하는 아이의 부모가 아닙니다.', 'You are not the child’s parent.'), o('other-absent', '귀하는 아이의 부모이고 다른 부모는 한국에 있지 않습니다.', 'You are the child’s parent but the other parent is not in Korea.')],
      }),
      yn('14.13b', '아이를 돌보거나 함께 여행하는 것을 허락한 증명서류를 가지고 있나요?', 'Do you have any legal document or written consent allowing you to take care of / travel with the child?', { when: { id: '14.13a', is: ['notparent', 'other-absent'] } }),
      f('14.13c', '증명서류의 종류 (아니요라면 그 이유)', 'If yes, what document(s)? If no, why not?', 'long', { when: { id: '14.13a', is: ['notparent', 'other-absent'] } }),
      f('14.14', '10세 이하 자녀와 함께 신청한 경우, 자녀가 귀국하면 박해를 받을 것이라고 생각하는 이유 (본인 사유와 중복되지 않는 자녀 고유의 사유만)', 'If applying with a child under 10: why the child would be at risk if returned (only reasons specific to the child, not already given in your own claim)', 'long', { na: true }),
      yn('14.15', '본국에 거주하고 있는 가족과 연락하고 있나요?', 'Do you have contact with, or information about, family members remaining in your home country?'),
      f('14.15a', '연락하는 가족·방법·횟수 (연락하지 않는다면 그 이유)', 'If yes: with whom, how and how often. If no: the reason', 'long', { when: { id: '14.15' } }),
      yn('14.16', '난민인정을 신청한 사유를 뒷받침할 서류나 그 밖의 증거물을 가지고 있습니까?', 'Can you provide any documentation or evidence in support of your application?', { tip: 'Seal each document in the Vault before submission so its fingerprint and custody history are on record.' }),
      f('14.16a', '증거 서류', 'If yes, explain in detail', 'table', { when: YES('14.16'), cols: [c('doc', '서류 명', 'Name of document'), c('content', '내용', 'Content', { wide: true }), c('how', '취득경로', 'Method of obtaining'), c('when', '제출예정시기', 'Estimated submission date')] }),
      f('14.17', '한국에서 난민인정 신청에 대해 알게 된 경위 (언제, 어디서, 누구로부터)', 'How did you learn about refugee status application procedures in Korea? (when, where, from whom)', 'long'),
      f('14.18', '입국한 지 1년이 지나서 신청한 경우 그 이유', 'If you did not apply within one year after arriving in Korea, explain why', 'long', { special: 'over1yr', tip: 'Triggered when the application date is more than a year after the last entry date (10.7). Gather the reasons early — illness, fear, lack of information, trauma, family circumstances — with any documents.' }),
    ],
  },
  {
    n: '15', ko: '난민인정 신청 사유 (박해사건을 중심으로)', en: 'Personal Statement (mainly concerning persecution)',
    note: { ko: '위에 적은 사항 외에 추가로 진술하고 싶은 내용을 쓰세요. 필요한 경우 사유서를 별첨할 수 있습니다.', en: 'Write any additional statement about the reasons for applying. It may be completed on a separate sheet of paper.' },
    fields: [
      f('15.1', '개인 진술서', 'Personal statement', 'story', {
        say: 'Now, in your own words and in order, tell me your story: who you are, what happened, why you left, and what you are afraid of.',
        tip: 'Build the statement from the answers above so dates, names and places match exactly. Read it back to the client through the interpreter before they sign; anything they cannot confirm should be removed or corrected.',
        prompts: [
          { ko: '배경 및 신원', en: 'Background and identity' }, { ko: '주요 사건 (날짜·장소·사람을 시간 순으로)', en: 'Key events in chronological order (dates, places, people)' },
          { ko: '본국을 떠난 이유와 경위', en: 'Why and how you left' }, { ko: '귀국 시 두려워하는 것과 그 대상', en: 'What you fear on return and from whom' },
          { ko: '본국에서 보호받을 수 없었던 이유 (경찰·당국, 국내 이전 등)', en: 'Why protection was not available at home (police / authorities, internal relocation)' }, { ko: '그 밖에 심사관이 알아야 할 사항', en: 'Anything else the officer should know' },
        ],
      }),
    ],
  },
  {
    n: '16', ko: '서약 및 제출', en: 'Declaration and Submission',
    note: { ko: '서약란은 신청자 본인이 직접 자필로 작성·서명합니다.', en: 'The applicant handwrites and signs the declaration personally.' },
    fields: [
      f('16.1', '난민신청자 본인이 서약문을 자필로 작성하고 서명함', 'Applicant handwrote the declaration statement and signed', 'check'),
      f('16.2', '대리인·통역인·미성년 보호자가 도운 경우 그 서약란 작성 (성명, 생년월일, 한국 내 주소, 연락처, 서명)', 'If a representative / interpreter / guardian helped: their declaration completed (name, DOB, address in Korea, contact, signature)', 'check'),
      f('16.3', '(선택) 심사 결과를 전자우편 등으로 통보받는 것에 동의', '(Optional) Consent to receive the result by e-mail or other information network', 'check'),
      f('16.4', '개인정보 보호 안내를 설명함 (「개인정보 보호법」에 따라 보호되며 「난민법」에 따른 업무에만 활용)', 'Explained the privacy notice (protected under the Personal Information Protection Act; used only for Refugee Act matters)', 'check'),
      f('16.5', '신청일자·신청인 서명 완료 (「난민법」 제5조제1항 또는 제6조제1항에 따른 신청)', 'Application date and applicant signature completed (Refugee Act Art. 5(1) or 6(1))', 'check'),
    ],
  },
]

export type Rule = { id: string; ko: string; en: string }
/** “Instructions and Note” (pages 1–2) turned into a talk-through checklist for the lawyer. */
export const RULES: { group: { ko: string; en: string }; items: Rule[] }[] = [
  {
    group: { ko: '작성방법', en: 'How to complete' }, items: [
      { id: 'r1', ko: '모든 질문에 거짓 없이 답하고, 해당이 없으면 ‘해당 없음’으로 씁니다.', en: 'Answer every question truthfully; write “non applicable” where it does not apply.' },
      { id: 'r2', ko: '신청서는 한국어나 영어로 작성합니다. 모국어로 작성했다면 한국어/영어 번역본을 함께 제출해야 합니다.', en: 'Write in Korean or English. If written in the mother language, submit a Korean or English translation with the application.' },
      { id: 'r3', ko: '19세 미만 자녀와 함께 신청: 9세 이하는 부모가 ‘1. 실제 인적사항’만 작성하고 대신 서명, 10~18세는 자녀가 전부 작성하고 부모 또는 자녀가 서명합니다.', en: 'Applying with a child under 19: if ≤9, the parent completes only “1. Personal Information” and signs; if 10–18, the child completes the whole form and the parent or child signs.' },
      { id: 'r4', ko: '심사에 참고할 문서·자료는 접수 공무원에게 제출합니다.', en: 'Hand any supporting documents to the receiving officer.' },
    ],
  },
  {
    group: { ko: '신청자의 권리', en: 'Applicant’s rights' }, items: [
      { id: 'r5', ko: '한국어로 충분히 표현하기 어려우면 원하는 언어의 통역을 받을 수 있고, 믿을 수 있는 사람이 면접에 동석할 수 있습니다.', en: 'If the applicant cannot express themselves in Korean: interpretation in the requested language, and a trusted person may attend the interview.' },
      { id: 'r6', ko: '변호사의 조력을 받을 권리가 있습니다.', en: 'The applicant has the right to the assistance of an attorney.' },
      { id: 'r7', ko: '제출 자료와 난민면접조서의 열람·복사를 신청할 수 있습니다.', en: 'The applicant may request perusal or copies of submitted materials and the refugee interview protocol.' },
      { id: 'r8', ko: '「난민법」에 따라 생계비, 주거시설, 의료지원 등을 받을 수 있습니다.', en: 'Under the Refugee Act: living expenses, residential facilities and medical services may be provided.' },
    ],
  },
  {
    group: { ko: '의무 및 유의사항', en: 'Obligations and cautions' }, items: [
      { id: 'r9', ko: '접수 사무소가 언제든 연락할 수 있어야 하며, 연락처·주소가 바뀌면 즉시 알려야 합니다.', en: 'Stay reachable by the Immigration Office and notify any change of phone number or address immediately.' },
      { id: 'r10', ko: '심사에 성실히 응해야 하며, 출석 요구에도 출석하지 않으면 「난민법」 제8조제6항에 따라 심사가 종료될 수 있습니다.', en: 'Participate faithfully; failing to appear for interviews may end the procedure (Refugee Act Art. 8(6)).' },
      { id: 'r11', ko: '거짓 기재·거짓 자료·중요 사실 은폐는 불인정 또는 인정 취소(제22조제1항), 1년 이하 징역 또는 1천만 원 이하 벌금(제47조)의 사유가 됩니다.', en: 'False statements, false documents or concealment may lead to denial, cancellation (Art. 22(1)) and up to 1 year’s imprisonment or a fine up to KRW 10 million (Art. 47).' },
      { id: 'r12', ko: '신청일부터 6개월이 지나면 허가를 받아 취업할 수 있습니다. 6개월 이내 또는 허가 없이 취업하면 「출입국관리법」에 따라 처벌받을 수 있습니다.', en: 'Employment is possible with permission after 6 months from applying; working earlier or without permission can be punished under the Immigration Control Act.' },
      { id: 'r13', ko: '처리기간은 6개월(6개월 범위에서 연장 가능)이며 수수료는 없습니다.', en: 'Processing period: 6 months (extendable by up to 6 months). No fee.' },
    ],
  },
]

export const ATTACHMENTS: Rule[] = [
  { id: 'a1', ko: '여권 또는 외국인등록증 (제시할 수 없으면 그 사유서)', en: 'Passport or Alien Registration Card (if not available, a statement explaining why)' },
  { id: 'a2', ko: '난민인정 심사에 참고할 만한 문서 등 자료 (해당 시)', en: 'Additional documents related to the refugee claim (if applicable)' },
  { id: 'a3', ko: '최근 6개월 이내에 찍은 사진 1장 (3.5cm×4.5cm)', en: 'One photo (35 mm × 45 mm) taken within the last 6 months' },
  { id: 'a4', ko: '모국어로 작성한 부분의 한국어/영어 번역본 (해당 시)', en: 'Korean/English translation of anything written in another language (if applicable)' },
  { id: 'a5', ko: '추가 진술이 있을 경우 본 서식과 같은 크기의 별첨 용지', en: 'Extra sheets of the same size as the form for longer answers (if needed)' },
]

export const PROCEDURE = [
  { ko: '신청서 작성 및 신청', en: 'Application submission', who: 'Applicant' },
  { ko: '신청서 접수', en: 'Receipt', who: 'Officer' },
  { ko: '면접 및 사실조사', en: 'Interview and investigation', who: 'Refugee Status Determination Officer' },
  { ko: '심사결정', en: 'Decision', who: 'Chief of Immigration Office' },
  { ko: '결과통지', en: 'Notice', who: 'Applicant' },
]

export const DEFINITION = {
  ko: '난민이란 인종, 종교, 국적, 특정 사회집단의 구성원인 신분 또는 정치적 견해를 이유로 박해를 받을 수 있다고 인정할 충분한 근거가 있는 공포로 인하여 국적국의 보호를 받을 수 없거나 보호받기를 원하지 않는 외국인 또는 그러한 공포로 인하여 대한민국에 입국하기 전에 거주한 국가로 돌아갈 수 없거나 돌아가기를 원하지 않는 무국적자인 외국인을 말한다.',
  en: 'A refugee is an alien who is unable or unwilling to avail themselves of the protection of their country of nationality owing to a well-founded fear of being persecuted for reasons of race, religion, nationality, membership of a particular social group or political opinion; or who, not having a nationality, is unable or, owing to such fear, unwilling to return to the country of former residence prior to entry into the Republic of Korea.',
}
