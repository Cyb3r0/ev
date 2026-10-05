package com.example.data

data class Artwork3DPoint(val x: Float, val y: Float, val z: Float)
data class Artwork3DEdge(val startIndex: Int, val endIndex: Int)

enum class RenderStyle {
    METALLIC_GOLD,
    CYAN_HOLOGRAM,
    DESERT_TERRACOTTA
}

enum class ArtworkCategory(val labelAr: String, val labelEn: String) {
    SCULPTURE("منحوتات معمارية", "Architectural Sculptures"),
    INTERACTIVE("أعمال تفاعلية", "Interactive Installations"),
    DIGITAL("فنون ضوئية ورقمية", "Digital & Light Art"),
    HERITAGE("تراث معاصر", "Contemporary Heritage")
}

data class Artwork(
    val id: String,
    val titleAr: String,
    val titleEn: String,
    val artistAr: String,
    val artistEn: String,
    val hangarCode: String,
    val hangarNameAr: String,
    val hangarNameEn: String,
    val category: ArtworkCategory,
    val year: String,
    val mediumAr: String,
    val mediumEn: String,
    val dimensions: String,
    val descriptionAr: String,
    val descriptionEn: String,
    val curatorialEssayAr: String,
    val curatorialEssayEn: String,
    val audioDurationSeconds: Int,
    val audioNarrationAr: String,
    val audioNarrationEn: String,
    val initialDistanceMeters: Int,
    val compassBearingDeg: Float, // Relative bearing from entrance (0-360)
    val meshVertices: List<Artwork3DPoint>,
    val meshEdges: List<Artwork3DEdge>,
    val baseScale: Float = 1.0f
)

data class HangarLocation(
    val id: String,
    val code: String, // e.g. "JAX 01"
    val nameAr: String,
    val nameEn: String,
    val roleAr: String,
    val roleEn: String,
    val currentExhibitionAr: String,
    val currentExhibitionEn: String,
    val openHours: String,
    val mapX: Float, // Normalized 0..1 coordinates on JAX district map
    val mapY: Float,
    val distanceMeters: Int,
    val bearingDeg: Float,
    val featuredArtworkIds: List<String>
)

data class GuidedTour(
    val id: String,
    val titleAr: String,
    val titleEn: String,
    val durationMinutes: Int,
    val stopCount: Int,
    val themeColorHex: Long,
    val descriptionAr: String,
    val descriptionEn: String,
    val stops: List<String> // List of artwork IDs
)

data class ArSavedSnapshot(
    val id: String,
    val artworkTitleAr: String,
    val artworkTitleEn: String,
    val artistAr: String,
    val artistEn: String,
    val dateString: String,
    val renderStyle: RenderStyle,
    val distanceMeters: Int
)

object JaxDataProvider {

    // 3D Geometry for Horizon Portal (Kinetic double arch + rotating diamond prism)
    private val horizonGateVertices = listOf(
        // Outer Arch 1
        Artwork3DPoint(-1.2f, -1.8f, 0.0f),
        Artwork3DPoint(-1.0f, 1.2f, 0.0f),
        Artwork3DPoint(0.0f, 1.9f, 0.0f),
        Artwork3DPoint(1.0f, 1.2f, 0.0f),
        Artwork3DPoint(1.2f, -1.8f, 0.0f),
        // Inner Arch 2
        Artwork3DPoint(-0.7f, -1.8f, 0.3f),
        Artwork3DPoint(-0.6f, 0.8f, 0.3f),
        Artwork3DPoint(0.0f, 1.3f, 0.3f),
        Artwork3DPoint(0.6f, 0.8f, 0.3f),
        Artwork3DPoint(0.7f, -1.8f, 0.3f),
        // Central Floating Diamond
        Artwork3DPoint(0.0f, 0.6f, 0.0f),
        Artwork3DPoint(-0.45f, 0.0f, 0.0f),
        Artwork3DPoint(0.0f, -0.6f, 0.0f),
        Artwork3DPoint(0.45f, 0.0f, 0.0f),
        Artwork3DPoint(0.0f, 0.0f, 0.45f),
        Artwork3DPoint(0.0f, 0.0f, -0.45f)
    )

