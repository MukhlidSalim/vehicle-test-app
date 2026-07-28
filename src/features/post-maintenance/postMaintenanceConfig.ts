import { 
  ACIcon, DoorsStepsIcon, IVMSIcon, LampIcon, WiperIcon, BrakesIcon, SteeringIcon, WheelIcon,
  BatteryIcon, FluidsIcon, CustomBeltsIcon, CustomToiletIcon, VehicleBodyIcon, FireExtIcon, CustomPassengerSeatsIcon
} from '../../constants/icons';
import { PostMaintenanceItem } from '../../types';

export interface PostMaintenanceConfigItem {
  id: string;
  labelEn: string;
  labelAr: string;
  icon?: any;
}

export const SECTION_A_ITEMS: PostMaintenanceConfigItem[] = [
  { id: 'a_1', labelEn: 'The original reported defect has been physically inspected and is no longer present', labelAr: 'تم الفحص الفعلي للعطل المبلغ عنه ولم يعد موجوداً' },
  { id: 'a_2', labelEn: 'The repaired/replaced component is correctly installed, secure and free from damage', labelAr: 'الجزء الذي تم إصلاحه/استبداله مركب بشكل صحيح، آمن، وخالٍ من الأضرار' },
  { id: 'a_3', labelEn: 'The repaired system operates correctly under normal operating conditions', labelAr: 'النظام الذي تم إصلاحه يعمل بشكل صحيح تحت ظروف التشغيل العادية' },
  { id: 'a_4', labelEn: 'No warning light, fault code or abnormal indication remains on the instrument panel', labelAr: 'لا توجد أضواء تحذير، رموز أعطال، أو إشارات غير طبيعية متبقية في لوحة العدادات' },
  { id: 'a_5', labelEn: 'No abnormal noise, vibration, smell, overheating or leakage is present', labelAr: 'لا توجد أصوات غير طبيعية، اهتزازات، روائح، حرارة زائدة، أو تسريبات' },
  { id: 'a_6', labelEn: 'No temporary repair, loose connection or exposed wiring is evident', labelAr: 'لا يوجد إصلاح مؤقت، توصيلات غير محكمة، أو أسلاك مكشوفة' },
  { id: 'a_7', labelEn: 'Nearby components were not damaged or disturbed during the maintenance work', labelAr: 'الأجزاء المجاورة لم تتضرر أو تتأثر أثناء أعمال الصيانة' },
  { id: 'a_8', labelEn: 'Rectification details and replaced parts match the maintenance job card', labelAr: 'تفاصيل الإصلاح والأجزاء المستبدلة تتطابق مع كرت عمل الصيانة' },
];

