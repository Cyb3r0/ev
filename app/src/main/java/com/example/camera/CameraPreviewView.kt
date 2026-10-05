package com.example.camera

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.camera.core.CameraSelector
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import androidx.lifecycle.compose.LocalLifecycleOwner
import com.example.ui.theme.JaxBlack
import com.example.ui.theme.JaxGold
import com.example.ui.theme.JaxSurfaceDark
import java.util.concurrent.Executors

@Composable
fun CameraPreviewView(
    isSimulatedMode: Boolean,
    onSimulatedModeChange: (Boolean) -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current

    var hasCameraPermission by remember {
        mutableStateOf(
            ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED
        )
    }

    var cameraInitialized by remember { mutableStateOf(false) }

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { granted ->
        hasCameraPermission = granted
        if (!granted) {
            onSimulatedModeChange(true)
        }
    }

    LaunchedEffect(Unit) {
        if (!hasCameraPermission && !isSimulatedMode) {
            permissionLauncher.launch(Manifest.permission.CAMERA)
        }
    }

    Box(modifier = modifier.fillMaxSize().background(JaxBlack)) {
        if (!isSimulatedMode && hasCameraPermission) {
            AndroidView(
                factory = { ctx ->
                    val previewView = PreviewView(ctx).apply {
                        scaleType = PreviewView.ScaleType.FILL_CENTER
                    }

                    val cameraProviderFuture = ProcessCameraProvider.getInstance(ctx)
                    cameraProviderFuture.addListener({
                        try {
                            val cameraProvider = cameraProviderFuture.get()
                            val preview = Preview.Builder().build().also {
                                it.setSurfaceProvider(previewView.surfaceProvider)
                            }
                            val cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA

                            cameraProvider.unbindAll()
                            cameraProvider.bindToLifecycle(lifecycleOwner, cameraSelector, preview)
                            cameraInitialized = true
                        } catch (e: Exception) {
                            // Hardware camera not available (emulator), fallback to simulated mode
                            onSimulatedModeChange(true)
                        }
                    }, ContextCompat.getMainExecutor(ctx))

                    previewView
                },
                modifier = Modifier.fillMaxSize()
            )
        } else {
            // Realistic simulated JAX District twilight warehouse environment
            SimulatedJaxDistrictBackdrop()
        }
    }
}

@Composable
fun SimulatedJaxDistrictBackdrop(modifier: Modifier = Modifier) {
    val transition = rememberInfiniteTransition(label = "sim_drift")
    val skyGlow by transition.animateFloat(
        initialValue = 0.88f,
        targetValue = 1.0f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 6000, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "skyGlow"
    )

    Canvas(modifier = modifier.fillMaxSize()) {
        val width = size.width
        val height = size.height

        // Diriyah Twilight Sky Gradient (Basalt indigo to deep desert dusky amber)
        drawRect(
            brush = Brush.verticalGradient(
                colors = listOf(
                    Color(0xFF0C0E14),
                    Color(0xFF161922),
                    Color(0xFF261D1E),
                    Color(0xFF382319).copy(alpha = skyGlow)
                ),
                startY = 0f,
                endY = height * 0.72f
            ),
            size = Size(width, height * 0.72f)
        )

        // JAX Warehouse Silhouettes & Industrial Trusses in distance
        drawJaxWarehouseSilhouettes(width, height)

        // Desert Floor & Paved Exhibition Esplanade
        drawRect(
            brush = Brush.verticalGradient(
                colors = listOf(
                    Color(0xFF1F1D1B),
                    Color(0xFF141312),
                    Color(0xFF0A0909)
                ),
                startY = height * 0.70f,
                endY = height
            ),
            topLeft = Offset(0f, height * 0.70f),
            size = Size(width, height * 0.30f)
        )

        // Ambient ground grid / perspective paving lines of JAX plaza
        drawPlazaPerspectiveGrid(width, height)
    }
}

private fun DrawScope.drawJaxWarehouseSilhouettes(width: Float, height: Float) {
    val horizonY = height * 0.70f

    // Far warehouse silhouettes (JAX 01, 02, 03)
    val hangarPath = Path().apply {
        moveTo(0f, horizonY)
        // Hangar 01 pitched roof
        lineTo(0f, horizonY - 140f)
        lineTo(width * 0.22f, horizonY - 180f)
        lineTo(width * 0.44f, horizonY - 140f)
        // Gap
        lineTo(width * 0.48f, horizonY - 90f)
        // Hangar 03 modern cube
        lineTo(width * 0.50f, horizonY - 210f)
        lineTo(width * 0.78f, horizonY - 210f)
        lineTo(width * 0.80f, horizonY - 110f)
        // Palm grove silhouette near Wadi Hanifa
        lineTo(width * 0.84f, horizonY - 130f)
        lineTo(width * 0.90f, horizonY - 170f)
        lineTo(width * 0.96f, horizonY - 120f)
        lineTo(width, horizonY - 80f)
        lineTo(width, horizonY)
        close()
    }

    drawPath(
        path = hangarPath,
        color = Color(0xFF131418)
    )

    // Glowing warm interior clerestory windows of JAX 01
    drawRect(
        color = JaxGold.copy(alpha = 0.22f),
        topLeft = Offset(width * 0.12f, horizonY - 165f),
        size = Size(width * 0.20f, 16f)
    )
    drawRect(
        color = Color(0xFF00E5FF).copy(alpha = 0.35f),
        topLeft = Offset(width * 0.55f, horizonY - 195f),
        size = Size(width * 0.18f, 18f)
    )
}

private fun DrawScope.drawPlazaPerspectiveGrid(width: Float, height: Float) {
    val horizonY = height * 0.70f
    val vanishX = width * 0.5f

    // Radial perspective lines receding into horizon
    for (i in -4..4) {
        val bottomX = vanishX + (i * width * 0.32f)
        drawLine(
            color = Color(0xFF33302B).copy(alpha = 0.25f),
            start = Offset(vanishX, horizonY),
            end = Offset(bottomX, height),
            strokeWidth = 1.2f
        )
    }

    // Horizontal pavers
    for (step in 1..5) {
        val y = horizonY + (step * step / 25f) * (height - horizonY)
        drawLine(
            color = Color(0xFF33302B).copy(alpha = (step / 7f) * 0.25f),
            start = Offset(0f, y),
            end = Offset(width, y),
            strokeWidth = 1f
        )
    }
}