    private val horizonGateEdges = listOf(
        Artwork3DEdge(0, 1), Artwork3DEdge(1, 2), Artwork3DEdge(2, 3), Artwork3DEdge(3, 4),
        Artwork3DEdge(5, 6), Artwork3DEdge(6, 7), Artwork3DEdge(7, 8), Artwork3DEdge(8, 9),
        Artwork3DEdge(1, 6), Artwork3DEdge(2, 7), Artwork3DEdge(3, 8),
        Artwork3DEdge(10, 11), Artwork3DEdge(11, 12), Artwork3DEdge(12, 13), Artwork3DEdge(13, 10),
        Artwork3DEdge(10, 14), Artwork3DEdge(11, 14), Artwork3DEdge(12, 14), Artwork3DEdge(13, 14),
        Artwork3DEdge(10, 15), Artwork3DEdge(11, 15), Artwork3DEdge(12, 15), Artwork3DEdge(13, 15)
    )

    // 3D Geometry for Echoes of Clay (Parametric helical spiral / Najdi mud prism)
    private val clayEchoesVertices = run {
        val list = mutableListOf<Artwork3DPoint>()
        val steps = 18
        for (i in 0 until steps) {
            val theta = (i.toFloat() / steps) * 4.0f * Math.PI.toFloat()
            val radius = 0.3f + 0.8f * (i.toFloat() / steps)
            val y = -1.6f + (i.toFloat() / steps) * 3.2f
            val x = (Math.cos(theta.toDouble()) * radius).toFloat()
            val z = (Math.sin(theta.toDouble()) * radius).toFloat()
            list.add(Artwork3DPoint(x, y, z))
            list.add(Artwork3DPoint(x * 0.6f, y, z * 0.6f))
        }
        list
    }

    private val clayEchoesEdges = run {
        val edges = mutableListOf<Artwork3DEdge>()
        val count = clayEchoesVertices.size
        for (i in 0 until count - 2 step 2) {
            edges.add(Artwork3DEdge(i, i + 2))
            edges.add(Artwork3DEdge(i + 1, i + 3))
            edges.add(Artwork3DEdge(i, i + 1))
            edges.add(Artwork3DEdge(i, i + 3))
        }
        edges
    }

    // 3D Geometry for Prisms of Wind (Icosahedral crystalline cluster)
    private val windPrismsVertices = listOf(
        Artwork3DPoint(0.0f, 1.4f, 0.0f),
        Artwork3DPoint(1.2f, 0.4f, 0.4f),
        Artwork3DPoint(0.4f, 0.4f, 1.2f),
        Artwork3DPoint(-0.9f, 0.4f, 0.8f),
        Artwork3DPoint(-0.9f, 0.4f, -0.8f),
        Artwork3DPoint(0.4f, 0.4f, -1.2f),
        Artwork3DPoint(0.9f, -0.4f, 0.8f),
        Artwork3DPoint(-0.4f, -0.4f, 1.2f),
        Artwork3DPoint(-1.2f, -0.4f, -0.4f),
        Artwork3DPoint(-0.4f, -0.4f, -1.2f),
        Artwork3DPoint(0.9f, -0.4f, -0.8f),
        Artwork3DPoint(0.0f, -1.4f, 0.0f)
    )

    private val windPrismsEdges = listOf(
        Artwork3DEdge(0, 1), Artwork3DEdge(0, 2), Artwork3DEdge(0, 3), Artwork3DEdge(0, 4), Artwork3DEdge(0, 5),
        Artwork3DEdge(1, 2), Artwork3DEdge(2, 3), Artwork3DEdge(3, 4), Artwork3DEdge(4, 5), Artwork3DEdge(5, 1),
        Artwork3DEdge(1, 6), Artwork3DEdge(2, 7), Artwork3DEdge(3, 8), Artwork3DEdge(4, 9), Artwork3DEdge(5, 10),
        Artwork3DEdge(6, 7), Artwork3DEdge(7, 8), Artwork3DEdge(8, 9), Artwork3DEdge(9, 10), Artwork3DEdge(10, 6),
        Artwork3DEdge(11, 6), Artwork3DEdge(11, 7), Artwork3DEdge(11, 8), Artwork3DEdge(11, 9), Artwork3DEdge(11, 10)
    )

    // 3D Geometry for Wadi Hanifa Flow (Harmonic Wave Ribbon)
    private val wadiFlowVertices = run {
        val pts = mutableListOf<Artwork3DPoint>()
        for (i in 0..12) {
            val t = (i / 12f) * 4f - 2f
            val waveY1 = Math.sin(t * 2.2).toFloat() * 0.7f
            val waveZ1 = Math.cos(t * 1.5).toFloat() * 0.6f
            pts.add(Artwork3DPoint(t, waveY1, waveZ1))
            pts.add(Artwork3DPoint(t, waveY1 - 0.45f, waveZ1 + 0.35f))
        }
        pts
    }

