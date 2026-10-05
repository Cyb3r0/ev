import horizonPortalImg from '../assets/images/jax_horizon_portal_1791211606227.jpg';
import clayMonumentImg from '../assets/images/jax_clay_monument_1791211622417.jpg';
import digitalArtImg from '../assets/images/jax_digital_art_1791211634449.jpg';
import districtAerialImg from '../assets/images/jax_district_aerial_1791211647468.jpg';

export interface Artwork {
  id: string;
  titleAr: string;
  titleEn: string;
  artistAr: string;
  artistEn: string;
  hangarCode: string;
  hangarNameAr: string;
  hangarNameEn: string;
  categoryAr: string;
  categoryEn: string;
  year: string;
  mediumAr: string;
  mediumEn: string;
  dimensions: string;
  descriptionAr: string;
  descriptionEn: string;
  curatorialEssayAr: string;
  curatorialEssayEn: string;
  audioNarrationAr: string;
  audioNarrationEn: string;
  audioDurationSeconds: number;
  initialDistanceMeters: number;
  compassBearingDeg: number;
  lat: number;
  lng: number;
  image: string;
  walkingDirectionAr: string;
  walkingDirectionEn: string;
  accentColor: string;
}

export interface HangarLocation {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  roleAr: string;
  roleEn: string;
  currentExhibitionAr: string;
  currentExhibitionEn: string;
  openHours: string;
  mapX: number; // 0..100%
  mapY: number;
  distanceMeters: number;
  bearingDeg: number;
  lat: number;
  lng: number;
  featuredArtworkId: string;
  image: string;
}

export interface GuidedTour {
  id: string;
  titleAr: string;
  titleEn: string;
  durationMinutes: number;
  stopsCount: number;
  color: string;
  descriptionAr: string;
  descriptionEn: string;
  stops: string[];
}

export interface JaxEvent {
  id: string;
  titleAr: string;
  titleEn: string;
  categoryAr: 'معارض رئيسية' | 'ورش عمل' | 'حوارات ثقافية' | 'عروض حية' | 'جولات قيّمة';
  categoryEn: 'Major Exhibition' | 'Workshop' | 'Cultural Talk' | 'Live Performance' | 'Curator Tour';
  hangarCode: string;
  hangarNameAr: string;
  hangarNameEn: string;
  dateTimeAr: string;
  dateTimeEn: string;
  timeSlot: string;
  isToday: boolean;
  statusAr: 'متاح الآن' | 'تسجيل مفتوح' | 'مقاعد محدودة' | 'مجاني للعموم';
  statusEn: 'Available Now' | 'Open Registration' | 'Limited Seats' | 'Free Admission';
  instructorOrHostAr: string;
  instructorOrHostEn: string;
  descriptionAr: string;
  descriptionEn: string;
  targetAudienceAr: string;
  targetAudienceEn: string;
  registrationRequired: boolean;
  featuredArtworkId?: string;
  image: string;
}

