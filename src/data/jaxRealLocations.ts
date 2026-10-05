import horizonPortalImg from '../assets/images/jax_horizon_portal_1791211606227.jpg';
import clayMonumentImg from '../assets/images/jax_clay_monument_1791211622417.jpg';
import digitalArtImg from '../assets/images/jax_digital_art_1791211634449.jpg';
import districtAerialImg from '../assets/images/jax_district_aerial_1791211647468.jpg';

export interface JaxDistrictSite {
  id: string;
  code: string; // e.g. "JAX 12"
  titleAr: string;
  titleEn: string;
  typeAr: 'هنجر رئيسي' | 'حديقة مفتوحة' | 'ساحة عامة' | 'بوابة ومواقف' | 'مركز خدمات';
  typeEn: 'Main Hangar' | 'Open Garden' | 'Public Plaza' | 'Gate & Parking' | 'Service Center';
  lat: number;
  lng: number;
  bearingDeg: number;
  openingHoursAr: string;
  openingHoursEn: string;
  primaryExhibitionAr: string;
  primaryExhibitionEn: string;
  creatorOrCuratorAr: string;
  creatorOrCuratorEn: string;
  descriptionAr: string;
  descriptionEn: string;
  facilitiesAr: string[];
  facilitiesEn: string[];
  image: string;
}

export interface JaxEventSchedule {
  id: string;
  siteCode: string;
  siteNameAr: string;
  siteNameEn: string;
  titleAr: string;
  titleEn: string;
  categoryAr: 'معرض دولي' | 'جلسة نقدية' | 'ورشة تخصصية' | 'عرض حي';
  categoryEn: 'International Exhibition' | 'Panel Discussion' | 'Specialized Workshop' | 'Live Performance';
  timeSlotAr: string;
  timeSlotEn: string;
  daysScheduleAr: string;
  daysScheduleEn: string;
  entryStatusAr: 'دخول عام مجاني' | 'تسجيل إلكتروني مسبق' | 'حضور مفتوح';
  entryStatusEn: 'Free General Admission' | 'Advance Registration' | 'Open Attendance';
  organizerAr: string;
  organizerEn: string;
  summaryAr: string;
  summaryEn: string;
  image: string;
}

