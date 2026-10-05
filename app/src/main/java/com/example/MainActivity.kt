package com.example

import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.Collections
import androidx.compose.material.icons.filled.DirectionsWalk
import androidx.compose.material.icons.filled.Explore
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.NearMe
import androidx.compose.material.icons.filled.ViewInAr
import androidx.compose.material3.Icon
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ar.ArSceneRenderer
import com.example.camera.CameraPreviewView
import com.example.data.ArSavedSnapshot
import com.example.data.Artwork
import com.example.data.GuidedTour
import com.example.data.JaxDataProvider
import com.example.data.RenderStyle
import com.example.sensors.CompassOrientationManager
import com.example.ui.components.AiCuratorDialog
import com.example.ui.components.ArtworkCatalogSheet
import com.example.ui.components.ArtworkDetailSheet
import com.example.ui.components.AudioGuideSheet
import com.example.ui.components.DistrictMapSheet
import com.example.ui.components.SnapshotsGallerySheet
import com.example.ui.components.ToursSheet
import com.example.ui.components.ArHudOverlay
import com.example.ui.theme.JaxAmber
import com.example.ui.theme.JaxBlack
import com.example.ui.theme.JaxCyanHolo
import com.example.ui.theme.JaxGold
import com.example.ui.theme.JaxGoldLight
import com.example.ui.theme.JaxLimestone
import com.example.ui.theme.JaxSandstone
import com.example.ui.theme.JaxSurfaceCard
import com.example.ui.theme.JaxSurfaceDark
import com.example.ui.theme.JaxTerracotta
import com.example.ui.theme.MyApplicationTheme
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class MainActivity : ComponentActivity() {

    private lateinit var compassManager: CompassOrientationManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        compassManager = CompassOrientationManager(this)

        setContent {
            MyApplicationTheme {
                JaxArApp(compassManager = compassManager)
            }
        }
    }

    override fun onResume() {
        super.onResume()
        compassManager.startListening()
    }

    override fun onPause() {
        super.onPause()
        compassManager.stopListening()
    }
}

