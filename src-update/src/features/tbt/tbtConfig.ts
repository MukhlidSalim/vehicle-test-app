export interface TbtTopic {
  id: string;
  categoryEn: string;
  categoryAr: string;
  pointsEn: string[];
  pointsAr: string[];
}

export const TBT_TOPICS: TbtTopic[] = [
  {
    id: 'driver_fitness',
    categoryEn: 'Driver Fitness',
    categoryAr: 'اللياقة الصحية للسائق',
    pointsEn: [
      'Medical Fitness to Drive',
      'Reporting Health Issues',
      'Use of Prescribed Medication',
      'Fatigue Awareness',
      'Sufficient Sleep and Rest',
      'Alcohol and drug use'
    ],
    pointsAr: [
      'اللياقة الطبية للقيادة',
      'الإبلاغ عن المشاكل الصحية',
      'استخدام الأدوية الموصوفة',
      'الوعي بمخاطر الإرهاق',
      'الحصول على قسط كافٍ من النوم والراحة',
      'تجنب الكحول والمخدرات'
    ]
  },
  {
    id: 'vehicle_readiness',
    categoryEn: 'Vehicle Readiness',
    categoryAr: 'جاهزية المركبة',
    pointsEn: [
      '360° check & Vehicle Inspection',
      'Vehicle Defects Reporting',
      'Tyre Condition',
      'Emergency & Safety Equipment',
      'Loose Items in Vehicle',
      'Communication Equipment'
    ],
    pointsAr: [
      'فحص 360 درجة وفحص المركبة',
      'الإبلاغ عن أعطال المركبة',
      'حالة الإطارات',
      'معدات الطوارئ والسلامة',
      'المواد غير المثبتة في المركبة',
      'معدات التواصل'
    ]
  },
  {
    id: 'journey_management',
    categoryEn: 'Journey Management',
    categoryAr: 'إدارة الرحلة',
    pointsEn: [
      'Journey Management Plan',
      'Planned Rest Breaks',
      'Driver and Vehicle Documents',
      'Bus Toilet use During Motion',
      'Night Driving',
      'Reporting IVMS/VIVMS Issues'
    ],
    pointsAr: [
      'خطة إدارة الرحلة',
      'أوقات الراحة المجدولة',
      'وثائق السائق والمركبة',
      'استخدام دورة مياه الحافلة أثناء الحركة',
      'القيادة الليلية',
      'الإبلاغ عن أعطال نظام تتبع المركبات (IVMS)'
    ]
  },
  {
    id: 'driver_behaviour',
    categoryEn: 'Driver Behaviour',
    categoryAr: 'سلوك السائق',
    pointsEn: [
      'Defensive Driving Techniques',
      'Speed Management',
      'Safe Following Distance',
      'Seatbelt Use',
      'Mobile Phone Use',
      'Role of Co-Driver'
    ],
    pointsAr: [
      'أساليب القيادة الوقائية',
      'إدارة السرعة',
      'مسافة التتابع الآمنة',
      'استخدام حزام الأمان',
      'استخدام الهاتف المحمول',
      'دور السائق المساعد'
    ]
  },
  {
    id: 'road_weather',
    categoryEn: 'Road and Weather Conditions',
    categoryAr: 'حالة الطريق والطقس',
    pointsEn: [
      'Poor Weather Conditions',
      'Poor Road Conditions',
      'Driving Through Detours',
      'Adhering to Road Signs',
      'Other Road Users',
      'Reporting Unsafe Road Conditions'
    ],
    pointsAr: [
      'الظروف الجوية السيئة',
      'حالة الطريق السيئة',
      'القيادة في التحويلات المرورية',
      'الالتزام باللوحات الإرشادية',
      'مستخدمو الطريق الآخرين',
      'الإبلاغ عن ظروف الطريق غير الآمنة'
    ]
  }
];
