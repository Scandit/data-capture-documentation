package com.scandit.validation

import android.content.Context
import com.scandit.datacapture.core.capture.DataCaptureContext
import com.scandit.datacapture.core.source.Camera
import com.scandit.datacapture.core.ui.DataCaptureView

/**
 * Base class for generated Kotlin snippet validators.
 *
 * Pre-declares the variables most commonly referenced across snippet sections
 * within a single documentation page, so concatenated statement-snippets
 * can find them in scope.
 */
@Suppress("all")
abstract class ValidationBase {

    // Android context — typically an Activity or Application
    protected lateinit var context: Context

    // Core SDK
    protected lateinit var dataCaptureContext: DataCaptureContext
    protected lateinit var camera: Camera
    protected lateinit var dataCaptureView: DataCaptureView
}