@Composable
fun JaxArApp(compassManager: CompassOrientationManager) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()

    val artworks = remember { JaxDataProvider.artworks }
    val hangars = remember { JaxDataProvider.hangars }
    val tours = remember { JaxDataProvider.guidedTours }

    var selectedArtwork by remember { mutableStateOf(artworks.first()) }
    var isArabic by remember { mutableStateOf(true) }
    var isSimulatedMode by remember { mutableStateOf(true) }
    var renderStyle by remember { mutableStateOf(RenderStyle.METALLIC_GOLD) }
    var isAnchored by remember { mutableStateOf(false) }
    var userScale by remember { mutableFloatStateOf(1.0f) }

    // Active guided tour state
    var activeTour by remember { mutableStateOf<GuidedTour?>(null) }
    var tourCurrentStopIndex by remember { mutableStateOf(0) }

    // Shutter flash effect
    var isShutterFlashVisible by remember { mutableStateOf(false) }

    // Sheets visibility
    var showAudioGuide by remember { mutableStateOf(false) }
    var showDetailDossier by remember { mutableStateOf(false) }
    var showAiCurator by remember { mutableStateOf(false) }
    var showDistrictMap by remember { mutableStateOf(false) }
    var showTours by remember { mutableStateOf(false) }
    var showCatalog by remember { mutableStateOf(false) }
    var showSnapshotsGallery by remember { mutableStateOf(false) }

    // Saved snapshots gallery
    val savedSnapshots = remember {
        mutableStateListOf(
            ArSavedSnapshot(
                id = "snap_1",
                artworkTitleAr = "بوابة الأفق الكينيتية",
                artworkTitleEn = "The Horizon Kinetic Portal",
                artistAr = "راشد الشعشعي",
                artistEn = "Rashed Al Shashai",
                dateString = "2026-10-05 18:40",
                renderStyle = RenderStyle.METALLIC_GOLD,
                distanceMeters = 8
            ),
            ArSavedSnapshot(
                id = "snap_2",
                artworkTitleAr = "أصداء الطين المعاصرة",
                artworkTitleEn = "Contemporary Echoes of Clay",
                artistAr = "د. زهرة الغامدي",
                artistEn = "Dr. Zahrah Al Ghamdi",
                dateString = "2026-10-05 17:15",
                renderStyle = RenderStyle.DESERT_TERRACOTTA,
                distanceMeters = 24
            )
        )
    }

    fun takeSnapshot() {
        coroutineScope.launch {
            isShutterFlashVisible = true
            delay(120)
            isShutterFlashVisible = false

            val dateFormat = SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault())
            val newSnapshot = ArSavedSnapshot(
                id = "snap_${System.currentTimeMillis()}",
                artworkTitleAr = selectedArtwork.titleAr,
                artworkTitleEn = selectedArtwork.titleEn,
                artistAr = selectedArtwork.artistAr,
                artistEn = selectedArtwork.artistEn,
                dateString = dateFormat.format(Date()),
                renderStyle = renderStyle,
                distanceMeters = selectedArtwork.initialDistanceMeters
            )
            savedSnapshots.add(0, newSnapshot)

            Toast.makeText(
                context,
                if (isArabic) "تم حفظ صورة AR تذكارية في المعرض بنجاح" else "AR memory saved to gallery",
                Toast.LENGTH_SHORT
            ).show()
        }
    }

    Box(modifier = Modifier.fillMaxSize().background(JaxBlack)) {

        // 1. Camera Feed / Simulated JAX Environment (Base Layer)
        CameraPreviewView(
            isSimulatedMode = isSimulatedMode,
            onSimulatedModeChange = { isSimulatedMode = it },
            modifier = Modifier.fillMaxSize()
        )

        // 2. Real-Time 3D AR Scene Rasterizer (Middle Spatial Layer)
        ArSceneRenderer(
            artwork = selectedArtwork,
            deviceAzimuth = compassManager.totalAzimuth,
            devicePitch = compassManager.totalPitch,
            renderStyle = renderStyle,
            isAnchored = isAnchored,
            onAnchorToggle = { isAnchored = !isAnchored },
            userScale = userScale,
            onScaleChange = { userScale = it },
            modifier = Modifier.fillMaxSize()
        )

        // 3. HUD Overlays, Compass Ribbon, Radar, Floating Dock (Top Layer)
        ArHudOverlay(
            artwork = selectedArtwork,
            artworksList = artworks,
            hangarsList = hangars,
            currentAzimuth = compassManager.totalAzimuth,
            isArabic = isArabic,
            isSimulatedMode = isSimulatedMode,
            onToggleSimulatedMode = { isSimulatedMode = !isSimulatedMode },
            onToggleLanguage = { isArabic = !isArabic },
            renderStyle = renderStyle,
            onCycleRenderStyle = {
                renderStyle = when (renderStyle) {
                    RenderStyle.METALLIC_GOLD -> RenderStyle.CYAN_HOLOGRAM
                    RenderStyle.CYAN_HOLOGRAM -> RenderStyle.DESERT_TERRACOTTA
                    RenderStyle.DESERT_TERRACOTTA -> RenderStyle.METALLIC_GOLD
                }
            },
            isAnchored = isAnchored,
            onToggleAnchor = { isAnchored = !isAnchored },
            onOpenAudioGuide = { showAudioGuide = true },
            onOpenDetail = { showDetailDossier = true },
            onOpenAiCurator = { showAiCurator = true },
            onOpenMap = { showDistrictMap = true },
            onOpenTours = { showTours = true },
            onTakeSnapshot = { takeSnapshot() },
            onSelectArtwork = { art ->
                selectedArtwork = art
                userScale = 1.0f
            },
            modifier = Modifier.fillMaxSize()
        )

        // 4. Secondary Quick Navigation Floating Rail (Left/Right edge)
        Column(
            modifier = Modifier
                .align(Alignment.CenterEnd)
                .padding(end = 12.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            // Catalog pill
            SideRailButton(
                icon = Icons.Default.Explore,
                label = if (isArabic) "الأعمال" else "Catalog",
                onClick = { showCatalog = true }
            )

            // Tours pill
            SideRailButton(
                icon = Icons.Default.DirectionsWalk,
                label = if (isArabic) "الجولات" else "Tours",
                onClick = { showTours = true }
            )

            // Gallery snapshots pill
            SideRailButton(
                icon = Icons.Default.Collections,
                label = if (isArabic) "الذكريات" else "Photos",
                badgeCount = savedSnapshots.size,
                onClick = { showSnapshotsGallery = true }
            )
        }

        // Active Tour Banner (if a tour is in progress)
        activeTour?.let { tour ->
            Box(
                modifier = Modifier
                    .align(Alignment.TopCenter)
                    .padding(top = 96.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(JaxSurfaceCard.copy(alpha = 0.92f))
                    .border(1.dp, Color(tour.themeColorHex), RoundedCornerShape(12.dp))
                    .clickable { showTours = true }
                    .padding(horizontal = 14.dp, vertical = 8.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.NearMe,
                        contentDescription = null,
                        tint = Color(tour.themeColorHex),
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "${if (isArabic) "جولة: " else "Tour: "}${if (isArabic) tour.titleAr else tour.titleEn}",
                        color = Color.White,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = if (isArabic) "إنهاء" else "End",
                        color = JaxSandstone,
                        fontSize = 10.sp,
                        modifier = Modifier.clickable { activeTour = null }
                    )
                }
            }
        }

        // Shutter Camera Flash Animation
        AnimatedVisibility(
            visible = isShutterFlashVisible,
            enter = fadeIn(),
            exit = fadeOut()
        ) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.White)
            )
        }

        // --- BOTTOM SHEETS ---

        if (showAudioGuide) {
            AudioGuideSheet(
                artwork = selectedArtwork,
                isArabic = isArabic,
                onDismiss = { showAudioGuide = false }
            )
        }

        if (showDetailDossier) {
            ArtworkDetailSheet(
                artwork = selectedArtwork,
                isArabic = isArabic,
                onPlayAudio = {
                    showDetailDossier = false
                    showAudioGuide = true
                },
                onNavigate = {
                    showDetailDossier = false
                    showDistrictMap = true
                },
                onDismiss = { showDetailDossier = false }
            )
        }

        if (showDistrictMap) {
            DistrictMapSheet(
                hangars = hangars,
                artworks = artworks,
                selectedArtworkId = selectedArtwork.id,
                isArabic = isArabic,
                onSelectHangar = { /* Selected */ },
                onSelectArtwork = { art ->
                    selectedArtwork = art
                    userScale = 1.0f
                },
                onDismiss = { showDistrictMap = false }
            )
        }

        if (showAiCurator) {
            AiCuratorDialog(
                artwork = selectedArtwork,
                isArabic = isArabic,
                onDismiss = { showAiCurator = false }
            )
        }

        if (showTours) {
            ToursSheet(
                tours = tours,
                artworks = artworks,
                isArabic = isArabic,
                onStartTour = { tour ->
                    activeTour = tour
                    val firstStopId = tour.stops.firstOrNull()
                    val targetArt = artworks.firstOrNull { it.id == firstStopId }
                    if (targetArt != null) {
                        selectedArtwork = targetArt
                    }
                    Toast.makeText(
                        context,
                        if (isArabic) "بدأت جولة: ${tour.titleAr}" else "Started: ${tour.titleEn}",
                        Toast.LENGTH_SHORT
                    ).show()
                },
                onDismiss = { showTours = false }
            )
        }

        if (showCatalog) {
            ArtworkCatalogSheet(
                artworks = artworks,
                selectedArtworkId = selectedArtwork.id,
                isArabic = isArabic,
                onSelectArtwork = { art ->
                    selectedArtwork = art
                    userScale = 1.0f
                },
                onDismiss = { showCatalog = false }
            )
        }

        if (showSnapshotsGallery) {
            SnapshotsGallerySheet(
                snapshots = savedSnapshots,
                isArabic = isArabic,
                onDelete = { id ->
                    savedSnapshots.removeAll { it.id == id }
                },
                onDismiss = { showSnapshotsGallery = false }
            )
        }
    }
}

@Composable
fun SideRailButton(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    label: String,
    badgeCount: Int = 0,
    onClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .clip(CircleShape)
            .background(JaxBlack.copy(alpha = 0.8f))
            .border(1.dp, JaxGold.copy(alpha = 0.4f), CircleShape)
            .clickable { onClick() }
            .padding(10.dp),
        contentAlignment = Alignment.Center
    ) {
        Icon(
            imageVector = icon,
            contentDescription = label,
            tint = JaxGoldLight,
            modifier = Modifier.size(20.dp)
        )

        if (badgeCount > 0) {
            Box(
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .size(14.dp)
                    .background(JaxAmber, CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = badgeCount.toString(),
                    color = JaxBlack,
                    fontSize = 8.sp,
                    fontWeight = FontWeight.Black
                )
            }
        }
    }
}
