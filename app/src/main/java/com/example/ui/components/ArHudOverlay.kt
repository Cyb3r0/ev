package com.example.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.Canvas
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
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Camera
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.ColorLens
import androidx.compose.material.icons.filled.Explore
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Layers
import androidx.compose.material.icons.filled.Map
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.Navigation
import androidx.compose.material.icons.filled.PinDrop
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Tune
import androidx.compose.material.icons.filled.Videocam
import androidx.compose.material.icons.filled.VolumeUp
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.Artwork
import com.example.data.HangarLocation
import com.example.data.RenderStyle
import com.example.ui.theme.JaxAmber
import com.example.ui.theme.JaxBasalt
import com.example.ui.theme.JaxBlack
import com.example.ui.theme.JaxCyanHolo
import com.example.ui.theme.JaxGold
import com.example.ui.theme.JaxGoldLight
import com.example.ui.theme.JaxLimestone
import com.example.ui.theme.JaxSandstone
import com.example.ui.theme.JaxSurfaceCard
import com.example.ui.theme.JaxTerracotta
import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.sin

@Composable
fun ArHudOverlay(
    artwork: Artwork,
    artworksList: List<Artwork>,
    hangarsList: List<HangarLocation>,
    currentAzimuth: Float,
    isArabic: Boolean,
    isSimulatedMode: Boolean,
    onToggleSimulatedMode: () -> Unit,
    onToggleLanguage: () -> Unit,
    renderStyle: RenderStyle,
    onCycleRenderStyle: () -> Unit,
    isAnchored: Boolean,
    onToggleAnchor: () -> Unit,
    onOpenAudioGuide: () -> Unit,
    onOpenDetail: () -> Unit,
    onOpenAiCurator: () -> Unit,
    onOpenMap: () -> Unit,
    onOpenTours: () -> Unit,
    onTakeSnapshot: () -> Unit,
    onSelectArtwork: (Artwork) -> Unit,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp, vertical = 24.dp)
    ) {
        // --- TOP BAR: Compass, Radar & Environment Controls ---
        Column(
            modifier = Modifier
                .align(Alignment.TopCenter)
                .fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Brand mark
                Column {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = "JAX",
                            color = JaxGold,
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Black,
                            letterSpacing = 2.sp
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = if (isArabic) "الدرعية · واقع معزز" else "Diriyah · AR",
                            color = JaxLimestone,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }
                    Text(
                        text = if (isArabic) "حي الفنون والثقافة" else "Arts & Culture District",
                        color = JaxSandstone.copy(alpha = 0.6f),
                        fontSize = 10.sp
                    )
                }

                // Mini Spatial Radar
                MiniDistrictRadar(
                    currentAzimuth = currentAzimuth,
                    artworks = artworksList,
                    activeArtworkId = artwork.id,
                    onArtworkClick = onSelectArtwork,
                    modifier = Modifier.size(54.dp)
                )

                // Quick Mode Switches
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Camera / Sim Feed toggle
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(JaxSurfaceCard.copy(alpha = 0.85f))
                            .border(1.dp, JaxGold.copy(alpha = 0.3f), RoundedCornerShape(8.dp))
                            .clickable { onToggleSimulatedMode() }
                            .padding(horizontal = 8.dp, vertical = 6.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = if (isSimulatedMode) Icons.Default.Videocam else Icons.Default.CameraAlt,
                                contentDescription = "Camera mode",
                                tint = if (isSimulatedMode) JaxAmber else JaxGold,
                                modifier = Modifier.size(14.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = if (isSimulatedMode) {
                                    if (isArabic) "بيئة جاكس" else "Simulated"
                                } else {
                                    if (isArabic) "كاميرا حية" else "Live Cam"
                                },
                                color = JaxLimestone,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }

                    // Language toggle
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(JaxSurfaceCard.copy(alpha = 0.85f))
                            .border(1.dp, Color.White.copy(alpha = 0.15f), RoundedCornerShape(8.dp))
                            .clickable { onToggleLanguage() }
                            .padding(horizontal = 8.dp, vertical = 6.dp)
                    ) {
                        Text(
                            text = if (isArabic) "EN" else "عربي",
                            color = JaxGoldLight,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Compass Azimuth Ribbon
            CompassAzimuthTape(
                azimuthDeg = currentAzimuth,
                isArabic = isArabic,
                modifier = Modifier
                    .fillMaxWidth(0.92f)
                    .height(30.dp)
            )
        }

        // --- FLOATING AR TARGET CARD (Center Bottom) ---
        Column(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Artwork Summary Badge
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(JaxSurfaceCard.copy(alpha = 0.92f))
                    .border(1.dp, JaxGold.copy(alpha = 0.4f), RoundedCornerShape(16.dp))
                    .padding(14.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = artwork.hangarCode,
                                color = JaxGold,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier
                                    .background(JaxGold.copy(alpha = 0.15f), RoundedCornerShape(4.dp))
                                    .padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = if (isArabic) artwork.category.labelAr else artwork.category.labelEn,
                                color = JaxSandstone.copy(alpha = 0.7f),
                                fontSize = 11.sp
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(text = "·", color = JaxSandstone.copy(alpha = 0.4f))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "${artwork.initialDistanceMeters}m",
                                color = JaxCyanHolo,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        Spacer(modifier = Modifier.height(4.dp))

                        Text(
                            text = if (isArabic) artwork.titleAr else artwork.titleEn,
                            color = Color.White,
                            fontSize = 17.sp,
                            fontWeight = FontWeight.Bold
                        )

                        Text(
                            text = if (isArabic) artwork.artistAr else artwork.artistEn,
                            color = JaxSandstone,
                            fontSize = 12.sp
                        )
                    }

                    // Audio Guide Trigger Button
                    Box(
                        modifier = Modifier
                            .size(46.dp)
                            .clip(CircleShape)
                            .background(JaxGold.copy(alpha = 0.2f))
                            .border(1.5.dp, JaxGold, CircleShape)
                            .clickable { onOpenAudioGuide() },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.VolumeUp,
                            contentDescription = "Audio Guide",
                            tint = JaxGoldLight,
                            modifier = Modifier.size(22.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Quick Action Toolbar
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(14.dp))
                    .background(JaxBlack.copy(alpha = 0.85f))
                    .border(1.dp, Color.White.copy(alpha = 0.12f), RoundedCornerShape(14.dp))
                    .padding(horizontal = 8.dp, vertical = 6.dp),
                horizontalArrangement = Arrangement.SpaceAround,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // 1. Shading Style Switcher
                HudActionButton(
                    icon = Icons.Default.Layers,
                    label = when (renderStyle) {
                        RenderStyle.METALLIC_GOLD -> if (isArabic) "ذهب نجد" else "Gold"
                        RenderStyle.CYAN_HOLOGRAM -> if (isArabic) "هولوغرام" else "Holo"
                        RenderStyle.DESERT_TERRACOTTA -> if (isArabic) "طين طويق" else "Clay"
                    },
                    accentColor = when (renderStyle) {
                        RenderStyle.METALLIC_GOLD -> JaxGold
                        RenderStyle.CYAN_HOLOGRAM -> JaxCyanHolo
                        RenderStyle.DESERT_TERRACOTTA -> JaxTerracotta
                    },
                    onClick = onCycleRenderStyle
                )

                // 2. Anchor / Surface Placement Toggle
                HudActionButton(
                    icon = Icons.Default.PinDrop,
                    label = if (isAnchored) {
                        if (isArabic) "مثبّت" else "Anchored"
                    } else {
                        if (isArabic) "تثبيت بالسطح" else "Anchor"
                    },
                    accentColor = if (isAnchored) JaxGold else JaxLimestone,
                    onClick = onToggleAnchor
                )

                // 3. Shutter Snapshot Button (Dominant visual button)
                Box(
                    modifier = Modifier
                        .size(54.dp)
                        .clip(CircleShape)
                        .background(
                            Brush.linearGradient(
                                listOf(JaxGold, JaxAmber)
                            )
                        )
                        .clickable { onTakeSnapshot() },
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.CameraAlt,
                        contentDescription = "Take AR Snapshot",
                        tint = JaxBlack,
                        modifier = Modifier.size(26.dp)
                    )
                }

                // 4. Detailed Dossier
                HudActionButton(
                    icon = Icons.Default.Info,
                    label = if (isArabic) "عن العمل" else "About",
                    accentColor = JaxLimestone,
                    onClick = onOpenDetail
                )

                // 5. Interactive District Map
                HudActionButton(
                    icon = Icons.Default.Map,
                    label = if (isArabic) "الخريطة" else "Map",
                    accentColor = JaxLimestone,
                    onClick = onOpenMap
                )

                // 6. AI Curator
                HudActionButton(
                    icon = Icons.Default.AutoAwesome,
                    label = if (isArabic) "القيّم الذكي" else "AI Guide",
                    accentColor = JaxGoldLight,
                    onClick = onOpenAiCurator
                )
            }
        }
    }
}