    private val wadiFlowEdges = run {
        val list = mutableListOf<Artwork3DEdge>()
        for (i in 0 until wadiFlowVertices.size - 2 step 2) {
            list.add(Artwork3DEdge(i, i + 2))
            list.add(Artwork3DEdge(i + 1, i + 3))
            list.add(Artwork3DEdge(i, i + 1))
            list.add(Artwork3DEdge(i, i + 3))
        }
        list
    }

    // 3D Geometry for Tuwaiq Monolith (Chiseled stepped obelisk)
    private val tuwaiqVertices = listOf(
        // Base
        Artwork3DPoint(-1.0f, -1.8f, -1.0f),
        Artwork3DPoint(1.0f, -1.8f, -1.0f),
        Artwork3DPoint(1.0f, -1.8f, 1.0f),
        Artwork3DPoint(-1.0f, -1.8f, 1.0f),
        // Mid tier
        Artwork3DPoint(-0.7f, 0.1f, -0.7f),
        Artwork3DPoint(0.7f, 0.1f, -0.7f),
        Artwork3DPoint(0.7f, 0.1f, 0.7f),
        Artwork3DPoint(-0.7f, 0.1f, 0.7f),
        // Upper tier
        Artwork3DPoint(-0.35f, 1.4f, -0.35f),
        Artwork3DPoint(0.35f, 1.4f, -0.35f),
        Artwork3DPoint(0.35f, 1.4f, 0.35f),
        Artwork3DPoint(-0.35f, 1.4f, 0.35f),
        // Apex
        Artwork3DPoint(0.0f, 2.0f, 0.0f)
    )

    private val tuwaiqEdges = listOf(
        Artwork3DEdge(0, 1), Artwork3DEdge(1, 2), Artwork3DEdge(2, 3), Artwork3DEdge(3, 0),
        Artwork3DEdge(4, 5), Artwork3DEdge(5, 6), Artwork3DEdge(6, 7), Artwork3DEdge(7, 4),
        Artwork3DEdge(0, 4), Artwork3DEdge(1, 5), Artwork3DEdge(2, 6), Artwork3DEdge(3, 7),
        Artwork3DEdge(8, 9), Artwork3DEdge(9, 10), Artwork3DEdge(10, 11), Artwork3DEdge(11, 8),
        Artwork3DEdge(4, 8), Artwork3DEdge(5, 9), Artwork3DEdge(6, 10), Artwork3DEdge(7, 11),
        Artwork3DEdge(8, 12), Artwork3DEdge(9, 12), Artwork3DEdge(10, 12), Artwork3DEdge(11, 12)
    )