// Calculate real-world distance between GPS points
export function calculateGpsDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // metres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export const JAX_ARTWORKS: Artwork[] = [
  {
    id: 'art_horizon_portal',
    titleAr: 'بوابة الأفق الكينيتية',
    titleEn: 'The Horizon Kinetic Portal',
    artistAr: 'راشد الشعشعي',
    artistEn: 'Rashed Al Shashai',
    hangarCode: 'JAX 01',
    hangarNameAr: 'مقر بينالي الدرعية',
    hangarNameEn: 'Diriyah Biennale Pavilion',
    categoryAr: 'منحوتات معمارية كبرى',
    categoryEn: 'Monumental Kinetic Art',
    year: '2025',
    mediumAr: 'تيتانيوم مؤكسد، زجاج بصري عاكس، ألياف ضوئية ليزرية',
    mediumEn: 'Anodized titanium, optical refractive glass, laser fiber-optics',
    dimensions: '4.2m × 3.8m × 2.1m',
    descriptionAr: 'عمل نحتي ضخم يعيد صياغة الهندسة المعمارية النجدية عبر بوابات كينيتية عائمة تسبح في سماء ساحة بينالي الدرعية.',
    descriptionEn: 'A monumental kinetic portal translating traditional Najdi geometric apertures into suspended dynamic titanium rings.',
    curatorialEssayAr: 'يقدم راشد الشعشعي في هذا العمل حواراً بصرياً فائق الدقة؛ تستحضر النسب الهندسية عمارة حي الطريف التاريخي المسجل في اليونسكو، بينما تمنحها الحركة الهادئة بعداً فضائياً مستقبلياً يرحب بزوار حي جاكس.',
    curatorialEssayEn: 'Al Shashai establishes a rigorous spatial dialogue. The proportions echo the ancient masonry of historic At-Turaif, welcoming visitors into JAX through kinetic symmetry.',
    audioNarrationAr: 'أهلاً بك أمام بوابة الأفق الكينيتية في ساحة هنجر 01. لاحظ كيف تعكس الأوجه المعدنية المصقولة تفاصيل الفضاء المعماري المحيط بحي جاكس بدقة بلورية مبهرة.',
    audioNarrationEn: 'Welcome to the Horizon Portal at Hangar 01. Observe how the brushed titanium facets refract the ambient light and architectural lines of JAX District.',
    audioDurationSeconds: 145,
    initialDistanceMeters: 18,
    compassBearingDeg: 35,
    lat: 24.7438,
    lng: 46.5738,
    image: horizonPortalImg,
    walkingDirectionAr: 'امشِ للأمام نحو المدخل الرئيسي لهنجر بينالي الدرعية (JAX 01)',
    walkingDirectionEn: 'Walk straight toward the main entrance of Diriyah Biennale (JAX 01)',
    accentColor: '#00F0FF'
  },
  {
    id: 'art_clay_helix',
    titleAr: 'أصداء الطين المعاصرة',
    titleEn: 'Contemporary Echoes of Clay',
    artistAr: 'د. زهرة الغامدي',
    artistEn: 'Dr. Zahrah Al Ghamdi',
    hangarCode: 'JAX 12',
    hangarNameAr: 'حديقة المنحوتات الخارجية',
    hangarNameEn: 'Outdoor Sculpture Garden',
    categoryAr: 'تراكيب بيئية وأرضية',
    categoryEn: 'Land Art & Eco-Installations',
    year: '2024',
    mediumAr: 'طمي وادي حنيفة الطبيعي، رقائق فضية، بوليمر حيوي معالج',
    mediumEn: 'Native Wadi Hanifa silt, silver leaf, treated biopolymer',
    dimensions: '3.6m × 2.4m × 2.4m',
    descriptionAr: 'منحوتة لولبية تتلوى كشريط جيني صاعد من أرض وادي حنيفة، تمزج حبيبات الطين التاريخي بصلابة المعادن الفضية المصقولة.',
    descriptionEn: 'A fluid parametric helix rising like geological DNA from Diriyah bedrock, marrying native alluvial silt with polished metal.',
    curatorialEssayAr: 'تتعامل زهرة الغامدي مع المكان ككيان حي؛ التكوين المتصاعد يعانق سماء الدرعية بحركة بارامترية مدروسة تمثل أصالة الأرض وانطلاق النهضة الفنية المعاصرة.',
    curatorialEssayEn: 'Al Ghamdi treats earth and silt as living archives. The ascending helical curve rises with organic grace, honoring the ancestral soil of Wadi Hanifa.',
    audioNarrationAr: 'اقترب من سطح المنحوتة لتلاحظ التدرج البصري المتقن بين خشونة الصخور واللمعان الفضي في الهواء الطلق بحديقة منحوتات جاكس.',
    audioNarrationEn: 'Move closer to observe the tactile strata of native riverbed clay fused with contemporary aerospace alloy accents in the JAX garden.',
    audioDurationSeconds: 170,
    initialDistanceMeters: 38,
    compassBearingDeg: 110,
    lat: 24.7421,
    lng: 46.5749,
    image: clayMonumentImg,
    walkingDirectionAr: 'انعطف يميناً بعد الممشى الحجري باتجاه حديقة المنحوتات المفتوحة (JAX 12)',
    walkingDirectionEn: 'Turn right past the stone walkway toward Outdoor Sculpture Garden (JAX 12)',
    accentColor: '#38BDF8'
  },
  {
    id: 'art_light_prisms',
    titleAr: 'مختبر الشفرات والضوء',
    titleEn: 'Digital Code & Luminescence',
    artistAr: 'مهند شونو',
    artistEn: 'Muhannad Shono',
    hangarCode: 'JAX 03',
    hangarNameAr: 'مختبر الفنون الرقمية والواقع الممتد',
    hangarNameEn: 'Digital Art & XR Lab',
    categoryAr: 'فنون الميديا التفاعلية',
    categoryEn: 'Interactive Media & Light',
    year: '2025',
    mediumAr: 'أشعة ليزرية ديشرويك، خوارزميات ذكاء اصطناعي، مستشعرات حركة هوائية',
    mediumEn: 'Dichroic laser optics, AI choreographic algorithms, air sensors',
    dimensions: 'تركيب مكاني كامل داخل الهنجر',
    descriptionAr: 'فضاء غامر بالكامل يحول المستودع الصناعي الضخم إلى مسرح ضوئي حي يتفاعل مع خطوات الزوار ونسمات الهواء المارة.',
    descriptionEn: 'An immersive hangar-scale installation transforming industrial warehouse architecture into dynamic living light choreography.',
    curatorialEssayAr: 'يتحدى شونو في هذا التجهيز صلابة الهناجر الصناعية في جاكس، جاعلاً الضوء مادة ملموسة تسبح في الهواء، وتتفاعل مع تقنيات الرؤية الحاسوبية والواقع المعزز.',
    curatorialEssayEn: 'Shono activates the industrial heights of JAX warehouses, turning illumination into a tangible sculptural atmosphere that responds to real-time visitor presence.',
    audioNarrationAr: 'أنت الآن في رحاب مختبر الفنون الرقمية بهنجر 03. لاحظ كيف تنساب أشعة الليزر في الفضاء المرتفع للهنجر متزامنة مع قراءات المستشعرات البيئية.',
    audioNarrationEn: 'You are viewing the Digital XR Lab inside Hangar 03. Observe the light beams cutting through industrial trusses in harmony with ambient sensors.',
    audioDurationSeconds: 130,
    initialDistanceMeters: 55,
    compassBearingDeg: 195,
    lat: 24.7432,
    lng: 46.5742,
    image: digitalArtImg,
    walkingDirectionAr: 'واصل السير مستقيماً عبر البوليفارد الأوسط نحو هنجر الفنون الرقمية (JAX 03)',
    walkingDirectionEn: 'Continue straight down the central boulevard to Digital Art Lab (JAX 03)',
    accentColor: '#00F0FF'
  },
  {
    id: 'art_district_esplanade',
    titleAr: 'بوليفارد وساحات جاكس',
    titleEn: 'JAX Central Art Esplanade',
    artistAr: 'هيئة فنون العمارة والتصميم',
    artistEn: 'Architecture & Design Commission',
    hangarCode: 'JAX 15',
    hangarNameAr: 'الساحة المركزية والممشى الثقافي',
    hangarNameEn: 'Central Plaza & Concept Cafes',
    categoryAr: 'عمارة وتحول صناعي معاصر',
    categoryEn: 'Urban Architectural Heritage',
    year: '2024',
    mediumAr: 'ترميم صناعي، هياكل فولاذية أصلية، رصف حجري نجدي مستدام',
    mediumEn: 'Industrial adaptive reuse, original steel trusses, native paving',
    dimensions: 'مساحة 12,000 متر مربع',
    descriptionAr: 'الممشى الميداني الرئيسي الذي يربط أكثر من 25 هنجراً تم تحويلها من مستودعات صناعية إلى صالات عرض واستوديوهات فنية عالمية.',
    descriptionEn: 'The flagship pedestrian esplanade connecting over 25 historic industrial warehouses repurposed into world-class art galleries.',
    curatorialEssayAr: 'يجسد حي جاكس نموذجاً عالمياً رائداً في إعادة الاستخدام التكيفي للمباني الصناعية؛ حيث امتزجت أسقف المستودعات الجملونية الشاهقة بهوية الدرعية الثقافية الحديثة.',
    curatorialEssayEn: 'JAX exemplifies pioneering adaptive reuse in the Middle East, transforming 1970s industrial warehouses into a thriving cultural district.',
    audioNarrationAr: 'قف في قلب الساحة المركزية لترى تناغم الهياكل الفولاذية للمستودعات مع النخيل المحيط بوادي حنيفة ومقاهي الفن المتخصصة.',
    audioNarrationEn: 'Stand in the central plaza to experience the harmony between industrial steel trusses, Wadi Hanifa palms, and artisan coffee spaces.',
    audioDurationSeconds: 155,
    initialDistanceMeters: 45,
    compassBearingDeg: 275,
    lat: 24.7428,
    lng: 46.5746,
    image: districtAerialImg,
    walkingDirectionAr: 'اتجه غرباً باتجاه جاكس كافيه والساحة المركزية ومتاجر التصميم (JAX 15)',
    walkingDirectionEn: 'Head west towards JAX Social, specialty coffee and concept stores (JAX 15)',
    accentColor: '#38BDF8'
  }
];