@Composable
fun HudActionButton(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    label: String,
    accentColor: Color,
    onClick: () -> Unit
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier
            .clip(RoundedCornerShape(8.dp))
            .clickable { onClick() }
            .padding(horizontal = 6.dp, vertical = 4.dp)
    ) {
        Icon(
            imageVector = icon,
            contentDescription = label,
            tint = accentColor,
            modifier = Modifier.size(19.dp)
        )
        Spacer(modifier = Modifier.height(2.dp))
        Text(
            text = label,
            color = JaxSandstone,
            fontSize = 9.sp,
            fontWeight = FontWeight.Medium
        )
    }
}

@Composable
fun CompassAzimuthTape(
    azimuthDeg: Float,
    isArabic: Boolean,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(8.dp))
            .background(JaxBlack.copy(alpha = 0.65f))
            .border(1.dp, Color.White.copy(alpha = 0.08f), RoundedCornerShape(8.dp))
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val width = size.width
            val height = size.height
            val centerX = width / 2f

            // Degree marks every 15 degrees
            val fov = 80f // span of compass visible
            val pixelsPerDegree = width / fov

            for (deg in 0 until 360 step 15) {
                var diff = (deg - azimuthDeg) % 360f
                if (diff > 180f) diff -= 360f
                if (diff < -180f) diff += 360f

                val x = centerX + diff * pixelsPerDegree
                if (x in 0f..width) {
                    val isMajor = deg % 45 == 0
                    val tickHeight = if (isMajor) height * 0.5f else height * 0.25f

                    drawLine(
                        color = if (isMajor) JaxGold else Color.White.copy(alpha = 0.35f),
                        start = Offset(x, height - tickHeight),
                        end = Offset(x, height),
                        strokeWidth = if (isMajor) 1.8f else 1f
                    )
                }
            }

            // Center indicator chevron
            drawLine(
                color = JaxGold,
                start = Offset(centerX, 0f),
                end = Offset(centerX, height * 0.45f),
                strokeWidth = 2.2f
            )
        }

        // Heading reading text
        val cardinal = when (azimuthDeg.toInt()) {
            in 338..360, in 0..22 -> if (isArabic) "شمال" else "N"
            in 23..67 -> if (isArabic) "شمال شرق" else "NE"
            in 68..112 -> if (isArabic) "شرق" else "E"
            in 113..157 -> if (isArabic) "جنوب شرق" else "SE"
            in 158..202 -> if (isArabic) "جنوب" else "S"
            in 203..247 -> if (isArabic) "جنوب غرب" else "SW"
            in 248..292 -> if (isArabic) "غرب" else "W"
            else -> if (isArabic) "شمال غرب" else "NW"
        }

        Text(
            text = "${azimuthDeg.toInt()}° $cardinal",
            color = JaxGoldLight,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.align(Alignment.Center)
        )
    }
}

