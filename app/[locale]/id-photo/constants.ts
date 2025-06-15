// 证件照规格常量 - 按类别分组
export const ID_PHOTO_CATEGORIES = {
  common: {
    nameKey: 'common',
    name: '普通寸照', // 向后兼容
    specs: [
      { id: '1inch', width: 295, height: 413, nameKey: 'oneInch', name: '一寸照', description: '25×35mm', usage: 'ID Card, Resume', mmWidth: 25, mmHeight: 35 },
      { id: '2inch', width: 413, height: 579, nameKey: 'twoInch', name: '二寸照', description: '35×49mm', usage: 'Resume, Documents', mmWidth: 35, mmHeight: 49 },
      { id: 'small1inch', width: 260, height: 378, nameKey: 'smallOneInch', name: '小一寸', description: '22×32mm', usage: 'Student ID, Work ID', mmWidth: 22, mmHeight: 32 },
      { id: 'large1inch', width: 390, height: 567, nameKey: 'largeOneInch', name: '大一寸', description: '33×48mm', usage: 'Resume, Documents', mmWidth: 33, mmHeight: 48 },
    ]
  },
  passport: {
    nameKey: 'passport',
    name: '护照签证', // 向后兼容
    specs: [
      { id: 'passport-cn', width: 390, height: 567, nameKey: 'passportChina', name: '中国护照', description: '33×48mm', usage: 'China Passport', mmWidth: 33, mmHeight: 48 },
      { id: 'passport-us', width: 600, height: 600, nameKey: 'passportUS', name: '美国护照', description: '51×51mm', usage: 'US Passport', mmWidth: 51, mmHeight: 51 },
      { id: 'visa-us', width: 600, height: 600, nameKey: 'visaUS', name: '美国签证', description: '51×51mm', usage: 'US Visa', mmWidth: 51, mmHeight: 51 },
      { id: 'visa-guide', width: 285, height: 385, nameKey: 'tourGuide', name: '导游证', description: '24×33mm', usage: 'Tour Guide', mmWidth: 24, mmHeight: 33 },
    ]
  },
  exam: {
    nameKey: 'exam',
    name: '考试照片', // 向后兼容
    specs: [
      { id: 'exam-teacher', width: 295, height: 413, nameKey: 'teacherLicense', name: '教师资格证', description: '25×35mm', usage: 'Teacher License', mmWidth: 25, mmHeight: 35 },
      { id: 'exam-cpa', width: 413, height: 531, nameKey: 'cpaExam', name: '注册会计师', description: '35×45mm', usage: 'CPA Exam', mmWidth: 35, mmHeight: 45 },
      { id: 'exam-law', width: 413, height: 626, nameKey: 'lawExam', name: '国家司法考试', description: '35×53mm', usage: 'Law Exam', mmWidth: 35, mmHeight: 53 },
      { id: 'exam-civil', width: 295, height: 413, nameKey: 'civilService', name: '公务员考试', description: '25×35mm', usage: 'Civil Service', mmWidth: 25, mmHeight: 35 },
    ]
  }
};

// 扁平化的规格数组（向后兼容）
export const ID_PHOTO_SPECS = [
  ...ID_PHOTO_CATEGORIES.common.specs,
  ...ID_PHOTO_CATEGORIES.passport.specs,
  ...ID_PHOTO_CATEGORIES.exam.specs,
];

// AI生图用的背景颜色（参与生图过程）
export const AI_BACKGROUNDS = [
  { nameKey: 'white', name: '白色', value: '#FFFFFF', textColor: '#000000' },
  { nameKey: 'blue', name: '蓝色', value: '#2072B8', textColor: '#FFFFFF' },
  { nameKey: 'red', name: '红色', value: '#E30E19', textColor: '#FFFFFF' },
  { nameKey: 'gray', name: '灰色', value: '#CCCCCC', textColor: '#000000' },
  { nameKey: 'green', name: '绿色', value: '#009944', textColor: '#FFFFFF' },
  { nameKey: 'pink', name: '粉色', value: '#FFC0CB', textColor: '#000000' },
];

// 前端替换用的背景颜色（更多选择）
export const FRONTEND_BACKGROUNDS = [
  { nameKey: 'pureWhite', name: '纯白', value: '#FFFFFF', textColor: '#000000' },
  { nameKey: 'ivoryWhite', name: '象牙白', value: '#FFFEF7', textColor: '#000000' },
  { nameKey: 'standardBlue', name: '标准蓝', value: '#2072B8', textColor: '#FFFFFF' },
  { nameKey: 'darkBlue', name: '深蓝', value: '#1C4B82', textColor: '#FFFFFF' },
  { nameKey: 'skyBlue', name: '天蓝', value: '#5DADE2', textColor: '#000000' },
  { nameKey: 'standardRed', name: '标准红', value: '#E30E19', textColor: '#FFFFFF' },
  { nameKey: 'darkRed', name: '深红', value: '#B71C1C', textColor: '#FFFFFF' },
  { nameKey: 'lightGray', name: '浅灰', value: '#CCCCCC', textColor: '#000000' },
  { nameKey: 'mediumGray', name: '中灰', value: '#9E9E9E', textColor: '#000000' },
  { nameKey: 'darkGray', name: '深灰', value: '#424242', textColor: '#FFFFFF' },
  { nameKey: 'standardGreen', name: '标准绿', value: '#009944', textColor: '#FFFFFF' },
  { nameKey: 'darkGreen', name: '深绿', value: '#1B5E20', textColor: '#FFFFFF' },
  { nameKey: 'pink', name: '粉色', value: '#FFC0CB', textColor: '#000000' },
  { nameKey: 'lightPink', name: '浅粉', value: '#F8BBD9', textColor: '#000000' },
];

// 向后兼容
export const ID_PHOTO_BACKGROUNDS = AI_BACKGROUNDS;

// 排版尺寸（相纸规格）
export const LAYOUT_SIZES = [
  { 
    id: '5inch', 
    nameKey: 'fiveInchPaper', 
    name: '5寸相纸',
    width: 1500, 
    height: 1050, 
    description: '127×89mm',
    mmWidth: 127,
    mmHeight: 89
  },
  { 
    id: '6inch', 
    nameKey: 'sixInchPaper', 
    name: '6寸相纸',
    width: 1800, 
    height: 1200, 
    description: '152×102mm',
    mmWidth: 152,
    mmHeight: 102
  },
  { 
    id: 'a4', 
    nameKey: 'a4Paper', 
    name: 'A4纸张',
    width: 2480, 
    height: 3508, 
    description: '210×297mm',
    mmWidth: 210,
    mmHeight: 297
  }
]; 

// 获取本地化文本的辅助函数
export const getLocalizedText = (t: any, item: any, fallbackName?: string) => {
  if (item.nameKey) {
    // 尝试不同的命名空间
    try {
      return t(`categories.${item.nameKey}`) || t(`colors.${item.nameKey}`) || t(`sizes.${item.nameKey}`) || fallbackName || item.name || item.nameKey;
    } catch (error) {
      // 如果国际化失败，返回备用名称
      return fallbackName || item.name || item.nameKey;
    }
  }
  return fallbackName || item.name || item.nameKey;
}; 