export const JAX_HANGARS: HangarLocation[] = [
  {
    id: 'h_01',
    code: 'JAX 01',
    nameAr: 'مقر بينالي الدرعية للفن المعاصر',
    nameEn: 'Diriyah Biennale Foundation',
    roleAr: 'المعرض الدولي الرئيسي والندوات الفكرية',
    roleEn: 'Flagship International Exhibitions & Keynotes',
    currentExhibitionAr: "معرض 'أفق العبور' للفن المعاصر بمشاركة 65 فناناً",
    currentExhibitionEn: 'Horizon Crossing Exhibition featuring 65 international artists',
    openHours: '04:00 م - 11:00 م (يومياً)',
    mapX: 28,
    mapY: 32,
    distanceMeters: 18,
    bearingDeg: 35,
    lat: 24.7438,
    lng: 46.5738,
    featuredArtworkId: 'art_horizon_portal',
    image: horizonPortalImg
  },
  {
    id: 'h_03',
    code: 'JAX 03',
    nameAr: 'مختبر الفنون الرقمية والواقع الممتد',
    nameEn: 'Digital Arts & XR Lab',
    roleAr: 'عروض الذكاء الاصطناعي وتجهيزات الميديا التفاعلية',
    roleEn: 'AI Media Installations & Extended Reality Demos',
    currentExhibitionAr: 'مختبر الشفرات والضوء السعودي التفاعلي',
    currentExhibitionEn: 'Saudi Code & Luminescence Experiments',
    openHours: '04:00 م - 12:00 ص',
    mapX: 45,
    mapY: 22,
    distanceMeters: 55,
    bearingDeg: 195,
    lat: 24.7432,
    lng: 46.5742,
    featuredArtworkId: 'art_light_prisms',
    image: digitalArtImg
  },
  {
    id: 'h_07',
    code: 'JAX 07',
    nameAr: 'مسبك ومحترف النحت المعاصر',
    nameEn: 'Sculpture Foundry & Residency',
    roleAr: 'ورش صب المعادن والمشاغل الفنية المفتوحة',
    roleEn: 'Metal Casting, Sculpture Studios & Open Labs',
    currentExhibitionAr: 'أشكال من طويق: الحجر يتحدث بالتقنيات الحديثة',
    currentExhibitionEn: 'Forms from Tuwaiq: Speaking Stone',
    openHours: '02:00 م - 10:00 م',
    mapX: 72,
    mapY: 40,
    distanceMeters: 85,
    bearingDeg: 320,
    lat: 24.7426,
    lng: 46.5755,
    featuredArtworkId: 'art_clay_helix',
    image: clayMonumentImg
  },
  {
    id: 'h_12',
    code: 'JAX 12',
    nameAr: 'حديقة المنحوتات الخارجية',
    nameEn: 'Outdoor Sculpture Garden',
    roleAr: 'ميدان الفن العام والمنشآت الضخمة في الهواء الطلق',
    roleEn: 'Public Monuments & Open-Air Large Scale Works',
    currentExhibitionAr: 'منحوتات الهواء الطلق: تناغم الطبيعة والعمارة',
    currentExhibitionEn: 'Open Air Monuments: Nature & Architecture',
    openHours: 'مفتوح 24 ساعة (إضاءة ليلية كاملة)',
    mapX: 58,
    mapY: 65,
    distanceMeters: 38,
    bearingDeg: 110,
    lat: 24.7421,
    lng: 46.5749,
    featuredArtworkId: 'art_clay_helix',
    image: clayMonumentImg
  },
  {
    id: 'h_15',
    code: 'JAX 15',
    nameAr: 'جاكس كافيه والساحة المركزية',
    nameEn: 'JAX Social Plaza & Specialty Cafe',
    roleAr: 'المقهى الثقافي، متجر الكتب والمجسمات الفنية',
    roleEn: 'Art Bookshop, Specialty Coffee & Design Store',
    currentExhibitionAr: 'مطبوعات الدرعية وكتب الفنون المعاصرة',
    currentExhibitionEn: 'Diriyah Prints & Contemporary Monographs',
    openHours: '08:00 ص - 01:00 ص',
    mapX: 38,
    mapY: 78,
    distanceMeters: 45,
    bearingDeg: 275,
    lat: 24.7428,
    lng: 46.5746,
    featuredArtworkId: 'art_district_esplanade',
    image: districtAerialImg
  }
];

