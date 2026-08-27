import { 
  ACIcon, DoorsStepsIcon, IVMSIcon, LampIcon, WiperIcon, BrakesIcon, SteeringIcon, WheelIcon,
  BatteryIcon, FluidsIcon, CustomBeltsIcon, CustomToiletIcon, VehicleBodyIcon, FireExtIcon, CustomPassengerSeatsIcon, EngineIcon
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
  { id: 'a_3', labelEn: 'The repaired system operates correctly during the functional check and the defect does not recur', labelAr: 'النظام الذي تم إصلاحه يعمل بشكل صحيح أثناء الفحص الوظيفي والعطل لا يتكرر' },
  { id: 'a_4', labelEn: 'No abnormal noise, vibration, smell, overheating, leakage, loose part or new damage is present', labelAr: 'لا توجد أصوات غير طبيعية، اهتزازات، روائح، حرارة، تسريبات، أجزاء مفكوكة أو أضرار جديدة' },
  { id: 'a_5', labelEn: 'No temporary repair, loose connection or exposed wiring is evident', labelAr: 'لا يوجد إصلاح مؤقت، توصيلات غير محكمة، أو أسلاك مكشوفة' },
  { id: 'a_6', labelEn: 'Nearby components were not damaged or disturbed during the maintenance work', labelAr: 'الأجزاء المجاورة لم تتضرر أو تتأثر أثناء أعمال الصيانة' },
  { id: 'a_7', labelEn: 'Rectification details and replaced parts match the maintenance job card', labelAr: 'تفاصيل الإصلاح والأجزاء المستبدلة تتطابق مع كرت عمل الصيانة' },
];

export const SECTION_B_ITEMS: PostMaintenanceConfigItem[] = [
  { id: 'b_1', labelEn: 'A/C cools properly throughout the bus; blower, fan, belts and A/C filters are clean and operate without noise', labelAr: 'مكيف الهواء يبرد بشكل صحيح؛ المروحة، السيور، وفلاتر التكييف نظيفة وتعمل بلا ضوضاء', icon: ACIcon },
  { id: 'b_2', labelEn: 'Front, rear, emergency and luggage doors and door switches operate, close and seal correctly without air leaks', labelAr: 'الأبواب الأمامية، الخلفية، أبواب الطوارئ، والأمتعة ومفاتيحها تعمل وتُغلق بإحكام بلا تسرب هواء', icon: DoorsStepsIcon },
  { id: 'b_3', labelEn: 'Driver seat and air-pressure adjustment remain stable and fully functional', labelAr: 'مقعد السائق وضبط ضغط الهواء ثابت ويعمل بكفاءة تامة', icon: CustomPassengerSeatsIcon },
  { id: 'b_4', labelEn: 'Engine starts normally and idles without abnormal noise, vibration, leakage or overheating', labelAr: 'المحرك يعمل بشكل طبيعي ويدور بسلاسة بدون أصوات غريبة، اهتزاز، تسريب أو حرارة', icon: EngineIcon },
  { id: 'b_5', labelEn: 'Reverse camera, reversing sensor, display panel, IVMS and VIVMS/Guardian cameras operate correctly', labelAr: 'الكاميرا الخلفية، حساسات الرجوع، شاشة العرض، وكاميرات IVMS/Guardian تعمل بشكل صحيح', icon: IVMSIcon },
  { id: 'b_6', labelEn: 'Headlights, fog/LED/parking lights, indicators, brake/reversing lights and light switches operate correctly', labelAr: 'المصابيح الأمامية، كشافات الضباب، الإشارات، مصابيح الفرامل، ومفاتيح الإضاءة تعمل بشكل صحيح', icon: LampIcon },
  { id: 'b_7', labelEn: 'Wiper blades, washer pump, washer tank and spray system operate without leakage', labelAr: 'المساحات، مضخة الغسيل، خزان المياه، ونظام الرش تعمل بلا تسريبات', icon: WiperIcon },
  { id: 'b_8', labelEn: 'Tyres and wheel hubs are secure and free from visible damage; tyre pressure is checked and recorded in PSI', labelAr: 'الإطارات ومحاور العجلات آمنة وسليمة؛ تم فحص ضغط الإطارات وتسجيله', icon: WheelIcon },
  { id: 'b_9', labelEn: 'Battery and terminals are secure and free from visible damage or corrosion', labelAr: 'البطارية والأقطاب آمنة وخالية من الأضرار المرئية أو التآكل', icon: BatteryIcon },
  { id: 'b_10', labelEn: 'Engine oil, hydraulic oil, fuel, coolant and other fluid systems are free from leakage', labelAr: 'زيت المحرك، الزيت الهيدروليكي، الوقود، سائل التبريد، وباقي السوائل خالية من التسريبات', icon: FluidsIcon },
  { id: 'b_11', labelEn: 'Belts and hoses are secure and free from visible damage; engine air filter is clean and serviceable', labelAr: 'السيور والخراطيم آمنة وسليمة؛ فلتر هواء المحرك نظيف وقابل للاستخدام', icon: CustomBeltsIcon },
  { id: 'b_12', labelEn: 'Toilet flushing, water/waste tanks and exhaust fan operate correctly without leakage', labelAr: 'نظام طرد مياه المرحاض، خزانات المياه/النفايات، ومروحة الشفط تعمل بشكل صحيح بلا تسريب', icon: CustomToiletIcon },
  { id: 'b_13', labelEn: 'Bus interior and exterior are clean; bonnet, body panels, windows, mirrors and fuel-tank cover are secure and undamaged', labelAr: 'الجزء الداخلي والخارجي للحافلة نظيف؛ غطاء المحرك، الهيكل، النوافذ، المرايا آمنة وسليمة', icon: VehicleBodyIcon },
  { id: 'b_14', labelEn: 'Fire extinguisher and disturbed safety equipment are restored, secured and within validity', labelAr: 'طفاية الحريق ومعدات السلامة تم إرجاعها وتأمينها وضمن فترة الصلاحية', icon: FireExtIcon },
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
  finalStatus: null,
  outstandingItems: '',
  signatures: {}
});
