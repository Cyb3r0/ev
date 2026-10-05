package com.example.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectTapGestures
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
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.DirectionsWalk
import androidx.compose.material.icons.filled.LocationSearching
import androidx.compose.material.icons.filled.Navigation
import androidx.compose.material.icons.filled.ViewInAr
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.Artwork
import com.example.data.HangarLocation
import com.example.ui.theme.JaxAmber
import com.example.ui.theme.JaxBasalt
import com.example.ui.theme.JaxBlack
import com.example.ui.theme.JaxCyanHolo
import com.example.ui.theme.JaxGold
import com.example.ui.theme.JaxGoldLight
import com.example.ui.theme.JaxLimestone
import com.example.ui.theme.JaxPalmGreen
import com.example.ui.theme.JaxSandstone
import com.example.ui.theme.JaxSurfaceCard
import com.example.ui.theme.JaxSurfaceDark
import com.example.ui.theme.JaxTerracotta
import kotlin.math.sqrt

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DistrictMapSheet(
    hangars: List<HangarLocation>,
    artworks: List<Artwork>,
    selectedArtworkId: String,
    isArabic: Boolean,
    onSelectHangar: (HangarLocation) -> Unit,
    onSelectArtwork: (Artwork) -> Unit,
    onDismiss: () -> Unit,
    modifier: Modifier = Modifier
) {
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    var selectedHangar by remember { mutableStateOf<HangarLocation?>(hangars.firstOrNull()) }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState,
        containerColor = JaxSurfaceDark,
        tonalElevation = 8.dp
    ) {
        Column(
            modifier = modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp)
                .padding(bottom = 32.dp)
        ) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = if (isArabic) "مخطط حي جاكس للفنون · الدرعية" else "JAX District Master Plan · Diriyah",
                        color = Color.White,
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = if (isArabic) "انقر على أي هنجر أو منحوتة للانتقال إليها في AR" else "Tap any hangar or sculpture to navigate in AR",
                        color = JaxSandstone,
                        fontSize = 11.sp
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

            Spacer(modifier = Modifier.height(14.dp))

            // Interactive Map Canvas
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(260.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(JaxBlack)
                    .border(1.dp, JaxGold.copy(alpha = 0.35f), RoundedCornerShape(16.dp))
            ) {
                Canvas(
                    modifier = Modifier
                        .fillMaxSize()
                        .pointerInput(hangars) {
                            detectTapGestures { tapOffset ->
                                val w = size.width
                                val h = size.height

                                // Find closest hangar
                                val clicked = hangars.minByOrNull { hangar ->
                                    val hx = hangar.mapX * w
                                    val hy = hangar.mapY * h
                                    val dx = hx - tapOffset.x
                                    val dy = hy - tapOffset.y
                                    sqrt((dx * dx + dy * dy).toDouble())
                                }

                                if (clicked != null) {
                                    val hx = clicked.mapX * w
                                    val hy = clicked.mapY * h
                                    val dist = sqrt(((hx - tapOffset.x) * (hx - tapOffset.x) + (hy - tapOffset.y) * (hy - tapOffset.y)).toDouble())
                                    if (dist < 120.0) {
                                        selectedHangar = clicked
                                        onSelectHangar(clicked)
                                    }
                                }
                            }
                        }
                ) {
                    val w = size.width
                    val h = size.height

                    // 1. Wadi Hanifa River green strip on left edge
                    val wadiPath = Path().apply {
                        moveTo(0f, 0f)
                        cubicTo(w * 0.12f, h * 0.3f, 0f, h * 0.7f, w * 0.08f, h)
                        lineTo(0f, h)
                        close()
                    }
                    drawPath(
                        path = wadiPath,
                        color = JaxPalmGreen.copy(alpha = 0.25f)
                    )

                    // 2. Central JAX Art Boulevard (spine of the district)
                    val boulevardPath = Path().apply {
                        moveTo(w * 0.25f, 0f)
                        lineTo(w * 0.55f, h)
                    }
                    drawPath(
                        path = boulevardPath,
                        color = Color(0xFF2E323B),
                        style = Stroke(width = 38f)
                    )

                    // Promenade center line
                    drawPath(
                        path = boulevardPath,
                        color = JaxGold.copy(alpha = 0.35f),
                        style = Stroke(
                            width = 1.5f,
                            pathEffect = androidx.compose.ui.graphics.PathEffect.dashPathEffect(floatArrayOf(14f, 10f))
                        )
                    )

                    // 3. Draw Hangars as architectural pavilions
                    hangars.forEach { hangar ->
                        val hx = hangar.mapX * w
                        val hy = hangar.mapY * h
                        val isSelected = hangar.id == selectedHangar?.id

                        val boxW = 52f
                        val boxH = 34f

                        // Hangar shadow & body
                        drawRect(
                            color = if (isSelected) JaxGold.copy(alpha = 0.35f) else Color(0xFF1D2026),
                            topLeft = Offset(hx - boxW / 2, hy - boxH / 2),
                            size = Size(boxW, boxH)
                        )

                        // Hangar border
                        drawRect(
                            color = if (isSelected) JaxGold else JaxSandstone.copy(alpha = 0.45f),
                            topLeft = Offset(hx - boxW / 2, hy - boxH / 2),
                            size = Size(boxW, boxH),
                            style = Stroke(width = if (isSelected) 2.2f else 1.2f)
                        )

                        // Center beacon dot
                        drawCircle(
                            color = if (isSelected) JaxGoldLight else JaxCyanHolo,
                            center = Offset(hx, hy),
                            radius = if (isSelected) 4.5f else 2.8f
                        )
                    }

                    // 4. Current Visitor Position (You Are Here)
                    val userX = w * 0.32f
                    val userY = h * 0.45f

                    // Radial sonar pulse
                    drawCircle(
                        color = JaxCyanHolo.copy(alpha = 0.3f),
                        center = Offset(userX, userY),
                        radius = 22f
                    )
                    drawCircle(
                        color = JaxCyanHolo,
                        center = Offset(userX, userY),
                        radius = 5.5f
                    )
                }

                // Map Legend Overlays
                Row(
                    modifier = Modifier
                        .align(Alignment.BottomStart)
                        .padding(10.dp)
                        .background(JaxBlack.copy(alpha = 0.75f), RoundedCornerShape(6.dp))
                        .padding(horizontal = 8.dp, vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(7.dp)
                            .background(JaxCyanHolo, CircleShape)
                    )
                    Spacer(modifier = Modifier.width(5.dp))
                    Text(
                        text = if (isArabic) "موقعك الحالي" else "Your Location",
                        color = JaxLimestone,
                        fontSize = 9.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Selected Hangar Detail Card
            selectedHangar?.let { hangar ->
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(14.dp))
                        .background(JaxSurfaceCard)
                        .border(1.dp, JaxGold.copy(alpha = 0.4f), RoundedCornerShape(14.dp))
                        .padding(16.dp)
                ) {
                    Column {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = hangar.code,
                                    color = JaxGold,
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier
                                        .background(JaxGold.copy(alpha = 0.15f), RoundedCornerShape(4.dp))
                                        .padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = if (isArabic) hangar.nameAr else hangar.nameEn,
                                    color = Color.White,
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }

                            Text(
                                text = "${hangar.distanceMeters}m",
                                color = JaxCyanHolo,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        Text(
                            text = if (isArabic) hangar.roleAr else hangar.roleEn,
                            color = JaxSandstone,
                            fontSize = 12.sp
                        )

                        Spacer(modifier = Modifier.height(6.dp))

                        Text(
                            text = "${if (isArabic) "المعرض الحالي: " else "Exhibition: "}${if (isArabic) hangar.currentExhibitionAr else hangar.currentExhibitionEn}",
                            color = JaxGoldLight,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium
                        )

                        Spacer(modifier = Modifier.height(14.dp))

                        // Action: Navigate / View Featured Art in AR
                        val featuredArt = artworks.firstOrNull { it.id in hangar.featuredArtworkIds }
                        Button(
                            onClick = {
                                if (featuredArt != null) {
                                    onSelectArtwork(featuredArt)
                                }
                                onDismiss()
                            },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = JaxGold,
                                contentColor = JaxBlack
                            ),
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Icon(
                                imageVector = Icons.Default.ViewInAr,
                                contentDescription = null,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = if (isArabic) "استكشاف بالواقع المعزز (AR)" else "Explore in AR Viewport",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }
        }
    }
}