export const JAX_EVENTS: JaxEvent[] = [
  {
    id: 'ev_biennale_flagship',
    titleAr: "معرض بينالي الدرعية الدولي 'أفق العبور'",
    titleEn: "Diriyah Biennale 'Horizon Crossing' Flagship Exhibition",
    categoryAr: 'معارض رئيسية',
    categoryEn: 'Major Exhibition',
    hangarCode: 'JAX 01',
    hangarNameAr: 'مقر بينالي الدرعية للفن المعاصر',
    hangarNameEn: 'Diriyah Biennale Pavilion',
    dateTimeAr: 'مستمر يومياً حتى 15 أبريل 2026',
    dateTimeEn: 'Daily until April 15, 2026',
    timeSlot: '04:00 م - 11:00 م',
    isToday: true,
    statusAr: 'متاح الآن',
    statusEn: 'Available Now',
    instructorOrHostAr: 'القيّم الفني الدولي د. أولافور كينغ بالشراكة مع وزارة الثقافة',
    instructorOrHostEn: 'Curated by Dr. Olafur King & Ministry of Culture',
    descriptionAr: 'أضخم معرض فني معاصر في المنطقة يجمع أكثر من 65 فناناً سعودياً وعالمياً يستكشفون التحولات البيئية والمعمارية في نجد والعالم.',
    descriptionEn: 'The flagship international contemporary art biennale bringing together 65 prominent regional and global artists exploring environmental and spatial transformation.',
    targetAudienceAr: 'الجمهور العام، متذوقو الفن، المعماريون والباحثون',
    targetAudienceEn: 'General Public, Art Lovers, Architects & Scholars',
    registrationRequired: false,
    featuredArtworkId: 'art_horizon_portal',
    image: horizonPortalImg
  },
  {
    id: 'ev_bronze_sculpture_workshop',
    titleAr: 'ورشة صب البرونز والنحت التجسيدي للمحترفين',
    titleEn: 'Bronze Casting & Form Sculpture Masterclass',
    categoryAr: 'ورش عمل',
    categoryEn: 'Workshop',
    hangarCode: 'JAX 07',
    hangarNameAr: 'مسبك ومحترف النحت المعاصر',
    hangarNameEn: 'Sculpture Foundry & Residency',
    dateTimeAr: 'اليوم، الإثنين | جلسة مسائية عملية',
    dateTimeEn: 'Today, Monday | Hands-on Evening Session',
    timeSlot: '06:00 م - 09:00 م',
    isToday: true,
    statusAr: 'مقاعد محدودة',
    statusEn: 'Limited Seats',
    instructorOrHostAr: 'النحات معاذ العوفي وفريق مسبك جاكس الحرفي',
    instructorOrHostEn: 'Sculptor Moath Alofi & JAX Foundry Craftsmen',
    descriptionAr: 'تطبيق عملي مباشر على أفران صب المعادن وقوالب السيليكون لإنتاج نماذج مصغرة مستلهمة من صخور جبل طويق الشامخة.',
    descriptionEn: 'Hands-on furnace casting and silicone molding to sculpt miniature maquettes inspired by the geological strata of Tuwaiq.',
    targetAudienceAr: 'الفنانون، طلاب الفنون الجميلة، وهواة النحت',
    targetAudienceEn: 'Artists, Fine Arts Students, Sculpture Enthusiasts',
    registrationRequired: true,
    featuredArtworkId: 'art_clay_helix',
    image: clayMonumentImg
  },
  {
    id: 'ev_ai_digital_lab',
    titleAr: 'مختبر الذكاء الاصطناعي والإسقاط الضوئي التفاعلي',
    titleEn: 'Generative AI & Interactive Light Projection Lab',
    categoryAr: 'ورش عمل',
    categoryEn: 'Workshop',
    hangarCode: 'JAX 03',
    hangarNameAr: 'مختبر الفنون الرقمية والواقع الممتد',
    hangarNameEn: 'Digital Art & XR Lab',
    dateTimeAr: 'اليوم، الإثنين | عرض مباشر وحلقة نقاش',
    dateTimeEn: 'Today, Monday | Live Demo & Coding Circle',
    timeSlot: '07:30 م - 09:30 م',
    isToday: true,
    statusAr: 'تسجيل مفتوح',
    statusEn: 'Open Registration',
    instructorOrHostAr: 'الفنان مهند شونو ومطورو مختبر جاكس XR',
    instructorOrHostEn: 'Artist Muhannad Shono & JAX XR Lab Engineers',
    descriptionAr: 'شرح حي لطرق برمجة مستشعرات الحركة والرياح لتوليد مسارات ضوئية ديناميكية على جدران المستودع باستخدام مكتبات Three.js وخوارزميات الذكاء الاصطناعي.',
    descriptionEn: 'Live programming of motion sensors to generate responsive light choreographies across warehouse walls using generative models and Three.js.',
    targetAudienceAr: 'المبرمجون الإبداعيون، مصممو الميديا، ومحبو التكنولوجيا',
    targetAudienceEn: 'Creative Coders, Media Designers, Tech Enthusiasts',
    registrationRequired: true,
    featuredArtworkId: 'art_light_prisms',
    image: digitalArtImg
  },
  {
    id: 'ev_curatorial_panel',
    titleAr: 'حوار القيّمين: أصالة الطين والآفاق الفضائية في الدرعية',
    titleEn: 'Curatorial Panel: Heritage Earth & Spatial Horizons',
    categoryAr: 'حوارات ثقافية',
    categoryEn: 'Cultural Talk',
    hangarCode: 'JAX 01',
    hangarNameAr: 'القاعة الفكرية بمقر بينالي الدرعية',
    hangarNameEn: 'Keynote Auditorium, Biennale Pavilion',
    dateTimeAr: 'غداً، الثلاثاء | 08:00 مساءً',
    dateTimeEn: 'Tomorrow, Tuesday | 08:00 PM',
    timeSlot: '08:00 م - 09:30 م',
    isToday: false,
    statusAr: 'مجاني للعموم',
    statusEn: 'Free Admission',
    instructorOrHostAr: 'د. زهرة الغامدي، راشد الشعشعي، وقيّمو مؤسسة بينالي الدرعية',
    instructorOrHostEn: 'Dr. Zahrah Al Ghamdi, Rashed Al Shashai & Curators',
    descriptionAr: 'جلسة نقدية مفتوحة تستكشف كيف أعاد الفنانون المعاصرون توظيف طين الطريف وأحجار وادي حنيفة في إنتاج أعمال بصرية تحاور المعايير المتحفية الدولية.',
    descriptionEn: 'An open critical panel examining how Saudi contemporary sculptors reinterpret native alluvial earth and limestone into international museum-grade installations.',
    targetAudienceAr: 'الأكاديميون، النقاد، طلاب الجامعات، ومحبو الفن المعاصر',
    targetAudienceEn: 'Academics, Critics, University Students, Art Lovers',
    registrationRequired: false,
    featuredArtworkId: 'art_horizon_portal',
    image: horizonPortalImg
  },
  {
    id: 'ev_clay_family_workshop',
    titleAr: 'ورشة تشكيل خزف وفخار وادي حنيفة للعائلات',
    titleEn: 'Wadi Hanifa Clay & Pottery Family Studio',
    categoryAr: 'ورش عمل',
    categoryEn: 'Workshop',
    hangarCode: 'JAX 12',
    hangarNameAr: 'مظلة حديقة المنحوتات الخارجية',
    hangarNameEn: 'Outdoor Sculpture Garden Pavilion',
    dateTimeAr: 'الخميس والجمعة | نشاط عائلي ممتع',
    dateTimeEn: 'Thursday & Friday | Family Weekend Activity',
    timeSlot: '04:30 م - 06:30 م',
    isToday: false,
    statusAr: 'تسجيل مفتوح',
    statusEn: 'Open Registration',
    instructorOrHostAr: 'فريق الحرف اليدوية السعودية بالدرعية',
    instructorOrHostEn: 'Saudi Craft Heritage Master Artisans',
    descriptionAr: 'ورشة مخصصة لجميع الأعمار تتيح للأطفال والعائلات لمس طين الدرعية النقي وتشكيل أواني وزخارف نجدية تقليدية وتلوينها بأكاسيد طبيعية.',
    descriptionEn: 'A hands-on family workshop allowing all ages to mold native Diriyah clay into traditional Najdi vessels and tiles using mineral pigments.',
    targetAudienceAr: 'العائلات، الأطفال من سن 6 سنوات، والناشئة',
    targetAudienceEn: 'Families, Children (6+), Young Explorers',
    registrationRequired: true,
    featuredArtworkId: 'art_clay_helix',
    image: clayMonumentImg
  },
  {
    id: 'ev_ambient_sound_performance',
    titleAr: 'عروض الصوت المحيطي والسينوغرافيا الليلية',
    titleEn: 'Ambient Soundscapes & Night Scenography Performance',
    categoryAr: 'عروض حية',
    categoryEn: 'Live Performance',
    hangarCode: 'JAX 15',
    hangarNameAr: 'المسرح المفتوح بالساحة المركزية',
    hangarNameEn: 'Central Plaza Open Amphitheater',
    dateTimeAr: 'الجمعة، 10 أكتوبر | ليلة فنية ساحرة',
    dateTimeEn: 'Friday, Oct 10 | Immersive Evening',
    timeSlot: '09:00 م - 11:30 م',
    isToday: false,
    statusAr: 'مجاني للعموم',
    statusEn: 'Free Admission',
    instructorOrHostAr: 'مؤلفو الموسيقى المعاصرة وفناني السمعيات السعوديين',
    instructorOrHostEn: 'Contemporary Saudi Experimental Sound Artists',
    descriptionAr: 'أمسية صوتية فضائية تمزج تسجيلات حية لرياح وادي حنيفة ونخيل الدرعية مع نغمات إلكترونية ومؤثرات ضوئية على واجهات الهناجر الفولاذية.',
    descriptionEn: 'A spatial acoustic evening layering field recordings of Wadi Hanifa wind currents and desert palms with ambient synthesizers projected across warehouse facades.',
    targetAudienceAr: 'عشاق الموسيقى التجريبية وفنون الأداء المعاصر',
    targetAudienceEn: 'Experimental Music Fans & Performance Art Aficionados',
    registrationRequired: false,
    featuredArtworkId: 'art_district_esplanade',
    image: districtAerialImg
  },
  {
    id: 'ev_architecture_walking_tour',
    titleAr: 'جولة معمارية متخصصة: هندسة التحول الصناعي في جاكس',
    titleEn: 'Curated Architectural Tour: Adaptive Reuse of JAX',
    categoryAr: 'جولات قيّمة',
    categoryEn: 'Curator Tour',
    hangarCode: 'JAX 15',
    hangarNameAr: 'نقطة الانطلاق: الساحة المركزية بجوار المقهى',
    hangarNameEn: 'Start Point: Central Plaza at JAX Social',
    dateTimeAr: 'السبت، 11 أكتوبر | جولة صباحية ميدانية',
    dateTimeEn: 'Saturday, Oct 11 | Morning Field Walk',
    timeSlot: '09:30 ص - 11:30 ص',
    isToday: false,
    statusAr: 'مقاعد محدودة',
    statusEn: 'Limited Seats',
    instructorOrHostAr: 'المهندس المعماري طارق العيسى (هيئة فنون العمارة والتصميم)',
    instructorOrHostEn: 'Architect Tariq Al-Issa (Architecture & Design Commission)',
    descriptionAr: 'جولة مشي معمارية شاملة تشرح تفاصيل الحفاظ على الهياكل الفولاذية الأصلية لعام 1975 وكيفية عزل الأسقف وتوفير الإضاءة الطبيعية لصالات العرض الدولية.',
    descriptionEn: 'An in-depth architectural walk detailing the preservation of original 1970s structural steel frames, acoustic retrofitting, and daylight engineering.',
    targetAudienceAr: 'المعماريون، المهندسون، ومحبو التراث العمراني الصناعي',
    targetAudienceEn: 'Architects, Civil Engineers, Urban Heritage Enthusiasts',
    registrationRequired: true,
    featuredArtworkId: 'art_district_esplanade',
    image: districtAerialImg
  },
  {
    id: 'ev_book_signing_art_fair',
    titleAr: 'ملتقى مطبوعات الدرعية وتوقيع كتب الفنون المعاصرة',
    titleEn: 'Diriyah Contemporary Art Prints & Book Signing Fair',
    categoryAr: 'حوارات ثقافية',
    categoryEn: 'Cultural Talk',
    hangarCode: 'JAX 15',
    hangarNameAr: 'متجر الكتب والمطبوعات الفنية بجاكس كافيه',
    hangarNameEn: 'Art Bookshop & Prints Space at JAX Social',
    dateTimeAr: 'مستمر يومياً طوال الأسبوع',
    dateTimeEn: 'Daily throughout the week',
    timeSlot: '05:00 م - 10:00 م',
    isToday: true,
    statusAr: 'متاح الآن',
    statusEn: 'Available Now',
    instructorOrHostAr: 'دار نشر بينالي الدرعية ومكتبة جاكس الفنية',
    instructorOrHostEn: 'Diriyah Biennale Publishing & JAX Art Library',
    descriptionAr: 'معرض دائم للكتب الفنية النادرة، المونوجرافات النقدية الموثقة لبينالي الدرعية، والمطبوعات الحريرية الموقعة بأيدي الفنانين السعوديين.',
    descriptionEn: 'A curated selection of rare art monographs, exhibition catalogs, and limited-edition serigraph prints signed by prominent Saudi artists.',
    targetAudienceAr: 'المهتمون باقتناء الأعمال، القراء، ومحبو الفنون',
    targetAudienceEn: 'Collectors, Readers, Art Publications Enthusiasts',
    registrationRequired: false,
    featuredArtworkId: 'art_district_esplanade',
    image: districtAerialImg
  }
];