    val artworks: List<Artwork> = listOf(
        Artwork(
            id = "art_horizon_portal",
            titleAr = "بوابة الأفق الكينيتية",
            titleEn = "The Horizon Kinetic Portal",
            artistAr = "راشد الشعشعي",
            artistEn = "Rashed Al Shashai",
            hangarCode = "JAX 01",
            hangarNameAr = "مقر بينالي الدرعية",
            hangarNameEn = "Diriyah Biennale Pavilion",
            category = ArtworkCategory.SCULPTURE,
            year = "2025",
            mediumAr = "هيكل تيتانيوم مؤكسد، زجاج بصري، ألياف ضوئية ذكية",
            mediumEn = "Anodized titanium, optical glass, programmable fiber optics",
            dimensions = "4.2m × 3.8m × 2.1m",
            descriptionAr = "عمل نحتي ضخم يعيد صياغة المثلثات النجدية التراثية من خلال بوابات حركية متداخلة تنبض بضوء الفجر الذهبي في الدرعية.",
            descriptionEn = "A monumental kinetic portal reinterpreting traditional Najdi triangles through nested dynamic apertures pulsing with Diriyah dawn light.",
            curatorialEssayAr = "يقدم راشد الشعشعي في هذا العمل حواراً بصرياً بين الماضي والمستقبل؛ حيث تستحضر النسب الهندسية الدقيقة عمارة حي الطريف التاريخي الملاصق لجاكس، في حين تمنحها الحركة الهادئة بعداً كونياً متجدداً يرحب بزوار الحي الفني.",
            curatorialEssayEn = "Al Shashai establishes a poetic dialogue between memory and future. The rigorous geometric proportions evoke the earthen walls of historic At-Turaif, while fluid mechanical rotations welcome visitors into JAX's creative tomorrow.",
            audioDurationSeconds = 145,
            audioNarrationAr = "أهلاً بك أمام بوابة الأفق. لاحظ كيف تعكس الأوجه المعدنية تدرجات شمس الدرعية. كل دوران للبوابة يفتح لك زاوية رؤية جديدة نحو وادي حنيفة، وكأنك تعبر من بوابة الزمن بين طين الدرعية العتيق ومستقبل الفن المعاصر.",
            audioNarrationEn = "Welcome to the Horizon Portal. Observe how its brushed facets refract the changing desert sun. Each gentle cycle frames a new vista across Wadi Hanifa, inviting you to cross between heritage mudbrick and visionary contemporary expression.",
            initialDistanceMeters = 8,
            compassBearingDeg = 35.0f,
            meshVertices = horizonGateVertices,
            meshEdges = horizonGateEdges,
            baseScale = 1.15f
        ),
        Artwork(
            id = "art_clay_echoes",
            titleAr = "أصداء الطين المعاصرة",
            titleEn = "Contemporary Echoes of Clay",
            artistAr = "د. زهرة الغامدي",
            artistEn = "Dr. Zahrah Al Ghamdi",
            hangarCode = "JAX 12",
            hangarNameAr = "حديقة المنحوتات المفتوحة",
            hangarNameEn = "Outdoor Sculpture Garden",
            category = ArtworkCategory.HERITAGE,
            year = "2024",
            mediumAr = "طين الدرعية الطبيعي، رمل الوادي، رقائق برونز، بوليمر حيوي",
            mediumEn = "Native Diriyah clay, valley sand, bronze leaf, bio-polymer",
            dimensions = "3.6m × 2.4m × 2.4m",
            descriptionAr = "منحوتة لولبية بارامترية تستلهم تدرجات الطين النجدي وتكويناته الرسوبية عبر آلاف السنين لتجسيد ذاكرة المكان.",
            descriptionEn = "A parametric helical sculpture sculpted from authentic Diriyah clay strata, embodying millennia of architectural memory.",
            curatorialEssayAr = "تتعامل زهرة الغامدي مع التراب والطين ككائنات حية تحتفظ بذكريات الأجداد. المنحوتة تتلوى للأعلى كأثر رمزي يرتفع من أرض وادي حنيفة ليعانق سماء الدرعية، وتتغير نبرة ألوانها مع رطوبة الجو والرياح.",
            curatorialEssayEn = "Al Ghamdi treats earth and silt as living archives. The rising helix ascends from the bedrock of Diriyah, responding organically to ambient humidity, dusk winds, and visitor proximity.",
            audioDurationSeconds = 170,
            audioNarrationAr = "اقترب من سطح المنحوتة لتشعر بحبيبات طين وادي حنيفة. استغرقت الفنانة أشهراً في جمع عينات التربة من بقاع الدرعية القديمة لتمزجها بهذه الدقة البارامترية المعاصرة.",
            audioNarrationEn = "Move closer to inspect the strata of native riverbed clay. The artist gathered soil specimens across Old Diriyah, fusing ancestral earth with algorithmic curvature.",
            initialDistanceMeters = 24,
            compassBearingDeg = 110.0f,
            meshVertices = clayEchoesVertices,
            meshEdges = clayEchoesEdges,
            baseScale = 0.95f
        ),
        Artwork(
            id = "art_wind_prisms",
            titleAr = "شظايا النور والرياح",
            titleEn = "Prisms of Wind & Light",
            artistAr = "مهند شونو",
            artistEn = "Muhannad Shono",
            hangarCode = "JAX 03",
            hangarNameAr = "مختبر الفنون الرقمية",
            hangarNameEn = "Digital Art & XR Lab",
            category = ArtworkCategory.DIGITAL,
            year = "2025",
            mediumAr = "بلورات ديشرويك عاكسة، محركات ميكرو دقيقة، مستشعرات حركة هوائية",
            mediumEn = "Dichroic optical prisms, micro-stepper motors, atmospheric sensors",
            dimensions = "2.8m × 2.8m × 3.2m",
            descriptionAr = "تركيب بلوري عائم يتفاعل مع نسمات الهواء وأجهزة الواقع المعزز لتوليد أطياف ضوئية ساحرة في الفضاء المحيط.",
            descriptionEn = "A floating crystalline polyhedron cluster reacting to physical airflow and AR tracking to cast refractive light choreographies.",
            curatorialEssayAr = "يتحدى شونو في هذا العمل صلابة الهناجر الصناعية في جاكس، جاعلاً الضوء مادة ملموسة تسبح في الهواء. يدمج العمل بين المستشعرات البيئية والواقع المعزز لتمكين الزائر من لمس شعاع الضوء وتوجيهه.",
            curatorialEssayEn = "Shono destabilizes the industrial rigidity of JAX's warehouses by transforming ambient luminosity into a palpable kinetic sculpture. The AR layer enables viewers to sculpt beams in real-time.",
            audioDurationSeconds = 130,
            audioNarrationAr = "في هذا العمل الرقمي، يمكنك ملاحظة كيف تتغير البلورات مع اتجاه هاتفك. البلورة المركزية تستقبل اتجاه الرياح في الدرعية في هذه اللحظة بالذات وتعيد رسم الظلال في الواقع المعزز.",
            audioNarrationEn = "Notice how the crystalline facets realign as you rotate your device. The installation polls live Diriyah wind currents, projecting responsive caustics across your screen.",
            initialDistanceMeters = 42,
            compassBearingDeg = 195.0f,
            meshVertices = windPrismsVertices,
            meshEdges = windPrismsEdges,
            baseScale = 1.0f
        ),
        Artwork(
            id = "art_wadi_hanifa",
            titleAr = "جريان وادي حنيفة",
            titleEn = "Wadi Hanifa Flow",
            artistAr = "د. أحمد ماطر",
            artistEn = "Dr. Ahmed Mater",
            hangarCode = "JAX 15",
            hangarNameAr = "ساحة جاكس المركزية",
            hangarNameEn = "JAX Central Plaza",
            category = ArtworkCategory.INTERACTIVE,
            year = "2024",
            mediumAr = "فولاذ مقاوم للصدأ مصقول، نبضات ضوء ليزري أزرق زمردي، ماء معاد تدويره",
            mediumEn = "Mirror-finish stainless steel, emerald laser pulses, circulating water",
            dimensions = "6.0m × 1.5m × 1.8m",
            descriptionAr = "شريط متموج يعكس شريان الحياة في الدرعية، ينبض بأمواج ضوئية تشبه انسياب المياه الرقراقة بين نخيل الوادي.",
            descriptionEn = "An undulating sculptural ribbon reflecting the ecological lifeline of Diriyah, radiating ripples of emerald and solar luminescence.",
            curatorialEssayAr = "يعيد أحمد ماطر ربط الزائر بالطبيعة الهيدرولوجية التي أنشأت الدرعية قبل مئات السنين. السطح المصقول كالمرآة يدمج سماء نجد وأجساد الزوار في تدفق واحد مستمر لا ينقطع.",
            curatorialEssayEn = "Mater rekindles our vital kinship with the underground aquifers that nourished Diriyah's oasis. The liquid mirror finish incorporates onlookers and sky into an infinite meandering current.",
            audioDurationSeconds = 155,
            audioNarrationAr = "هذا الشريط الفولاذي يمتد بطول 6 أمتار. في تجربة الواقع المعزز، يمكنك رؤية التيارات المائية الافتراضية تتدفق من قلب المنحوتة نحو واحات النخيل المجاورة.",
            audioNarrationEn = "Spanning six meters of sculpted steel, this piece comes alive through AR with subterranean hydrological currents bursting forth into virtual date groves.",
            initialDistanceMeters = 65,
            compassBearingDeg = 275.0f,
            meshVertices = wadiFlowVertices,
            meshEdges = wadiFlowEdges,
            baseScale = 1.1f
        ),
        Artwork(
            id = "art_tuwaiq_monolith",
            titleAr = "شموخ طويق المنحوت",
            titleEn = "Tuwaiq Chiseled Monolith",
            artistAr = "معاذ العوفي",
            artistEn = "Moath Alofi",
            hangarCode = "JAX 07",
            hangarNameAr = "مسبك الفنون ومحترف النحت",
            hangarNameEn = "Sculpture Foundry & Residency",
            category = ArtworkCategory.SCULPTURE,
            year = "2025",
            mediumAr = "حجر جيري من جبال طويق، نقوش ثمودية محفورة، أشرطة نيون ذهبية",
            mediumEn = "Tuwaiq mountain limestone, incised proto-Arabic glyphs, gold neon",
            dimensions = "4.8m × 2.0m × 2.0m",
            descriptionAr = "صرح مهيب من صخور جبال طويق محفور عليه خطوط ثمودية تاريخية تتوهج بحروف ضوئية تتفاعل مع مرور الزوار.",
            descriptionEn = "An imposing stone obelisk carved from Tuwaiq limestone, bearing ancient Thamudic script illuminated by internal amber light.",
            curatorialEssayAr = "يستحضر العوفي مقولة 'همة كجبل طويق' عبر نحت كتلة صخرية شاهقة تزن عدة أطنان تم جلبها مباشرة من حافة العالم بالرياض. النقوش التاريخية المحفورة على الحجر تمثل بطاقة بريدية من حضارات الجزيرة العربية القديمة.",
            curatorialEssayEn = "Alofi channels the geological grandeur of the Tuwaiq Escarpment. Quarrying ancient strata, he inscribes Thamudic letterforms that glow as timeless epistolary messages across millennia.",
            audioDurationSeconds = 160,
            audioNarrationAr = "انظر إلى الحروف المنحوتة في الصخر. في الواقع المعزز، ستشاهد الكلمات تترجم تلقائياً إلى معاني الشجاعة والصمود والترحيب بالضيف، وهي قيم نجد الأصيلة.",
            audioNarrationEn = "Examine the incised ancient script. AR unlocks real-time translations of these petroglyphic verses, honoring generosity, resilience, and fellowship.",
            initialDistanceMeters = 88,
            compassBearingDeg = 320.0f,
            meshVertices = tuwaiqVertices,
            meshEdges = tuwaiqEdges,
            baseScale = 1.0f
        )
    )