// Coordinates in Diriyah, Riyadh (JAX Arts District)
export const JAX_REAL_SITES: JaxDistrictSite[] = [
  {
    id: 'site_jax_12_sculpture_garden',
    code: 'JAX 12',
    titleAr: 'حديقة المنحوتات الخارجية · أصداء الطين المعاصرة',
    titleEn: 'Outdoor Sculpture Garden · Echoes of Clay',
    typeAr: 'حديقة مفتوحة',
    typeEn: 'Open Garden',
    lat: 24.7421,
    lng: 46.5749,
    bearingDeg: 110,
    openingHoursAr: 'مفتوح على مدار الساعة (إضاءة ليلية متكاملة)',
    openingHoursEn: 'Open 24/7 (Full Architectural Night Lighting)',
    primaryExhibitionAr: 'منحوتة أصداء الطين المعاصرة (د. زهرة الغامدي)',
    primaryExhibitionEn: 'Contemporary Echoes of Clay Monument (Dr. Zahrah Al Ghamdi)',
    creatorOrCuratorAr: 'د. زهرة الغامدي بالتعاون مع هيئة فنون العمارة والتصميم',
    creatorOrCuratorEn: 'Dr. Zahrah Al Ghamdi with Architecture & Design Commission',
    descriptionAr: 'منطقة ميدانية مفتوحة تحتضن المنحوتات الحجرية والبيئية الضخمة المشيدة من طمي وادي حنيفة والصخور الرسوبية، وتطل مباشرة على الممشى التاريخي.',
    descriptionEn: 'Open-air public esplanade hosting monumental geological and biopolymer sculptures sculpted from native Wadi Hanifa clay.',
    facilitiesAr: ['ممشى مهيأ للكراسي المتحركة', 'مقاعد استراحة مظللة', 'إضاءة مسارات ليلية'],
    facilitiesEn: ['Accessible Walkways', 'Shaded Seating', 'Night Path Lighting'],
    image: clayMonumentImg
  },
  {
    id: 'site_jax_01_biennale',
    code: 'JAX 01',
    titleAr: 'مقر بينالي الدرعية للفن المعاصر · بوابة الأفق',
    titleEn: 'Diriyah Biennale Pavilion · The Horizon Portal',
    typeAr: 'هنجر رئيسي',
    typeEn: 'Main Hangar',
    lat: 24.7438,
    lng: 46.5738,
    bearingDeg: 35,
    openingHoursAr: '04:00 عصراً - 11:00 مساءً (يومياً)',
    openingHoursEn: '04:00 PM - 11:00 PM (Daily)',
    primaryExhibitionAr: 'معرض بينالي الدرعية الدولي ومنحوتة بوابة الأفق (راشد الشعشعي)',
    primaryExhibitionEn: 'Diriyah Biennale Exhibition & Horizon Portal (Rashed Al Shashai)',
    creatorOrCuratorAr: 'مؤسسة بينالي الدرعية وإشراف وزارة الثقافة',
    creatorOrCuratorEn: 'Diriyah Biennale Foundation & Ministry of Culture',
    descriptionAr: 'المبنى الرئيسي للبينالي بمساحة تزيد عن 4,000 متر مربع؛ يضم قاعات العرض الدولية الكبرى، الندوات الفكرية، والمنحوتات الكينيتية الضخمة.',
    descriptionEn: 'Flagship biennale pavilion spanning over 4,000 sqm with museum-grade gallery spaces, lecture halls, and monumental kinetic monuments.',
    facilitiesAr: ['مكتب استعلامات رئيسي', 'مصلى', 'دورات مياه', 'مواقف خاصة'],
    facilitiesEn: ['Main Information Desk', 'Prayer Hall', 'Restrooms', 'Dedicated Parking'],
    image: horizonPortalImg
  },
  {
    id: 'site_jax_03_digital_lab',
    code: 'JAX 03',
    titleAr: 'مختبر الفنون الرقمية والوسائط التفاعلية',
    titleEn: 'Digital Art & Interactive XR Media Lab',
    typeAr: 'هنجر رئيسي',
    typeEn: 'Main Hangar',
    lat: 24.7432,
    lng: 46.5742,
    bearingDeg: 195,
    openingHoursAr: '04:00 عصراً - 12:00 منتصف الليل',
    openingHoursEn: '04:00 PM - 12:00 Midnight',
    primaryExhibitionAr: 'تجهيز الشفرات والضوء التفاعلي (مهند شونو)',
    primaryExhibitionEn: 'Interactive Luminescence & Code Installation (Muhannad Shono)',
    creatorOrCuratorAr: 'الفنان مهند شونو ومختبر التقنيات الإبداعية',
    creatorOrCuratorEn: 'Artist Muhannad Shono & Creative Tech Lab',
    descriptionAr: 'فضاء صناعي مجهز بأحدث أنظمة الإسقاط الليزري والمستشعرات الحركية لتحويل المساحات المغلقة إلى بيئات رقمية استجابية لخطوات الزائرين.',
    descriptionEn: 'Industrial warehouse transformed with high-output laser projections and spatial sensors responding in real-time to visitor movement.',
    facilitiesAr: ['قاعة عروض رقمية مظلمة', 'تكييف مركزي متكامل', 'محطات شحن أجهزة'],
    facilitiesEn: ['Darkened Media Hall', 'Central Climate Control', 'Device Charging Hubs'],
    image: digitalArtImg
  },
  {
    id: 'site_jax_15_central_plaza',
    code: 'JAX 15',
    titleAr: 'الساحة المركزية · جاكس سوشيال والممشى الثقافي',
    titleEn: 'Central Plaza · JAX Social & Cultural Boulevard',
    typeAr: 'ساحة عامة',
    typeEn: 'Public Plaza',
    lat: 24.7428,
    lng: 46.5746,
    bearingDeg: 275,
    openingHoursAr: '08:00 صباحاً - 01:00 بعد منتصف الليل',
    openingHoursEn: '08:00 AM - 01:00 AM',
    primaryExhibitionAr: 'معرض مطبوعات وتصميمات التحول الصناعي',
    primaryExhibitionEn: 'Industrial Architecture & Design Prints Archive',
    creatorOrCuratorAr: 'هيئة فنون العمارة والتصميم',
    creatorOrCuratorEn: 'Architecture & Design Commission',
    descriptionAr: 'نقطة الالتقاء والقلب النابض لحي جاكس؛ تربط الممرات الميدانية بين الهناجر وتضم مقاهي مختصة، متجر كتب الفنون المعاصرة، ومساحات الجلوس الخارجية.',
    descriptionEn: 'The social crossroads of JAX connecting pedestrian boulevards with specialty roasteries, contemporary art bookshops, and terrace seating.',
    facilitiesAr: ['مقاهي ومطاعم مختصة', 'متجر كتب فنية', 'إنترنت مجاني عالي السرعة'],
    facilitiesEn: ['Specialty Cafes', 'Art Bookshop', 'High-Speed Free Wi-Fi'],
    image: districtAerialImg
  },
  {
    id: 'site_jax_07_sculpture_foundry',
    code: 'JAX 07',
    titleAr: 'مسبك ومحترف النحت الميداني',
    titleEn: 'Sculpture Foundry & Materials Residency',
    typeAr: 'هنجر رئيسي',
    typeEn: 'Main Hangar',
    lat: 24.7426,
    lng: 46.5755,
    bearingDeg: 320,
    openingHoursAr: '02:00 ظهراً - 10:00 مساءً',
    openingHoursEn: '02:00 PM - 10:00 PM',
    primaryExhibitionAr: 'معرض نماذج صب البرونز وأحجار طويق',
    primaryExhibitionEn: 'Bronze Castings & Tuwaiq Limestone Studio',
    creatorOrCuratorAr: 'إدارة استوديوهات الإقامة الفنية',
    creatorOrCuratorEn: 'Artistic Residency Studios Directorate',
    descriptionAr: 'مشغل صناعي متكامل لصب المعادن، تشكيل الأحجار الجيرية والجرانيتية، واستضافة الفنانين المقيمين لإنتاج المنشآت النحتية الكبرى.',
    descriptionEn: 'Fully equipped production foundry for bronze casting, Tuwaiq stone carving, and hosting resident artists fabricating public monuments.',
    facilitiesAr: ['ورش عمل مفتوحة للزيارة', 'معايير أمان صناعي', 'مرشد تقني'],
    facilitiesEn: ['Open Studio Viewing', 'Industrial Safety Standards', 'Technical Specialist'],
    image: clayMonumentImg
  },
  {
    id: 'site_jax_gate_north_parking',
    code: 'GATE 01',
    titleAr: 'البوابة الشمالية ومواقف الزوار الرئيسية',
    titleEn: 'North Gate & Main Visitor Parking',
    typeAr: 'بوابة ومواقف',
    typeEn: 'Gate & Parking',
    lat: 24.7445,
    lng: 46.5732,
    bearingDeg: 345,
    openingHoursAr: 'مفتوح على مدار الساعة',
    openingHoursEn: 'Open 24/7',
    primaryExhibitionAr: 'نقطة الوصول الرئيسية ومكتب الترحيب',
    primaryExhibitionEn: 'Primary Entrance & Welcome Reception',
    creatorOrCuratorAr: 'إدارة أمن وخدمات حي جاكس',
    creatorOrCuratorEn: 'JAX Security & Operations Management',
    descriptionAr: 'المدخل الرئيسي للسيارات وحافلات الزوار، متصل بمواقف مظللة تتسع لأكثر من 500 مركبة مع عربات جولف لنقل الزوار داخل الحي.',
    descriptionEn: 'Main vehicular access gate with shaded parking for 500+ vehicles and shuttle golf carts for mobility across the district.',
    facilitiesAr: ['مواقف مجانية مظللة', 'شواحن سيارات كهربائية', 'محطة عربات جولف'],
    facilitiesEn: ['Free Shaded Parking', 'EV Charging Stations', 'Golf Cart Shuttle'],
    image: districtAerialImg
  }
];

