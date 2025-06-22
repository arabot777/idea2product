// ID photo specification constants - grouped by category
export const ID_PHOTO_CATEGORIES = {
  common: {
    nameKey: 'common',
    name: 'Common Photos', // backward compatibility
    specs: [
      { id: '1inch', width: 295, height: 413, nameKey: 'oneInch', name: '1-Inch Photo', description: '25×35mm', usage: 'ID Card, Resume', mmWidth: 25, mmHeight: 35 },
      { id: '2inch', width: 413, height: 579, nameKey: 'twoInch', name: '2-Inch Photo', description: '35×49mm', usage: 'Resume, Documents', mmWidth: 35, mmHeight: 49 },
      { id: 'small1inch', width: 260, height: 378, nameKey: 'smallOneInch', name: 'Small 1-Inch', description: '22×32mm', usage: 'Student ID, Work ID', mmWidth: 22, mmHeight: 32 },
      { id: 'large1inch', width: 390, height: 567, nameKey: 'largeOneInch', name: 'Large 1-Inch', description: '33×48mm', usage: 'Resume, Documents', mmWidth: 33, mmHeight: 48 },
    ]
  },
  passport: {
    nameKey: 'passport',
    name: 'Passport & Visa', // backward compatibility
    specs: [
      { id: 'passport-cn', width: 390, height: 567, nameKey: 'passportChina', name: 'China Passport', description: '33×48mm', usage: 'China Passport', mmWidth: 33, mmHeight: 48 },
      { id: 'passport-us', width: 600, height: 600, nameKey: 'passportUS', name: 'US Passport', description: '51×51mm', usage: 'US Passport', mmWidth: 51, mmHeight: 51 },
      { id: 'visa-us', width: 600, height: 600, nameKey: 'visaUS', name: 'US Visa', description: '51×51mm', usage: 'US Visa', mmWidth: 51, mmHeight: 51 },
      { id: 'visa-guide', width: 285, height: 385, nameKey: 'tourGuide', name: 'Tour Guide License', description: '24×33mm', usage: 'Tour Guide', mmWidth: 24, mmHeight: 33 },
    ]
  },
  exam: {
    nameKey: 'exam',
    name: 'Exam Photos', // backward compatibility
    specs: [
      { id: 'exam-teacher', width: 295, height: 413, nameKey: 'teacherLicense', name: 'Teacher License', description: '25×35mm', usage: 'Teacher License', mmWidth: 25, mmHeight: 35 },
      { id: 'exam-cpa', width: 413, height: 531, nameKey: 'cpaExam', name: 'CPA Exam', description: '35×45mm', usage: 'CPA Exam', mmWidth: 35, mmHeight: 45 },
      { id: 'exam-law', width: 413, height: 626, nameKey: 'lawExam', name: 'Law Exam', description: '35×53mm', usage: 'Law Exam', mmWidth: 35, mmHeight: 53 },
      { id: 'exam-civil', width: 295, height: 413, nameKey: 'civilService', name: 'Civil Service', description: '25×35mm', usage: 'Civil Service', mmWidth: 25, mmHeight: 35 },
    ]
  }
};

// Flattened specs array (backward compatibility)
export const ID_PHOTO_SPECS = [
  ...ID_PHOTO_CATEGORIES.common.specs,
  ...ID_PHOTO_CATEGORIES.passport.specs,
  ...ID_PHOTO_CATEGORIES.exam.specs,
];

// AI background colors for generation (participate in generation process)
export const AI_BACKGROUNDS = [
  { nameKey: 'white', name: 'White', value: '#FFFFFF', textColor: '#000000' },
  { nameKey: 'blue', name: 'Blue', value: '#2072B8', textColor: '#FFFFFF' },
  { nameKey: 'red', name: 'Red', value: '#E30E19', textColor: '#FFFFFF' },
  { nameKey: 'gray', name: 'Gray', value: '#CCCCCC', textColor: '#000000' },
  { nameKey: 'green', name: 'Green', value: '#009944', textColor: '#FFFFFF' },
  { nameKey: 'pink', name: 'Pink', value: '#FFC0CB', textColor: '#000000' },
];

// Frontend background colors for replacement (more choices)
export const FRONTEND_BACKGROUNDS = [
  { nameKey: 'pureWhite', name: 'Pure White', value: '#FFFFFF', textColor: '#000000' },
  { nameKey: 'ivoryWhite', name: 'Ivory White', value: '#FFFEF7', textColor: '#000000' },
  { nameKey: 'standardBlue', name: 'Standard Blue', value: '#2072B8', textColor: '#FFFFFF' },
  { nameKey: 'darkBlue', name: 'Dark Blue', value: '#1C4B82', textColor: '#FFFFFF' },
  { nameKey: 'skyBlue', name: 'Sky Blue', value: '#5DADE2', textColor: '#000000' },
  { nameKey: 'standardRed', name: 'Standard Red', value: '#E30E19', textColor: '#FFFFFF' },
  { nameKey: 'darkRed', name: 'Dark Red', value: '#B71C1C', textColor: '#FFFFFF' },
  { nameKey: 'lightGray', name: 'Light Gray', value: '#CCCCCC', textColor: '#000000' },
  { nameKey: 'mediumGray', name: 'Medium Gray', value: '#9E9E9E', textColor: '#000000' },
  { nameKey: 'darkGray', name: 'Dark Gray', value: '#424242', textColor: '#FFFFFF' },
  { nameKey: 'standardGreen', name: 'Standard Green', value: '#009944', textColor: '#FFFFFF' },
  { nameKey: 'darkGreen', name: 'Dark Green', value: '#1B5E20', textColor: '#FFFFFF' },
  { nameKey: 'pink', name: 'Pink', value: '#FFC0CB', textColor: '#000000' },
  { nameKey: 'lightPink', name: 'Light Pink', value: '#F8BBD9', textColor: '#000000' },
];

// Backward compatibility
export const ID_PHOTO_BACKGROUNDS = AI_BACKGROUNDS;

// Layout sizes (photo paper specifications)
export const LAYOUT_SIZES = [
  { 
    id: '5inch', 
    nameKey: 'fiveInchPaper', 
    name: '5-Inch Paper',
    width: 1500, 
    height: 1050, 
    description: '127×89mm',
    mmWidth: 127,
    mmHeight: 89
  },
  { 
    id: '6inch', 
    nameKey: 'sixInchPaper', 
    name: '6-Inch Paper',
    width: 1800, 
    height: 1200, 
    description: '152×102mm',
    mmWidth: 152,
    mmHeight: 102
  },
  { 
    id: 'a4', 
    nameKey: 'a4Paper', 
    name: 'A4 Paper',
    width: 2480, 
    height: 3508, 
    description: '210×297mm',
    mmWidth: 210,
    mmHeight: 297
  }
]; 

// Helper function to get localized text
export const getLocalizedText = (t: any, item: any, fallbackName?: string) => {
  if (item.nameKey) {
    // Try different namespaces
    try {
      return t(`categories.${item.nameKey}`) || t(`colors.${item.nameKey}`) || t(`sizes.${item.nameKey}`) || fallbackName || item.name || item.nameKey;
    } catch (error) {
      // If internationalization fails, return fallback name
      return fallbackName || item.name || item.nameKey;
    }
  }
  return fallbackName || item.name || item.nameKey;
}; 