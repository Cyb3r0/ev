package com.example.ar

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.gestures.detectTransformGestures
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.PointMode
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import com.example.data.Artwork
import com.example.data.Artwork3DPoint
import com.example.data.RenderStyle
import com.example.ui.theme.JaxAmber
import com.example.ui.theme.JaxCyanHolo
import com.example.ui.theme.JaxGold
import com.example.ui.theme.JaxGoldLight
import com.example.ui.theme.JaxLimestone
import com.example.ui.theme.JaxTerracotta
import kotlin.math.PI
import kotlin.math.abs
import kotlin.math.cos
import kotlin.math.sin

data class ProjectedPoint(
    val screenX: Float,
    val screenY: Float,
    val depthZ: Float,
    val isVisible: Boolean
)

@Composable
fun ArSceneRenderer(
    artwork: Artwork,
    deviceAzimuth: Float,
    devicePitch: Float,
    renderStyle: RenderStyle,
    isAnchored: Boolean,
    onAnchorToggle: () -> Unit,
    userScale: Float,
    onScaleChange: (Float) -> Unit,
    modifier: Modifier = Modifier
) {
    // Model orbit / manual rotation
    var modelYaw by remember(artwork.id) { mutableFloatStateOf(0f) }
    var modelPitch by remember(artwork.id) { mutableFloatStateOf(10f) }
    var modelVerticalOffset by remember(artwork.id) { mutableFloatStateOf(0f) }

    // Ambient floating particles around sculpture
    val infiniteTransition = rememberInfiniteTransition(label = "ar_particles")
    val timeTick by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 18000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "timeTick"
    )

    val reticlePulse by infiniteTransition.animateFloat(
        initialValue = 0.85f,
        targetValue = 1.15f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 1600, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "reticlePulse"
    )

    Canvas(
        modifier = modifier
            .fillMaxSize()
            .pointerInput(artwork.id) {
                detectTransformGestures { _, pan, zoom, _ ->
                    if (zoom != 1f) {
                        onScaleChange((userScale * zoom).coerceIn(0.4f, 3.2f))
                    }
                    modelYaw = (modelYaw + pan.x * 0.4f) % 360f
                    modelPitch = (modelPitch + pan.y * 0.3f).coerceIn(-60f, 60f)
                }
            }
    ) {
        val width = size.width
        val height = size.height
        val centerX = width / 2f
        val centerY = height / 2f + modelVerticalOffset

        // Relative angular offset between where the device points and where the artwork is placed
        val angularDiffDeg = run {
            var diff = (artwork.compassBearingDeg - deviceAzimuth) % 360f
            if (diff > 180f) diff -= 360f
            if (diff < -180f) diff += 360f
            diff
        }

        // Horizontal camera field of view ~ 65 degrees
        val fovDeg = 65f
        val horizontalOffset = (angularDiffDeg / fovDeg) * width
        val verticalPitchOffset = (devicePitch / 45f) * (height * 0.4f)

        val targetScreenCenterX = if (isAnchored) centerX else (centerX + horizontalOffset)
        val targetScreenCenterY = if (isAnchored) (centerY + 60f) else (centerY - verticalPitchOffset)

        // Draw Ground Anchor Plane Reticle
        drawGroundPlaneReticle(
            centerX = targetScreenCenterX,
            centerY = targetScreenCenterY + (height * 0.22f * userScale),
            reticlePulse = reticlePulse,
            renderStyle = renderStyle,
            isAnchored = isAnchored
        )

        // Draw Ambient Spatial Stardust / Light Orbs
        drawAmbientOrbs(
            centerX = targetScreenCenterX,
            centerY = targetScreenCenterY,
            timeTick = timeTick,
            scale = userScale,
            renderStyle = renderStyle
        )

        // Kinetic sculpture continuous slight rotation
        val kineticYaw = (modelYaw + timeTick * 0.6f) * (PI.toFloat() / 180f)
        val pitchRad = modelPitch * (PI.toFloat() / 180f)

        // Focal length for perspective projection
        val focalLength = width * 1.15f * userScale * artwork.baseScale
        val cameraDistance = 4.2f

        // Project all 3D vertices
        val projectedPoints = artwork.meshVertices.map { pt ->
            // Rotate around Y axis (yaw)
            val cosY = cos(kineticYaw)
            val sinY = sin(kineticYaw)
            val x1 = pt.x * cosY + pt.z * sinY
            val z1 = -pt.x * sinY + pt.z * cosY

            // Rotate around X axis (pitch)
            val cosP = cos(pitchRad)
            val sinP = sin(pitchRad)
            val y2 = pt.y * cosP - z1 * sinP
            val z2 = pt.y * sinP + z1 * cosP

            val depth = z2 + cameraDistance
            if (depth > 0.3f) {
                val projX = targetScreenCenterX + (x1 / depth) * focalLength
                val projY = targetScreenCenterY - (y2 / depth) * focalLength
                ProjectedPoint(projX, projY, depth, isVisible = true)
            } else {
                ProjectedPoint(0f, 0f, depth, isVisible = false)
            }
        }

        // Color palettes per render style
        val (primaryColor, secondaryColor, glowColor) = when (renderStyle) {
            RenderStyle.METALLIC_GOLD -> Triple(JaxGold, JaxGoldLight, JaxAmber)
            RenderStyle.CYAN_HOLOGRAM -> Triple(JaxCyanHolo, Color(0xFF80D8FF), Color(0xFF00B0FF))
            RenderStyle.DESERT_TERRACOTTA -> Triple(JaxTerracotta, JaxLimestone, Color(0xFFD97706))
        }

        // Draw 3D Edges
        artwork.meshEdges.forEach { edge ->
            if (edge.startIndex < projectedPoints.size && edge.endIndex < projectedPoints.size) {
                val p1 = projectedPoints[edge.startIndex]
                val p2 = projectedPoints[edge.endIndex]

                if (p1.isVisible && p2.isVisible) {
                    val avgDepth = (p1.depthZ + p2.depthZ) / 2f
                    val alpha = (1.0f - ((avgDepth - 2.5f) / 4f)).coerceIn(0.25f, 0.95f)

                    val strokeWidth = (4.5f / avgDepth * userScale).coerceIn(1.5f, 6.5f)

                    // Draw outer subtle glow line
                    drawLine(
                        color = glowColor.copy(alpha = alpha * 0.4f),
                        start = Offset(p1.screenX, p1.screenY),
                        end = Offset(p2.screenX, p2.screenY),
                        strokeWidth = strokeWidth * 2.2f,
                        cap = StrokeCap.Round
                    )

                    // Draw core structural wireframe line
                    drawLine(
                        color = primaryColor.copy(alpha = alpha),
                        start = Offset(p1.screenX, p1.screenY),
                        end = Offset(p2.screenX, p2.screenY),
                        strokeWidth = strokeWidth,
                        cap = StrokeCap.Round
                    )
                }
            }
        }

        // Draw 3D Vertices / Illuminated Nodes
        projectedPoints.forEach { pt ->
            if (pt.isVisible) {
                val alpha = (1.1f - ((pt.depthZ - 2.5f) / 4f)).coerceIn(0.35f, 1.0f)
                val nodeRadius = (6.5f / pt.depthZ * userScale).coerceIn(2.5f, 9.0f)

                // Outer halo
                drawCircle(
                    brush = Brush.radialGradient(
                        colors = listOf(secondaryColor.copy(alpha = alpha * 0.8f), Color.Transparent),
                        center = Offset(pt.screenX, pt.screenY),
                        radius = nodeRadius * 2.8f
                    ),
                    center = Offset(pt.screenX, pt.screenY),
                    radius = nodeRadius * 2.8f
                )

                // Inner core
                drawCircle(
                    color = primaryColor.copy(alpha = alpha),
                    center = Offset(pt.screenX, pt.screenY),
                    radius = nodeRadius
                )
            }
        }

        // Draw 3D Axis Compass Ring on sculpture base
        drawSculptureBaseRing(
            centerX = targetScreenCenterX,
            centerY = targetScreenCenterY + (height * 0.20f * userScale),
            radius = (width * 0.28f * userScale).coerceIn(40f, 220f),
            color = primaryColor,
            isAnchored = isAnchored
        )
    }
}