export const JAX_REAL_EVENTS: JaxEventSchedule[] = [
  {
    id: 'ev_biennale_flagship_daily',
    siteCode: 'JAX 01',
    siteNameAr: 'مقر بينالي الدرعية للفن المعاصر',
    siteNameEn: 'Diriyah Biennale Pavilion',
    titleAr: "معرض بينالي الدرعية الدولي 'أفق العبور'",
    titleEn: "Diriyah Contemporary Art Biennale 'Horizon Crossing'",
    categoryAr: 'معرض دولي',
    categoryEn: 'International Exhibition',
    timeSlotAr: '04:00 عصراً - 11:00 مساءً',
    timeSlotEn: '04:00 PM - 11:00 PM',
    daysScheduleAr: 'يومياً (مستمر طوال الموسم)',
    daysScheduleEn: 'Daily (Ongoing throughout season)',
    entryStatusAr: 'دخول عام مجاني',
    entryStatusEn: 'Free General Admission',
    organizerAr: 'مؤسسة بينالي الدرعية',
    organizerEn: 'Diriyah Biennale Foundation',
    summaryAr: 'المعرض الفني الدولي الرائد يضم 65 مشاركة فنية معاصرة تمتد عبر قاعات هنجر 01 والساحات الملحقة به.',
    summaryEn: 'The flagship international exhibition featuring 65 installations across Hangar 01 and adjacent pavilions.',
    image: horizonPortalImg
  },
  {
    id: 'ev_sculpture_symposium',
    siteCode: 'JAX 12',
    siteNameAr: 'حديقة المنحوتات الخارجية',
    siteNameEn: 'Outdoor Sculpture Garden',
    titleAr: 'جولات الاستكشاف الميداني للمنحوتات الحجرية والبيئية',
    titleEn: 'Field Curatorial Walks in the Open Sculpture Garden',
    categoryAr: 'جلسة نقدية',
    categoryEn: 'Panel Discussion',
    timeSlotAr: '05:30 عصراً - 07:00 مساءً',
    timeSlotEn: '05:30 PM - 07:00 PM',
    daysScheduleAr: 'الخميس والجمعة والسبت',
    daysScheduleEn: 'Thursday, Friday & Saturday',
    entryStatusAr: 'حضور مفتوح',
    entryStatusEn: 'Open Attendance',
    organizerAr: 'لجنة الفنون البصرية بالدرعية',
    organizerEn: 'Diriyah Visual Arts Committee',
    summaryAr: 'جولة مشي ميدانية يشرف عليها مؤرخون فنيون لشرح الأساليب الجيولوجية والتقنيات المستخدمة في تشييد منحوتات وادي حنيفة.',
    summaryEn: 'Guided walking sessions led by art historians detailing geological methods and raw materials of Diriyah sculptures.',
    image: clayMonumentImg
  },
  {
    id: 'ev_digital_media_lab',
    siteCode: 'JAX 03',
    siteNameAr: 'مختبر الفنون الرقمية',
    siteNameEn: 'Digital Art Lab',
    titleAr: 'عروض الضوء والإسقاط الليزري الحي',
    titleEn: 'Live Generative Laser Projection & Sound Choreography',
    categoryAr: 'عرض حي',
    categoryEn: 'Live Performance',
    timeSlotAr: '07:00 مساءً - 11:00 مساءً',
    timeSlotEn: '07:00 PM - 11:00 PM',
    daysScheduleAr: 'يومياً طوال المساء',
    daysScheduleEn: 'Daily throughout evening',
    entryStatusAr: 'دخول عام مجاني',
    entryStatusEn: 'Free General Admission',
    organizerAr: 'مختبر التقنيات الإبداعية',
    organizerEn: 'Creative Technology Directorate',
    summaryAr: 'تجارب تفاعلية في الوقت الحقيقي تعتمد على خوارزميات الاستجابة لحركة زوار الهنجر وتيارات الهواء.',
    summaryEn: 'Real-time responsive experiments powered by ambient sensors and motion tracking algorithms.',
    image: digitalArtImg
  },
  {
    id: 'ev_materials_workshop',
    siteCode: 'JAX 07',
    siteNameAr: 'مسبك ومحترف النحت الميداني',
    siteNameEn: 'Sculpture Foundry',
    titleAr: 'ورشة صب المعادن والتشكيل الحرفي المتقدم',
    titleEn: 'Metal Casting & Industrial Craft Masterclass',
    categoryAr: 'ورشة تخصصية',
    categoryEn: 'Specialized Workshop',
    timeSlotAr: '04:30 عصراً - 08:30 مساءً',
    timeSlotEn: '04:30 PM - 08:30 PM',
    daysScheduleAr: 'الإثنين والأربعاء',
    daysScheduleEn: 'Mondays & Wednesdays',
    entryStatusAr: 'تسجيل إلكتروني مسبق',
    entryStatusEn: 'Advance Registration',
    organizerAr: 'مسبك جاكس للفنون المعدنية',
    organizerEn: 'JAX Metal Arts Foundry',
    summaryAr: 'تطبيقات عملية للمختصين والمهتمين على أفران الصهر وتجهيز قوالب الصب لإنتاج مجسمات معمارية دقيقة.',
    summaryEn: 'Hands-on furnace casting and mold fabrication for architectural maquettes and public installations.',
    image: clayMonumentImg
  }
];
