package com.example.ui.components

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.FastForward
import androidx.compose.material.icons.filled.FastRewind
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.RecordVoiceOver
import androidx.compose.material.icons.filled.Subtitles
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.Artwork
import com.example.ui.theme.JaxBasalt
import com.example.ui.theme.JaxBlack
import com.example.ui.theme.JaxCyanHolo
import com.example.ui.theme.JaxGold
import com.example.ui.theme.JaxGoldLight
import com.example.ui.theme.JaxLimestone
import com.example.ui.theme.JaxSandstone
import com.example.ui.theme.JaxSurfaceCard
import com.example.ui.theme.JaxSurfaceDark
import kotlinx.coroutines.delay
import kotlin.math.sin

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AudioGuideSheet(
    artwork: Artwork,
    isArabic: Boolean,
    onDismiss: () -> Unit,
    modifier: Modifier = Modifier
) {
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

    var isPlaying by remember { mutableStateOf(true) }
    var currentSeconds by remember { mutableFloatStateOf(0f) }
    val totalSeconds = artwork.audioDurationSeconds.toFloat()
    var showTranscript by remember { mutableStateOf(true) }

    LaunchedEffect(isPlaying) {
        while (isPlaying && currentSeconds < totalSeconds) {
            delay(500)
            currentSeconds = (currentSeconds + 0.5f).coerceAtMost(totalSeconds)
            if (currentSeconds >= totalSeconds) {
                isPlaying = false
            }
        }
    }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState,
        containerColor = JaxSurfaceDark,
        tonalElevation = 8.dp
    ) {
        Column(
            modifier = modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp)
                .padding(bottom = 32.dp)
                .verticalScroll(rememberScrollState())
        ) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.RecordVoiceOver,
                        contentDescription = "Voice",
                        tint = JaxGold,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = if (isArabic) "المرشد الصوتي القيّمي · حي جاكس" else "Curatorial Audio Guide · JAX",
                        color = JaxGold,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                IconButton(onClick = onDismiss) {
                    Icon(
                        imageVector = Icons.Default.Close,
                        contentDescription = "Close",
                        tint = JaxLimestone
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Artwork title
            Text(
                text = if (isArabic) artwork.titleAr else artwork.titleEn,
                color = Color.White,
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = "${if (isArabic) artwork.artistAr else artwork.artistEn} · ${artwork.hangarCode}",
                color = JaxSandstone,
                fontSize = 13.sp
            )

            Spacer(modifier = Modifier.height(20.dp))

            // Dynamic Animated Waveform
            AudioWaveformVisualizer(
                isPlaying = isPlaying,
                progress = currentSeconds / totalSeconds,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(64.dp)
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Progress Slider & Timing
            Slider(
                value = currentSeconds,
                onValueChange = { currentSeconds = it },
                valueRange = 0f..totalSeconds,
                colors = SliderDefaults.colors(
                    thumbColor = JaxGold,
                    activeTrackColor = JaxGold,
                    inactiveTrackColor = JaxBasalt
                ),
                modifier = Modifier.fillMaxWidth()
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                val currentMins = (currentSeconds.toInt()) / 60
                val currentSecs = (currentSeconds.toInt()) % 60
                val totalMins = (totalSeconds.toInt()) / 60
                val totalSecs = (totalSeconds.toInt()) % 60

                Text(
                    text = String.format("%02d:%02d", currentMins, currentSecs),
                    color = JaxSandstone,
                    fontSize = 11.sp
                )
                Text(
                    text = String.format("%02d:%02d", totalMins, totalSecs),
                    color = JaxSandstone,
                    fontSize = 11.sp
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Playback Controls
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Rewind 15s
                IconButton(
                    onClick = { currentSeconds = (currentSeconds - 15f).coerceAtLeast(0f) }
                ) {
                    Icon(
                        imageVector = Icons.Default.FastRewind,
                        contentDescription = "Rewind 15s",
                        tint = JaxLimestone,
                        modifier = Modifier.size(28.dp)
                    )
                }

                Spacer(modifier = Modifier.width(16.dp))

                // Play / Pause Circle
                Box(
                    modifier = Modifier
                        .size(62.dp)
                        .clip(CircleShape)
                        .background(JaxGold)
                        .clickable { isPlaying = !isPlaying },
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = if (isPlaying) Icons.Default.Pause else Icons.Default.PlayArrow,
                        contentDescription = if (isPlaying) "Pause" else "Play",
                        tint = JaxBlack,
                        modifier = Modifier.size(32.dp)
                    )
                }

                Spacer(modifier = Modifier.width(16.dp))

                // Fast Forward 15s
                IconButton(
                    onClick = { currentSeconds = (currentSeconds + 15f).coerceAtMost(totalSeconds) }
                ) {
                    Icon(
                        imageVector = Icons.Default.FastForward,
                        contentDescription = "Forward 15s",
                        tint = JaxLimestone,
                        modifier = Modifier.size(28.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Transcript Box
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .background(JaxSurfaceCard)
                    .border(1.dp, Color.White.copy(alpha = 0.08f), RoundedCornerShape(12.dp))
                    .padding(16.dp)
            ) {
                Column {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.Subtitles,
                                contentDescription = "Transcript",
                                tint = JaxGoldLight,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = if (isArabic) "النص القيّمي المرافق" else "Curatorial Narration Transcript",
                                color = JaxGoldLight,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        Text(
                            text = if (isArabic) "صوت: د. طارق الدرعية" else "Voice: Dr. Tareq Al-Diriyah",
                            color = JaxSandstone.copy(alpha = 0.6f),
                            fontSize = 10.sp
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    Text(
                        text = if (isArabic) artwork.audioNarrationAr else artwork.audioNarrationEn,
                        color = JaxLimestone,
                        fontSize = 13.sp,
                        lineHeight = 22.sp
                    )
                }
            }
        }
    }
}

@Composable
fun AudioWaveformVisualizer(
    isPlaying: Boolean,
    progress: Float,
    modifier: Modifier = Modifier
) {
    val transition = rememberInfiniteTransition(label = "waveform")
    val wavePhase by transition.animateFloat(
        initialValue = 0f,
        targetValue = 6.28f,
        animationSpec = infiniteRepeatable(
            animation = tween(1200, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "phase"
    )

    Canvas(modifier = modifier) {
        val width = size.width
        val height = size.height
        val barCount = 36
        val barWidth = width / (barCount * 1.5f)
        val spacing = barWidth * 0.5f

        for (i in 0 until barCount) {
            val barRatio = i.toFloat() / barCount
            val isPassed = barRatio <= progress

            val dynamicHeight = if (isPlaying) {
                val wave1 = sin(barRatio * 12f + wavePhase)
                val wave2 = sin(barRatio * 6f - wavePhase * 1.2f)
                val norm = ((wave1 + wave2) / 2f + 1f) / 2f
                (height * (0.15f + norm * 0.75f))
            } else {
                val wave = sin(barRatio * 8f)
                (height * (0.2f + (wave + 1f) * 0.25f))
            }

            val x = i * (barWidth + spacing) + spacing
            val topY = (height - dynamicHeight) / 2f

            drawLine(
                color = if (isPassed) JaxGold else JaxBasalt,
                start = Offset(x, topY),
                end = Offset(x, topY + dynamicHeight),
                strokeWidth = barWidth,
                cap = androidx.compose.ui.graphics.StrokeCap.Round
            )
        }
    }
}
