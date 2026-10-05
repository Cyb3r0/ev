package com.example.sensors

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import kotlin.math.PI
import kotlin.math.atan2
import kotlin.math.cos
import kotlin.math.sin

class CompassOrientationManager(context: Context) : SensorEventListener {

    private val sensorManager = context.getSystemService(Context.SENSOR_SERVICE) as SensorManager
    private val rotationSensor: Sensor? = sensorManager.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR)
    private val accelerometer: Sensor? = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
    private val magnetometer: Sensor? = sensorManager.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD)

    var azimuthDeg by mutableFloatStateOf(35f)
        private set

    var pitchDeg by mutableFloatStateOf(0f)
        private set

    var rollDeg by mutableFloatStateOf(0f)
        private set

    var isSensorAvailable by mutableStateOf(rotationSensor != null || (accelerometer != null && magnetometer != null))
        private set

    // User manual adjustment offsets (for emulator or desk testing)
    var manualAzimuthOffset by mutableFloatStateOf(0f)
    var manualPitchOffset by mutableFloatStateOf(0f)

    private val rotationMatrix = FloatArray(9)
    private val orientationAngles = FloatArray(3)
    private val lastAccelerometer = FloatArray(3)
    private val lastMagnetometer = FloatArray(3)
    private var lastAccelerometerSet = false
    private var lastMagnetometerSet = false

    private val alpha = 0.2f // Low pass filter factor for silky smooth AR stabilization

    fun startListening() {
        if (rotationSensor != null) {
            sensorManager.registerListener(this, rotationSensor, SensorManager.SENSOR_DELAY_UI)
        } else {
            accelerometer?.let { sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_UI) }
            magnetometer?.let { sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_UI) }
        }
    }

    fun stopListening() {
        sensorManager.unregisterListener(this)
    }

    fun addManualPan(deltaAzimuth: Float, deltaPitch: Float) {
        manualAzimuthOffset = (manualAzimuthOffset + deltaAzimuth) % 360f
        if (manualAzimuthOffset < 0f) manualAzimuthOffset += 360f
        manualPitchOffset = (manualPitchOffset + deltaPitch).coerceIn(-45f, 45f)
    }

    fun resetHeading() {
        manualAzimuthOffset = 0f
        manualPitchOffset = 0f
    }

    override fun onSensorChanged(event: SensorEvent?) {
        if (event == null) return

        if (event.sensor.type == Sensor.TYPE_ROTATION_VECTOR) {
            SensorManager.getRotationMatrixFromVector(rotationMatrix, event.values)
            SensorManager.getOrientation(rotationMatrix, orientationAngles)
            updateSmoothedAngles(
                rawAzimuth = Math.toDegrees(orientationAngles[0].toDouble()).toFloat(),
                rawPitch = Math.toDegrees(orientationAngles[1].toDouble()).toFloat(),
                rawRoll = Math.toDegrees(orientationAngles[2].toDouble()).toFloat()
            )
        } else if (event.sensor.type == Sensor.TYPE_ACCELEROMETER) {
            System.arraycopy(event.values, 0, lastAccelerometer, 0, event.values.size)
            lastAccelerometerSet = true
        } else if (event.sensor.type == Sensor.TYPE_MAGNETIC_FIELD) {
            System.arraycopy(event.values, 0, lastMagnetometer, 0, event.values.size)
            lastMagnetometerSet = true
        }

        if (lastAccelerometerSet && lastMagnetometerSet && rotationSensor == null) {
            if (SensorManager.getRotationMatrix(rotationMatrix, null, lastAccelerometer, lastMagnetometer)) {
                SensorManager.getOrientation(rotationMatrix, orientationAngles)
                updateSmoothedAngles(
                    rawAzimuth = Math.toDegrees(orientationAngles[0].toDouble()).toFloat(),
                    rawPitch = Math.toDegrees(orientationAngles[1].toDouble()).toFloat(),
                    rawRoll = Math.toDegrees(orientationAngles[2].toDouble()).toFloat()
                )
            }
        }
    }

    private fun updateSmoothedAngles(rawAzimuth: Float, rawPitch: Float, rawRoll: Float) {
        val normalizedAzimuth = (rawAzimuth + 360f) % 360f
        // Angular interpolation to prevent 359 -> 0 degree wrapping jitter
        val currentRad = azimuthDeg * (PI.toFloat() / 180f)
        val targetRad = normalizedAzimuth * (PI.toFloat() / 180f)
        val diffSin = sin(targetRad - currentRad)
        val diffCos = cos(targetRad - currentRad)
        val step = atan2(diffSin, diffCos) * alpha
        var newAzimuth = (currentRad + step) * (180f / PI.toFloat())
        if (newAzimuth < 0f) newAzimuth += 360f
        if (newAzimuth >= 360f) newAzimuth -= 360f

        azimuthDeg = newAzimuth
        pitchDeg = pitchDeg + alpha * (rawPitch - pitchDeg)
        rollDeg = rollDeg + alpha * (rawRoll - rollDeg)
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {
        // No-op
    }

    val totalAzimuth: Float
        get() = (azimuthDeg + manualAzimuthOffset + 360f) % 360f

    val totalPitch: Float
        get() = (pitchDeg + manualPitchOffset).coerceIn(-60f, 60f)
}