private fun DrawScope.drawGroundPlaneReticle(
    centerX: Float,
    centerY: Float,
    reticlePulse: Float,
    renderStyle: RenderStyle,
    isAnchored: Boolean
) {
    val ringColor = when (renderStyle) {
        RenderStyle.METALLIC_GOLD -> JaxGold
        RenderStyle.CYAN_HOLOGRAM -> JaxCyanHolo
        RenderStyle.DESERT_TERRACOTTA -> JaxTerracotta
    }

    val baseRadius = 80f * reticlePulse

    // Perspective flattened ellipse representing ground plane
    val heightRatio = 0.32f

    // Outer pulsed ring
    drawOval(
        color = ringColor.copy(alpha = if (isAnchored) 0.55f else 0.3f),
        topLeft = Offset(centerX - baseRadius, centerY - (baseRadius * heightRatio)),
        size = androidx.compose.ui.geometry.Size(baseRadius * 2f, baseRadius * 2f * heightRatio),
        style = Stroke(
            width = 2.5f,
            pathEffect = PathEffect.dashPathEffect(floatArrayOf(18f, 14f), 0f)
        )
    )

    // Inner target ring
    val innerRadius = baseRadius * 0.55f
    drawOval(
        color = ringColor.copy(alpha = if (isAnchored) 0.85f else 0.5f),
        topLeft = Offset(centerX - innerRadius, centerY - (innerRadius * heightRatio)),
        size = androidx.compose.ui.geometry.Size(innerRadius * 2f, innerRadius * 2f * heightRatio),
        style = Stroke(width = 1.8f)
    )

    // Crosshair ticks
    val tickLen = 14f
    drawLine(
        color = ringColor.copy(alpha = 0.7f),
        start = Offset(centerX - innerRadius - tickLen, centerY),
        end = Offset(centerX - innerRadius + tickLen, centerY),
        strokeWidth = 2f
    )
    drawLine(
        color = ringColor.copy(alpha = 0.7f),
        start = Offset(centerX + innerRadius - tickLen, centerY),
        end = Offset(centerX + innerRadius + tickLen, centerY),
        strokeWidth = 2f
    )
}