    val hangars: List<HangarLocation> = listOf(
        HangarLocation(
            id = "h_01",
            code = "JAX 01",
            nameAr = "مقر بينالي الدرعية",
            nameEn = "Diriyah Biennale Foundation",
            roleAr = "المعرض الدولي الرئيسي والندوات الفكرية",
            roleEn = "Flagship International Exhibitions & Keynotes",
            currentExhibitionAr = "معرض 'أفق العبور' للفن المعاصر",
            currentExhibitionEn = "Horizon Crossing Contemporary Exhibition",
            openHours = "10:00 ص - 11:00 م",
            mapX = 0.28f,
            mapY = 0.32f,
            distanceMeters = 15,
            bearingDeg = 35.0f,
            featuredArtworkIds = listOf("art_horizon_portal")
        ),
        HangarLocation(
            id = "h_03",
            code = "JAX 03",
            nameAr = "مختبر الفنون الرقمية والواقع الممتد",
            nameEn = "Digital Arts & XR Lab",
            roleAr = "عروض الذكاء الاصطناعي وتجهيزات الميديا التفاعلية",
            roleEn = "AI Media Installations & Extended Reality Demos",
            currentExhibitionAr = "مختبر الشفرات والضوء السعودي",
            currentExhibitionEn = "Saudi Code & Luminescence Experiments",
            openHours = "02:00 م - 12:00 ص",
            mapX = 0.45f,
            mapY = 0.22f,
            distanceMeters = 42,
            bearingDeg = 195.0f,
            featuredArtworkIds = listOf("art_wind_prisms")
        ),
        HangarLocation(
            id = "h_07",
            code = "JAX 07",
            nameAr = "مسبك ومحترف النحت المعاصر",
            nameEn = "Sculpture Foundry & Residency",
            roleAr = "ورش صب البرونز ونحت الحجر والمشاغل المفتوحة",
            roleEn = "Bronze Casting, Stone Masonry & Open Studios",
            currentExhibitionAr = "أشكال من طويق: الحجر يتحدث",
            currentExhibitionEn = "Forms from Tuwaiq: Speaking Stone",
            openHours = "11:00 ص - 09:00 م",
            mapX = 0.72f,
            mapY = 0.40f,
            distanceMeters = 88,
            bearingDeg = 320.0f,
            featuredArtworkIds = listOf("art_tuwaiq_monolith")
        ),
        HangarLocation(
            id = "h_12",
            code = "JAX 12",
            nameAr = "حديقة المنحوتات الخارجية",
            nameEn = "Outdoor Sculpture Garden",
            roleAr = "ميدان الفن العام والمنشآت الضخمة في الهواء الطلق",
            roleEn = "Public Monuments & Open-Air Large Scale Works",
            currentExhibitionAr = "تناغم الطبيعة والعمارة النجدية",
            currentExhibitionEn = "Nature & Najdi Architecture Harmony",
            openHours = "مفتوح على مدار الساعة",
            mapX = 0.58f,
            mapY = 0.65f,
            distanceMeters = 24,
            bearingDeg = 110.0f,
            featuredArtworkIds = listOf("art_clay_echoes")
        ),
        HangarLocation(
            id = "h_15",
            code = "JAX 15",
            nameAr = "جاكس كافيه والساحة المركزية",
            nameEn = "JAX Social Plaza & Specialty Cafe",
            roleAr = "المقهى الثقافي، متجر الكتب والمجسمات الفنية",
            roleEn = "Art Bookshop, Specialty Coffee & Design Store",
            currentExhibitionAr = "لقاء الفنانين ومطبوعات الدرعية",
            currentExhibitionEn = "Artists Gathering & Diriyah Prints",
            openHours = "08:00 ص - 01:00 ص",
            mapX = 0.38f,
            mapY = 0.78f,
            distanceMeters = 65,
            bearingDeg = 275.0f,
            featuredArtworkIds = listOf("art_wadi_hanifa")
        ),
        HangarLocation(
            id = "h_19",
            code = "JAX 19",
            nameAr = "صالات الفنون التشكيلية والمعاصرة",
            nameEn = "Contemporary Fine Arts Gallery",
            roleAr = "معارض الرسم المعاصر والتصوير الفوتوغرافي",
            roleEn = "Painting, Photography & Private Collections",
            currentExhibitionAr = "أطياف نجد في عيون المعاصرين",
            currentExhibitionEn = "Najdi Spectrums Through Contemporary Eyes",
            openHours = "03:00 م - 11:00 م",
            mapX = 0.82f,
            mapY = 0.70f,
            distanceMeters = 110,
            bearingDeg = 145.0f,
            featuredArtworkIds = listOf()
        )
    )