export const JAX_TOURS: GuidedTour[] = [
  {
    id: 'tour_biennale',
    titleAr: 'مسار بينالي الدرعية الرئيسي',
    titleEn: 'Diriyah Biennale Highlights',
    durationMinutes: 45,
    stopsCount: 3,
    color: '#00F0FF',
    descriptionAr: 'جولة موجهة تمر بأبرز المنحوتات الكبرى داخل ساحات هنجر 01 وبينالي الدرعية.',
    descriptionEn: 'Curated walking tour covering key landmark installations at Hangar 01 and Biennale plazas.',
    stops: ['art_horizon_portal', 'art_clay_helix', 'art_district_esplanade']
  },
  {
    id: 'tour_digital',
    titleAr: 'مسار الفنون الرقمية وتجهيزات الضوء',
    titleEn: 'Digital Light & Code Tour',
    durationMinutes: 30,
    stopsCount: 3,
    color: '#38BDF8',
    descriptionAr: 'استكشف هناجر التقنية الإبداعية التي تستخدم خوارزميات الذكاء الاصطناعي وأشعة الليزر.',
    descriptionEn: 'Discover creative technology spaces featuring generative algorithms and laser acoustics.',
    stops: ['art_light_prisms', 'art_horizon_portal', 'art_district_esplanade']
  },
  {
    id: 'tour_heritage',
    titleAr: 'مسار التحول الصناعي والتراثي',
    titleEn: 'Industrial Heritage Walking Tour',
    durationMinutes: 40,
    stopsCount: 3,
    color: '#94A3B8',
    descriptionAr: 'رحلة استكشافية توضح كيف تحولت مستودعات جاكس الصناعية إلى أرقى حي للفنون بالمملكة.',
    descriptionEn: 'An architectural journey exploring the adaptive transformation of 1970s warehouses into art spaces.',
    stops: ['art_district_esplanade', 'art_clay_helix', 'art_horizon_portal']
  }
];