private fun DrawScope.drawSculptureBaseRing(
    centerX: Float,
    centerY: Float,
    radius: Float,
    color: Color,
    isAnchored: Boolean
) {
    val heightRatio = 0.28f
    drawOval(
        color = color.copy(alpha = if (isAnchored) 0.6f else 0.25f),
        topLeft = Offset(centerX - radius, centerY - radius * heightRatio),
        size = androidx.compose.ui.geometry.Size(radius * 2f, radius * 2f * heightRatio),
        style = Stroke(width = 1.5f)
    )
}

private fun DrawScope.drawAmbientOrbs(
    centerX: Float,
    centerY: Float,
    timeTick: Float,
    scale: Float,
    renderStyle: RenderStyle
) {
    val orbColor = when (renderStyle) {
        RenderStyle.METALLIC_GOLD -> JaxGoldLight
        RenderStyle.CYAN_HOLOGRAM -> JaxCyanHolo
        RenderStyle.DESERT_TERRACOTTA -> JaxLimestone
    }

    val particleCount = 14
    for (i in 0 until particleCount) {
        val angle = (timeTick * 1.2f + i * (360f / particleCount)) * (PI.toFloat() / 180f)
        val dist = (90f + (i * 18f % 110f)) * scale
        val elevation = sin(timeTick * 0.05f + i.toFloat()) * 70f * scale

        val x = centerX + cos(angle) * dist
        val y = centerY + sin(angle) * (dist * 0.45f) + elevation

        val alpha = (0.25f + 0.45f * sin(angle * 2f)).coerceIn(0.1f, 0.75f)
        drawCircle(
            color = orbColor.copy(alpha = alpha),
            center = Offset(x, y),
            radius = (1.8f + (i % 3) * 1.2f) * scale
        )
    }
}