export const SECTION_B_ITEMS: PostMaintenanceConfigItem[] = [
  { id: 'b_1', labelEn: 'A/C cools properly throughout the bus; blower, fan, belts and A/C filters are clean and operate without noise', labelAr: 'مكيف الهواء يبرد بشكل صحيح؛ المروحة، السيور، وفلاتر التكييف نظيفة وتعمل بلا ضوضاء', icon: ACIcon },
  { id: 'b_2', labelEn: 'Front, rear, emergency and luggage doors and door switches operate, close and seal correctly without air leaks', labelAr: 'الأبواب الأمامية، الخلفية، أبواب الطوارئ، والأمتعة ومفاتيحها تعمل وتُغلق بإحكام بلا تسرب هواء', icon: DoorsStepsIcon },
  { id: 'b_3', labelEn: 'Driver seat and air-pressure adjustment remain stable and fully functional', labelAr: 'مقعد السائق وضبط ضغط الهواء ثابت ويعمل بكفاءة تامة', icon: CustomPassengerSeatsIcon },
  { id: 'b_4', labelEn: 'Reverse camera, display panel, IVMS and VIVMS/Guardian cameras operate correctly', labelAr: 'الكاميرا الخلفية، شاشة العرض، وكاميرات IVMS/Guardian تعمل بشكل صحيح', icon: IVMSIcon },
  { id: 'b_5', labelEn: 'Headlights, fog/LED/parking lights, indicators, brake/reversing lights and light switches operate correctly', labelAr: 'المصابيح الأمامية، كشافات الضباب، الإشارات، مصابيح الفرامل، ومفاتيح الإضاءة تعمل بشكل صحيح', icon: LampIcon },
  { id: 'b_6', labelEn: 'Wiper blades, washer pump, washer tank and spray system operate without leakage', labelAr: 'المساحات، مضخة الغسيل، خزان المياه، ونظام الرش تعمل بلا تسريبات', icon: WiperIcon },
  { id: 'b_7', labelEn: 'Brakes and ABS operate normally with no warning, pulling, vibration or abnormal noise', labelAr: 'الفرامل ونظام ABS تعمل بشكل طبيعي بدون تحذيرات، انحراف، اهتزازات أو أصوات غريبة', icon: BrakesIcon },
  { id: 'b_8', labelEn: 'Steering, wheel alignment and gear selector operate smoothly with no vibration or warning', labelAr: 'نظام التوجيه (الدركسون)، ميزانية العجلات، ومبدل التروس تعمل بسلاسة بلا اهتزاز أو تحذير', icon: SteeringIcon },
  { id: 'b_9', labelEn: 'Tyres, wheel hubs and bearings are secure and undamaged; tyre pressure is checked and recorded in PSI', labelAr: 'الإطارات، محاور العجلات، والمحامل آمنة وسليمة؛ تم فحص ضغط الإطارات', icon: WheelIcon },
  { id: 'b_10', labelEn: 'Battery, terminals, charging and associated electrical connections are secure and operational', labelAr: 'البطارية، الأقطاب، نظام الشحن، والتوصيلات الكهربائية آمنة وتعمل بشكل سليم', icon: BatteryIcon },
  { id: 'b_11', labelEn: 'Engine oil, hydraulic oil, fuel, coolant and other fluid systems are free from leakage', labelAr: 'زيت المحرك، الزيت الهيدروليكي، الوقود، سائل التبريد، وباقي السوائل خالية من التسريبات', icon: FluidsIcon },
  { id: 'b_12', labelEn: 'Radiator fan, bearings, belts and hoses operate correctly; engine air filter is clean, secure and serviceable', labelAr: 'مروحة الردياتير، السيور، والخراطيم تعمل بشكل صحيح؛ فلتر هواء المحرك نظيف وآمن', icon: CustomBeltsIcon },
  { id: 'b_13', labelEn: 'Toilet flushing, water/waste tanks and exhaust fan operate correctly without leakage', labelAr: 'نظام طرد مياه المرحاض، خزانات المياه/النفايات، ومروحة الشفط تعمل بشكل صحيح بلا تسريب', icon: CustomToiletIcon },
  { id: 'b_14', labelEn: 'Bus interior and exterior are clean; bonnet, body panels, windows, mirrors and fuel-tank cover are secure and undamaged', labelAr: 'الجزء الداخلي والخارجي للحافلة نظيف؛ غطاء المحرك، الهيكل، النوافذ، المرايا آمنة وسليمة', icon: VehicleBodyIcon },
  { id: 'b_15', labelEn: 'Fire extinguisher and disturbed safety equipment are restored, secured and within validity', labelAr: 'طفاية الحريق ومعدات السلامة تم إرجاعها وتأمينها وضمن فترة الصلاحية', icon: FireExtIcon },
];

export const SECTION_C_ITEMS: PostMaintenanceConfigItem[] = [
  { id: 'c_1', labelEn: 'Engine starts normally and idles without warning lights or abnormal noise', labelAr: 'المحرك يعمل بشكل طبيعي ويدور بسلاسة بدون أضواء تحذيرية أو أصوات غريبة' },
  { id: 'c_2', labelEn: 'Bus accelerates and changes gears smoothly under operating conditions', labelAr: 'الحافلة تتسارع وتبدل التروس بسلاسة تحت ظروف التشغيل' },
  { id: 'c_3', labelEn: 'Service brake and parking brake perform correctly during the road test', labelAr: 'فرامل الخدمة وفرامل الوقوف (الجلنط) تؤدي وظيفتها بشكل صحيح أثناء تجربة القيادة' },
  { id: 'c_4', labelEn: 'Steering remains stable; no pulling, wheel vibration or unusual tyre noise is detected', labelAr: 'نظام التوجيه مستقر؛ لا يوجد انحراف، اهتزاز في العجلات، أو أصوات غير عادية للإطارات' },
  { id: 'c_5', labelEn: 'The original defect does not recur during or immediately after the road test', labelAr: 'العطل الأصلي لم يظهر مجدداً أثناء أو بعد تجربة القيادة مباشرةً' },
  { id: 'c_6', labelEn: 'A final walk-around confirms no new leak, loose part, heat, smell or damage', labelAr: 'الفحص النهائي لمحيط الحافلة يؤكد عدم وجود تسريب جديد، أجزاء مفكوكة، حرارة، رائحة، أو أضرار' },
];

export const getInitialData = (): import('../../types').PostMaintenanceData => ({
  vehicleRegNo: '',
  dateSent: '',
  dateReturned: new Date().toISOString().split('T')[0],
  kmReading: '',
  workshop: '',
  jobCardNo: '',
  reportedDefect: '',
  priority: null,
  repairDetails: '',
  inspectorName: '',
  sectionA: SECTION_A_ITEMS.map(item => ({ id: item.id, status: null, remarks: '' })),
  sectionB: SECTION_B_ITEMS.map(item => ({ id: item.id, status: null, remarks: '' })),
  sectionC: SECTION_C_ITEMS.map(item => ({ id: item.id, status: null, remarks: '' })),
  finalStatus: null,
  outstandingItems: '',
  signatures: {}
});