    val guidedTours: List<GuidedTour> = listOf(
        GuidedTour(
            id = "tour_monuments",
            titleAr = "مسار المنحوتات الأيقونية الكبرى",
            titleEn = "Iconic Master Sculptures Tour",
            durationMinutes = 45,
            stopCount = 4,
            themeColorHex = 0xFFD4AF37,
            descriptionAr = "جولة ملهمة تمر بأبرز المنحوتات المعمارية التي تربط بين طين الدرعية وأفق الفن المعاصر مع إرشاد صوتي تفاعلي كامل.",
            descriptionEn = "An inspiring walking journey visiting key architectural monuments bridging Diriyah clay with contemporary vision.",
            stops = listOf("art_horizon_portal", "art_clay_echoes", "art_wadi_hanifa", "art_tuwaiq_monolith")
        ),
        GuidedTour(
            id = "tour_digital",
            titleAr = "مسار الفنون الرقمية والضوء",
            titleEn = "Digital Light & Code Expedition",
            durationMinutes = 30,
            stopCount = 3,
            themeColorHex = 0xFF00E5FF,
            descriptionAr = "استكشف الأعمال التي تستخدم خوارزميات الذكاء الاصطناعي، أشعة الليزر، والبلورات الحركية في هناجر جاكس التكنولوجية.",
            descriptionEn = "Explore algorithmic art, atmospheric lasers, and kinetic optics inside JAX's creative technology labs.",
            stops = listOf("art_wind_prisms", "art_horizon_portal", "art_wadi_hanifa")
        ),
        GuidedTour(
            id = "tour_heritage",
            titleAr = "مسار روح الدرعية ووادي حنيفة",
            titleEn = "Spirit of Diriyah & Wadi Hanifa",
            durationMinutes = 55,
            stopCount = 4,
            themeColorHex = 0xFFC85A32,
            descriptionAr = "رحلة تعمّق في رمزية النخلة، الطين، الصخر، ومياه الوادي في أعمال نحاتين سعوديين وعالميين في جاكس.",
            descriptionEn = "A deeper immersion into the symbols of earth, valley currents, limestone and palms interpreted by premier sculptors.",
            stops = listOf("art_clay_echoes", "art_tuwaiq_monolith", "art_wadi_hanifa")
        )
    )
}
