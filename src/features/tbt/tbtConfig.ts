export interface TbtPoint {
  title: string;
  desc: string;
}

export interface TbtTopic {
  id: string;
  categoryEn: string;
  categoryAr: string;
  introEn?: string;
  introAr?: string;
  pointsEn: TbtPoint[];
  pointsAr: TbtPoint[];
  incidentsEn?: string[];
  incidentsAr?: string[];
  takeawayEn?: string;
  takeawayAr?: string;
}

export const TBT_TOPICS: TbtTopic[] = [
  {
    id: 'driver_behaviour',
    categoryEn: 'Driver Behaviour',
    categoryAr: 'سلوك السائق أثناء القيادة',
    introEn: 'Driver behaviour is one of the main causes of road incidents. Most incidents happen due to driver actions, not road or vehicle conditions. Using correct driving techniques, staying focused, and making safe decisions are key to protecting everyone in the vehicle and other road users.',
    introAr: 'يُعد سلوك السائق من العوامل الأساسية في السلامة على الطرق، حيث إن معظم الحوادث تكون نتيجة مباشرة لتصرفات السائق وليس بسبب حالة الطريق أو المركبة. إن اتباع أساليب القيادة السليمة، والحفاظ على التركيز، واتخاذ قرارات صحيحة يُعد أمرًا ضروريًا لضمان سلامة الركاب ومستخدمي الطريق الآخرين.',
    pointsEn: [
      { title: 'Defensive Driving Techniques', desc: 'Always scan the road ahead for risks such as sudden lane changes, vehicles entering from side roads, or animals crossing, and plan an escape route before they happen.' },
      { title: 'Speed Management', desc: 'Stay within speed limits at all times and reduce speed early when entering lower-speed zones, junctions, or approaching curves. Avoid remaining above the limit beyond the 30-second allowance.' },
      { title: 'Safe Following Distance', desc: 'Keep a safe gap from the vehicle ahead to allow enough time to react, and increase this distance in rain, dust, or fog. Tailgating is a major cause of rear-end collisions.' },
      { title: 'Seatbelt Use', desc: 'Ensure you and all passengers have seatbelts fastened before moving. Do not start the journey until everyone is secured.' },
      { title: 'Mobile Phone Use', desc: 'Do not use handheld devices while driving. If a call is necessary, stop in a safe and legal place before answering or making it.' },
      { title: 'Distraction', desc: 'Stay fully focused on driving. Avoid adjusting devices, eating, or having long conversations that reduce attention, especially during critical manoeuvres.' },
      { title: 'Role of Co-Driver', desc: 'Stay alert and actively support the driver. Clearly communicate hazards, speed changes, at junctions, traffic lights and in heavy traffic.' }
    ],
    pointsAr: [
      { title: 'أسلوب القيادة الوقائية', desc: 'راقب الطريق دائمًا، توقّع تصرفات السائقين الآخرين، وكن مستعدًا لتفادي الخطر.' },
      { title: 'التحكم في السرعة', desc: 'التزم بحدود السرعة، وخفّف السرعة عند الاقتراب من المنعطفات، التقاطعات، أو عند القيادة في أجواء ماطرة أو مغبرة أو في حال ضعف الرؤية.' },
      { title: 'ترك مسافة أمان', desc: 'حافظ على مسافة كافية (3 ثوانٍ على الأقل) بينك وبين المركبة التي أمامك لتتمكن من التوقف بأمان. في حاالت المطر أو الغبار أو الضباب، قم بزيادة هذه المسافة.' },
      { title: 'استخدام حزام الأمان', desc: 'تأكد من أنك وجميع الركاب قد ربطتم أحزمة الأمان قبل تحرّك المركبة.' },
      { title: 'استخدام الهاتف المحمول', desc: 'لا تستخدم الهاتف المحمول أثناء القيادة باليد أو في وضعية مكبر الصوت. توقف في مكان آمن إذا احتجت إلى إجراء أو استقبال مكالمة.' },
      { title: 'الانشغال أثناء القيادة', desc: 'تجنّب أي تصرف قد يُشتّت انتباهك عن الطريق. حافظ على تركيزك، واجعل المحادثات داخل المركبة قصيرة وواضحة.' },
      { title: 'دور السائق المساعد', desc: 'يجب أن تكون منتبهًا خلال الرحلة، خاصةً عند التقاطعات، الإشارات الضوئية، في الزحام، أو أثناء المناورات الضيقة، أبلغ السائق الأول بوضوح عن أي خطر على الطريق.' }
    ],
    incidentsEn: [
      'Role of Co-Driver: A heavy bus crossed a red light in Nizwa, and another missed a turn at Qarn AlAlam, showing the importance of co-driver support in monitoring surroundings and guiding the driver.',
      'Using Mobile Phones: Some drivers were found using mobile phones on speaker mode or with earbuds, assuming the system would not detect it. This is still prohibited and puts you at risk.',
      'Speed Management: Multiple overspeeding violations occurred during overtaking because drivers stayed above the limit beyond the 30-second IVMS allowance.'
    ],
    incidentsAr: [
      'دور السائق المساعد: سائق حافلة ثقيلة تجاوز الإشارة الحمراء في نزوى، وسائق آخر أخطأ في أخذ المخرج الصحيح في قرن العلم، مما يوضح أهمية دور السائق المساعد في مراقبة الطريق وتوجيه السائق.',
      'التحكم في السرعة: تم تسجيل عدة مخالفات سرعة أثناء التجاوز، حيث استمر السائقون بالقيادة فوق الحد المسموح لأكثر من 30 ثانية المسموح بها.',
      'استخدام الهاتف المحمول: تم رصد بعض السائقين يستخدمون الهاتف بوضعية مكبر الصوت أو من خلال السماعات، ظنًا منهم أن النظام لن يكتشف ذلك. هذا التصرف لا يزال مخالفًا ويعرضك للخطر.'
    ],
    takeawayEn: 'Safe driving depends on using correct techniques, controlling speed, keeping a safe distance, staying fully focused, and working as a team with the co-driver. Every action behind the wheel should aim to prevent incidents before they happen.',
    takeawayAr: 'تعتمد القيادة الآمنة على اتباع أساليب صحيحة، والتحكم في السرعة، وترك مسافة مناسبة، والحفاظ على التركيز الكامل، والعمل الجماعي الفعّال مع السائق المساعد. كل تصرف أثناء القيادة يجب أن يكون موجّهًا نحو منع الحوادث قبل أن تقع.'
  },
  {
    id: 'driver_fitness',
    categoryEn: 'Driver Fitness',
    categoryAr: 'جاهزية السائق',
    introEn: 'Driver fitness is a major factor in preventing incidents. Even a well-maintained vehicle and correct driving behaviour cannot make up for a driver who is not fit to drive. Being physically and mentally prepared before starting the journey is essential for your safety and the safety of others.',
    introAr: 'تُعد جاهزية السائق من العوامل الأساسية في الوقاية من الحوادث المرورية. فحتى مع وجود مركبة بحالة جيدة وسلوك قيادة سليم، لا يمكن تعويض تأثير السائق غير المؤهل للقيادة. التأكد من استعدادك الجسدي والذهني قبل بدء الرحلة أمر ضروري لسلامتك وسلامة من معك على الطريق.',
    pointsEn: [
      { title: 'Medical Fitness to Drive', desc: 'Ensure you are medically fit to operate a vehicle and report any medical conditions that could affect your driving ability to both your supervisor and the journey manager without delay.' },
      { title: 'Reporting Health Issues Before Journey', desc: 'If you feel unwell or experience any condition that could impair your driving, such as dizziness, fever, or blurred vision, report it immediately to the journey manager before the journey begins.' },
      { title: 'Sufficient Sleep Before and After Journey', desc: 'Get a minimum of 8 hours of quality sleep before starting a journey to ensure alertness and allow proper rest and recovery after completing one to maintain consistent performance.' },
      { title: 'Fatigue Awareness', desc: 'Recognise early signs of fatigue such as yawning, heavy eyes, frequent blinking, drifting out of the lane, or difficulty concentrating. If you feel tired at any point, you are empowered to stop in a safe location and take rest before continuing the journey.' },
      { title: 'Alcohol and Drug Use', desc: 'Never drive under the influence of alcohol or drugs, as they severely impair your judgement, reaction time, awareness, and decision-making, significantly increasing the risk of an incident.' }
    ],
    pointsAr: [
      { title: 'اللياقة للقيادة', desc: 'تأكد من أنك لائق صحيًا لقيادة المركبة، وإذا كنت تعاني من أي حالة صحية قد تؤثر على تركيزك أو قدرتك على القيادة، يجب إبلاغ المشرف ومدير الرحلة فورًا.' },
      { title: 'الإبلاغ عن الحالة الصحية قبل الرحلة', desc: 'إذا شعرت بالتعب، الدوخة، أو بأي عرض يؤثر على قيادتك، لا تبدأ الرحلة. أخبر المشرف ومدير الرحلة فورًا.' },
      { title: 'النوم الكافي قبل وبعد الرحلة', desc: 'يجب أن تنام على الأقل 8 ساعات قبل بدء الرحلة، وأن تحصل على راحة كافية بعد الانتهاء منها لتكون جاهزًا للرحلة التالية.' },
      { title: 'التوعية بالتعب والإرهاق', desc: 'تعرّف على علامات الإرهاق مثل التثاؤب المتكرر، ثقل العينين، وضعف التركيز. إذا شعرت بالتعب أثناء القيادة، لك الحق في التوقف وأخذ قسط من الراحة قبل مواصلة الطريق.' },
      { title: 'عدم القيادة تحت تأثير الكحول أو المواد المخدرة', desc: 'لا تقد المركبة أبدًا إذا كنت تحت تأثير الكحول أو أي مادة تؤثر على وعيك مثل الأدوية، لأنها تضعف تركيزك وردة فعلك وتزيد من احتمال وقوع الحوادث.' }
    ],
    incidentsEn: [
      'Reporting Health Issues Before Journey: A driver felt unwell but chose to continue the journey instead of reporting his condition. Early in the trip, the VIVMS system detected signs of fatigue, and the journey manager instructed him to stop and switch with the co-driver.',
      'Sufficient Sleep Before and After Journey: A driver fell asleep behind the wheel during a journey and could not be contacted by phone. He regained consciousness after about five seconds while the vehicle was still moving.',
      'Fatigue Awareness: A driver knew he was tired but decided to continue because the camp was near. His body was already fatigued, and the VIVMS system detected eye closure, prompting the journey manager to stop him and rest before continuing.'
    ],
    incidentsAr: [
      'الإبلاغ عن الحالة الصحية قبل الرحلة: أحد السائقين كان يشعر بالمرض لكنه قرر الاستمرار في الرحلة دون الإبلاغ عن حالته. في بداية الرحلة، رصد نظام VIVMS علامات التعب على السائق، وطلب منه مدير الرحلة التوقف واستبداله بالسائق المساعد.',
      'النوم الكافي قبل وبعد الرحلة: أحد السائقين غفا أثناء القيادة، ولم يكن يرد على الاتصالات الهاتفية. استعاد وعيه بعد حوالي خمس ثوانٍ بينما كانت المركبة لا تزال تتحرك لمسافة 70 متراً.',
      'التوعية بالتعب والإرهاق: أحد السائقين كان يعلم أنه مرهق، لكنه قرر الاستمرار في القيادة لأن منطقة التوقف كانت قريبة. جسده كان في حالة إرهاق واضحة، ورصد نظام VIVMS إغلاق العين، فطلب منه مدير الرحلة التوقف وأخذ قسط من الراحة قبل استكمال الطريق.'
    ],
    takeawayEn: 'Safe driving depends on being physically and mentally fit, well-rested, and alert before and during the journey. Recognising and acting on signs of fatigue, reporting any health concerns, and never driving under the influence are essential to preventing incidents and protecting lives.',
    takeawayAr: 'لا تبدأ أي رحلة إذا كنت تعلم أنك غير قادر على إكمالها. إذا كنت تشعر بالتعب أو الإرهاق أو أنك غير جاهز للقيادة، يجب إبلاغ مدير الرحلة والمشرف قبل التحرك. وإذا شعرت أثناء الرحلة أنك لست بخير أو بدأت علامات التعب بالظهور عليك، فيحق لك التوقف فورًا وأخذ قسط من الراحة. قرارك قبل وأثناء القيادة يؤثر بشكل مباشر على سلامتك وسلامة الجميع على الطريق.'
  },
  {
    id: 'vehicle_readiness',
    categoryEn: 'Vehicle Readiness',
    categoryAr: 'جاهزية المركبة',
    introEn: 'Vehicle readiness is a critical part of journey safety. Even if the driver is fit and follows safe driving practices, a vehicle that is not properly inspected, maintained, or equipped can cause incidents, delays, or non-compliance. A thorough check before departure ensures the vehicle is safe, legal, and fully prepared for the journey.',
    introAr: 'تُعد جاهزية المركبة من العناصر الأساسية في سلامة الرحلة. فحتى مع جاهزية السائق واتباعه لجميع ممارسات القيادة الآمنة، فإن إهمال فحص المركبة أو صيانتها أو تجهيزها قد يؤدي إلى حوادث، أو تأخير، أو مخالفة للأنظمة. الفحص الفعّال قبل التحرك يضمن أن المركبة آمنة، مطابقة للاشتراطات، وجاهزة للرحلة.',
    pointsEn: [
      { title: '360° Check and Vehicle Inspection', desc: 'Carry out a full walk-around inspection of the vehicle before departure. Check fuel level, all exterior and interior lights, oil level, water and coolant, electrical components, and the condition of tyres and wipers to ensure everything is in proper working order.' },
      { title: 'Vehicle Defects Reporting', desc: 'Record any defects identified during the inspection clearly in the pre-journey checklist and report them immediately for action before starting the journey.' },
      { title: 'Tyre Condition', desc: 'Check tyre pressure, tread depth, sidewall condition, and manufacture date to confirm they are safe and within acceptable limits.' },
      { title: 'Emergency and Safety Equipment', desc: 'Verify that the first aid box, AED machine, fire extinguisher, and warning triangle are present, in good condition, and easily accessible.' },
      { title: 'Loose Items in Vehicle', desc: 'Inspect the passenger area and luggage compartment. If any bags or items are not secured properly, inform passengers so they can secure them or move them to the luggage compartment to prevent injury during sudden stops.' },
      { title: 'Communication Equipment', desc: 'Ensure the Thuraya phone and the driver’s phone are fully charged, functional, and available before departure to allow communication in case of an emergency or unexpected situation.' }
    ],
    pointsAr: [
      { title: 'الفحص الشامل للمركبة (360 درجة)', desc: 'نفّذ جولة تفقدية كاملة حول المركبة قبل التحرك. تأكد من مستوى الوقود، جميع الأنوار، مستوى الزيت، المياه و سائل التبريد، وحالة الإطارات والمساحات.' },
      { title: 'الإبلاغ عن أعطال المركبة', desc: 'يجب تدوين أي عطل يتم اكتشافه بوضوح في قائمة الفحص قبل الرحلة.' },
      { title: 'حالة الإطارات', desc: 'افحص ضغط الهواء، عمق نقشة الإطار، سلامة جوانب الإطار، وتاريخ الصنع.' },
      { title: 'معدات الطوارئ والسلامة', desc: 'تأكد من وجود و من حالة صندوق الإسعافات الأولية، جهاز الصدمات، طفاية الحريق، والمثلث العاكس.' },
      { title: 'الأغراض غير المثبتة داخل المركبة', desc: 'افحص منطقة الركّاب وصندوق الأمتعة. إذا وُجدت حقائب غير مثبتة، أبلغ الركّاب بتثبيتها أو وضعها في المكان المخصص لذلك.' },
      { title: 'أجهزة الاتصال', desc: 'تأكد من أن هاتف الثريا وهاتف السائق مشحونان، ويعملان، و موجودان في الباص قبل بدء الرحلة.' }
    ],
    incidentsEn: [
      '360° Check and Vehicle Inspection: During a road safety inspection, a vehicle was found with non-functional lights because the driver had not carried out a proper external check before departure, resulting in a non-compliance being issued.',
      'Seatbelts Condition: During a spot check, seatbelts were found defective because the driver had not conducted an effective pre-journey inspection to identify the issue.',
      'Communication Equipment: During a spot check, a Thuraya phone was discovered uncharged and not functioning, and it had to be replaced before the journey could start.'
    ],
    incidentsAr: [
      'الفحص الشامل للمركبة (360 درجة): أثناء تفتيش ميداني للسلامة على الطريق، تم ضبط مركبة بأنوار خارجية لا تعمل. تبيّن أن السائق لم يُجر فحصًا خارجيًا فعّالًا قبل بدء الرحلة، وتم تسجيل مخالفة عليه.',
      'حالة أحزمة الأمان: خلال تفتيش ميداني، تم اكتشاف أن أحزمة الأمان كانت معطّلة، بسبب عدم قيام السائق بفحص شامل قبل بدء الرحلة.',
      'أجهزة الاتصال: خلال تفتيش ميداني، تم العثور على هاتف الثريا غير مشحون ولا يعمل. لم يكن من الممكن بدء الرحلة إلا بعد استبداله بجهاز آخر جاهز.'
    ],
    takeawayEn: 'An effective vehicle check before departure is essential for journey safety and compliance. Thorough inspections, verification of documentation, and confirming the condition of all equipment help prevent non-compliances, delays, and unsafe situations on the road.',
    takeawayAr: 'جاهزية المركبة ليست مجرد إجراء شكلي قبل التحرك، بل هي خطوة أساسية لضمان سلامتك وسلامة الركّاب والتقيد بالأنظمة. الفحص الشامل قبل الرحلة يتيح لك اكتشاف الأعطال، التأكد من توفر معدات الطوارئ، والتحقق من صلاحية الوثائق والمعدات. كل ذلك يمنع الوقوع في مواقف خطرة أو مخالفات أو أعطال على الطريق.'
  },
  {
    id: 'journey_management',
    categoryEn: 'Journey Management',
    categoryAr: 'إدارة الرحلة',
    introEn: 'Journey management plays a key role in reducing risks before and during the journey. As the journey manager, my responsibility is to plan the trip, explain potential risks, and monitor the journey until it is safely completed. You are expected to follow the plan, take scheduled rest breaks, ensure all required documents and equipment are in order, and report any problems immediately. Working together helps keep everyone safe throughout the journey.',
    introAr: 'تُساهم إدارة الرحلة في تقليل المخاطر قبل وأثناء الرحلة. دوري كمدير للرحلة هو تخطيط المسار، توضيح المخاطر المحتملة، ومتابعة الرحلة حتى إكمالها بسلام. أما دورك كسائق، فيتضمن الالتزام بالخطة، أخذ فترات الراحة، التأكد من صلاحية جميع الوثائق والمعدات، والإبلاغ فورًا عن أي مشكلة. التعاون بيننا هو الأساس في الحفاظ على سلامة الجميع.',
    pointsEn: [
      { title: 'Journey Management Plan', desc: 'The journey manager must explain the journey plan content clearly to the driver and highlight any known risks or challenging sections along the route.' },
      { title: 'Planned Rest Breaks', desc: 'Drivers must take rest breaks as outlined in the journey plan and use the full break period without rushing to ensure proper recovery and alertness.' },
      { title: 'Driver and Vehicle Documents', desc: 'Confirm that all required documentation is present, valid, and up to date, including the OPAL defensive driving training card, ROP driving license, vehicle Mulkiya, and vehicle OPAL inspection expiry date.' },
      { title: 'Bus Toilet Use During Motion', desc: 'Ensure passengers use the toilet only in designated safe locations along the route. The “Do Not Use Toilet” indicator must be switched on in high-risk areas such as roundabouts, sharp turns, or steep gradients.' },
      { title: 'Night Driving', desc: 'Verify that a valid night driving permit is available and exercise extra caution. Reduce speed, increase following distance, use headlights correctly, remain alert for animals or unlit vehicles, and avoid risky overtaking.' },
      { title: 'Reporting IVMS/VIVMS Issues', desc: 'Report any unusual notifications, system alerts, or abnormalities immediately so that they can be resolved before they affect the journey.' }
    ],
    pointsAr: [
      { title: 'خطة إدارة الرحلة', desc: 'اشرح محتوى خطة الرحلة للسائق بشكل واضح، مع توضيح أية مخاطر محتملة على طول الطريق.' },
      { title: 'فترات الراحة المخطط لها', desc: 'يجب على السائقين الالتزام بفترات الراحة المحددة في خطة الرحلة، واستغلال كامل مدة التوقف دون استعجال.' },
      { title: 'مستندات السائق والمركبة', desc: 'التأكد من وجود و صلاحية جميع المستندات المطلوبة، مثل بطاقة تدريب القيادة الوقائية، رخصة القيادة، ملكية المركبة، وتاريخ انتهاء الفحص الفني من أوبال.' },
      { title: 'استخدام دورة مياه الحافلة أثناء الحركة', desc: 'يجب التأكد من استخدام الركّاب لدورة المياه فقط في المواقع الآمنة المحددة على الطريق، وتفعيل إشارة "يُمنع استخدام دورة المياه" في المواقع الخطرة مثل الدوّارات أو المنعطفات الحادة.' },
      { title: 'القيادة الليلية', desc: 'التأكد من وجود تصريح قيادة ليلية ساري المفعول، والقيادة بحذر إضافي. يجب تخفيف السرعة، زيادة مسافة الأمان، استخدام الإضاءة الأمامية بشكل صحيح، والانتباه لاحتمال وجود حيوانات أو مركبات غير مضاءة، وتجنّب التجاوزات الخطرة.' },
      { title: 'الإبلاغ عن مشاكل IVMS/VIVMS', desc: 'يجب الإبلاغ فورًا عن أي إشعارات غير طبيعية أو أعطال في النظام ليتم التعامل معها دون تأخير.' }
    ],
    incidentsEn: [
      'Vehicle Documentation: During a road safety inspection, a vehicle was found carrying an expired Mulkiya because the driver had not verified that valid documents were present in the vehicle, resulting in a non-compliance being issued.',
      'Rest Stop Location: Some drivers were found not stopping at the approved rest locations, such as Fahood or Hamra AlDroua, which increases risk of accidents.',
      'Incomplete Rest Breaks: Some drivers were observed rushing their rest breaks and not taking the full 15 minutes, which later contributed to fatigue during the journey.'
    ],
    incidentsAr: [
      'مستندات المركبة: أثناء تفتيش ميداني للسلامة على الطريق، تم ضبط مركبة تحمل ملكية منتهية الصلاحية، وذلك بسبب عدم قيام السائق بالتأكد سريان الملكية، وتم تسجيل مخالفة عليه.',
      'مواقع التوقف للراحة: تم رصد بعض السائقين لا يتوقفون في مواقع الراحة المعتمدة مثل فهود أو حمراء الدروع، مما يزيد من احتمالية وقوع الحوادث.',
      'فترات الراحة غير المكتملة: لوحظ أن بعض السائقين يختصرون فترة الراحة ولا يأخذون كامل 15 دقيقة، مما ساهم لاحقًا في شعورهم بالإرهاق أثناء الرحلة.'
    ],
    takeawayEn: 'The Journey Management Plan is not just a document. It is a practical tool to ensure the driver is fit, the vehicle is ready, all documents are valid, the route is planned, and communication is available. It helps prevent incidents by addressing risks in advance and ensuring the journey is properly managed from start to finish.',
    takeawayAr: 'خطة إدارة الرحلة ليست مجرد ورقة، بل أداة عملية تضمن جاهزية السائق، استعداد المركبة، صلاحية المستندات، وضوح المسار، وتوفّر وسائل الاتصال. الهدف منها هو الوقاية من الحوادث من خلال التعامل مع المخاطر مسبقًا وضمان السيطرة الكاملة على الرحلة من بدايتها حتى نهايتها.'
  },
  {
    id: 'road_weather',
    categoryEn: 'Road and Weather Conditions',
    categoryAr: 'حالة الطريق والطقس',
    introEn: 'Road and weather conditions have a direct impact on driving safety. Poor weather can reduce visibility and vehicle control, while road surface issues such as potholes, detours, or loose gravel require extra caution. Drivers must stay alert, adjust their driving to suit the conditions, and follow instructions to complete the journey safely.',
    introAr: 'تؤثر حالة الطريق والطقس بشكل مباشر على سلامة القيادة. فالطقس السيئ قد يضعف الرؤية والتحكم في المركبة، بينما تتطلب مشاكل الطريق مثل الحفر أو التحويلات انتباهًا شديدًا. على السائق أن يبقى متيقظًا، ويتكيف مع الظروف، ويلتزم بالتعليمات لإكمال الرحلة بأمان.',
    pointsEn: [
      { title: 'Poor Weather Conditions', desc: 'Drive cautiously in fog, rain, or strong winds. Use headlights or fog lights as required, reduce speed, and avoid sudden manoeuvres. Stop the vehicle if conditions become unsafe. (Share weather condition alerts with drivers if received.)' },
      { title: 'Poor Road Conditions', desc: 'Watch for potholes, loose gravel, water accumulation, or uneven surfaces. Reduce speed, keep both hands firmly on the wheel, and avoid harsh braking or overtaking.' },
      { title: 'Driving Through Detours', desc: 'Follow only approved detour routes and do not take shortcuts. Be extra cautious in unfamiliar areas and expect sudden changes in road layout, lane width, or surface quality.' },
      { title: 'Other Road Users', desc: 'Maintain a safe distance from other vehicles and stay alert for pedestrians, cyclists, animals, and improperly parked vehicles. Stay calm and avoid reacting aggressively to reckless drivers.' },
      { title: 'Reporting Unsafe Road Conditions', desc: 'Inform the journey manager immediately if you encounter hazardous road or weather conditions. Early reporting helps warn other drivers and allows adjustments to the journey plan if needed.' }
    ],
    pointsAr: [
      { title: 'القيادة في ظروف جوية سيئة', desc: 'يجب القيادة بحذر في حاالت الضباب أو الأمطار أو الرياح القوية. استخدم الأنوار الأمامية أو أنوار الضباب حسب الحاجة، خفف السرعة، وتجنب أي مناورة مفاجئة. إذا أصبحت القيادة غير آمنة، توقف فورًا. (قم بمشاركة تنبيهات/تحذيرات الطقس مع السائقين)' },
      { title: 'حالة الطريق السيئة', desc: 'انتبه لوجود حفر، حصى، تجمع مياه، أو سطح غير مستوٍ. خفف السرعة، وأمسك المقود بكلتا اليدين، وتجنب التوقف المفاجئ أو التجاوز.' },
      { title: 'القيادة في مسارات التحويلات', desc: 'التزم بمسارات التحويلات المعتمدة، ولا تسلك طرقًا مختصرة. كن أكثر حذرًا في الطرق تحت الصيانة، وتوقع تغيّرات مفاجئة في الطريق أو سطحه.' },
      { title: 'مستخدمو الطريق الآخرون', desc: 'حافظ على مسافة أمان كافية مع المركبات الأخرى، وكن منتبهًا للمشاة، والدراجات، والحيوانات، والمركبات المتوقفة بطريقة خاطئة. تجنب التصرفات العدوانية تجاه السائقين المتهورين.' },
      { title: 'الإبلاغ عن ظروف الطريق غير الآمنة', desc: 'إذا واجهت طريقًا خطرًا أو أحوالًا جوية صعبة، أبلغ مدير الرحلة فورًا. الإبلاغ المبكر يساهم في تحذير السائقين الآخرين وتحديث خطة الرحلة.' }
    ],
    incidentsEn: [
      'Wiper Failure in Rain: During heavy rainfall, a bus’s wipers failed mid-journey. The vehicle had to be stopped, and a replacement sent, causing delays and increased risk. This incident highlights the importance of thoroughly checking critical components during the pre-journey inspection.',
      'Ignoring Planned Detour: A driver chose to take a shortcut instead of following the designated detour, putting himself, passengers, and road workers at risk. Always follow planned detours in the Journey Management Plan to avoid unsafe areas.',
      'Overspeeding in Road Works: A driver exceeded the posted 60 km/h speed limit inside a road works zone. Although the IVMS geofence was set to 80 km/h for the original route, drivers must follow physical road signs and not rely solely on the IVMS to guide safe behaviour.'
    ],
    incidentsAr: [
      'تعطل المساحات أثناء المطر: خلال هطول أمطار غزيرة، تعطلت مساحات إحدى الحافلات أثناء الرحلة، ما اضطر السائق إلى التوقف وإرسال مركبة بديلة، مما تسبب في تأخير وزيادة مستوى الخطر. توضح هذه الحالة أهمية فحص الأجزاء الأساسية بدقة خلال التفتيش قبل الرحلة.',
      'تجاهل مسار التحويلة المعتمد: أحد السائقين اختار أن يسلك طريقًا مختصرًا بدلًا من اتباع مسار التحويلة المعتمد. هذا التصرف عرّض السائق والركاب والعاملين في الطريق للخطر. يجب دائمًا الالتزام بمسارات التحويل المحددة في خطة إدارة الرحلة لتجنب المناطق غير الآمنة.',
      'تجاوز السرعة في منطقة أعمال صيانة: تجاوز أحد السائقين الحد المسموح وهو 60 كم/ساعة داخل منطقة أعمال طرق، رغم أن نظام IVMS كان مضبوطًا على 80 كم/ساعة للمسار الأصلي. يجب الالتزام باللوحات التحذيرية على الطريق وعدم الاعتماد فقط على نظام IVMS لتحديد سلوك القيادة الآمنة.'
    ],
    takeawayEn: 'Poor road and weather conditions significantly increase driving risk. Drivers must stay alert, adjust their driving behaviour to the conditions, follow detours and road signs, and report any unsafe situations immediately to help ensure a safe journey.',
    takeawayAr: 'تزيد ظروف الطريق والطقس السيئة من خطورة القيادة. على السائق أن يبقى متيقظًا، ويُعدل أسلوب قيادته بما يتناسب مع الوضع، ويلتزم بمسارات التحويل واللوحات الإرشادية، ويُبلغ فورًا عن أي حالة غير آمنة لضمان إكمال الرحلة بسلام.'
  },
  {
    id: 'other',
    categoryEn: 'Other Topic',
    categoryAr: 'موضوع آخر',
    pointsEn: [],
    pointsAr: []
  }
];