@Composable
fun MiniDistrictRadar(
    currentAzimuth: Float,
    artworks: List<Artwork>,
    activeArtworkId: String,
    onArtworkClick: (Artwork) -> Unit,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .clip(CircleShape)
            .background(JaxBlack.copy(alpha = 0.75f))
            .border(1.dp, JaxGold.copy(alpha = 0.5f), CircleShape)
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val radius = size.width / 2f
            val center = Offset(radius, radius)

            // Outer ring & crosshairs
            drawCircle(
                color = JaxGold.copy(alpha = 0.25f),
                radius = radius * 0.9f,
                style = androidx.compose.ui.graphics.drawscope.Stroke(1f)
            )
            drawCircle(
                color = JaxGold.copy(alpha = 0.15f),
                radius = radius * 0.5f,
                style = androidx.compose.ui.graphics.drawscope.Stroke(1f)
            )

            // Current heading cone
            val fovRad = 45f * (PI.toFloat() / 180f)
            // Points forward (up)
            drawLine(
                color = JaxGold.copy(alpha = 0.4f),
                start = center,
                end = Offset(radius + sin(fovRad / 2) * radius * 0.85f, radius - cos(fovRad / 2) * radius * 0.85f),
                strokeWidth = 1f
            )
            drawLine(
                color = JaxGold.copy(alpha = 0.4f),
                start = center,
                end = Offset(radius - sin(fovRad / 2) * radius * 0.85f, radius - cos(fovRad / 2) * radius * 0.85f),
                strokeWidth = 1f
            )

            // Draw relative blips for artworks
            artworks.forEach { art ->
                val relAngleDeg = (art.compassBearingDeg - currentAzimuth + 360f) % 360f
                val rad = (relAngleDeg - 90f) * (PI.toFloat() / 180f)
                val distRatio = (art.initialDistanceMeters / 100f).coerceIn(0.2f, 0.85f)
                val blipX = radius + cos(rad) * radius * distRatio
                val blipY = radius + sin(rad) * radius * distRatio

                val isActive = art.id == activeArtworkId
                drawCircle(
                    color = if (isActive) JaxCyanHolo else JaxGoldLight,
                    center = Offset(blipX, blipY),
                    radius = if (isActive) 3.5f else 2.2f
                )
            }

            // User center dot
            drawCircle(color = JaxGold, center = center, radius = 2.5f)
        }
    }
}
