package com.scandit.validation;

import android.content.Context;
import com.scandit.datacapture.core.capture.DataCaptureContext;
import com.scandit.datacapture.core.source.Camera;
import com.scandit.datacapture.core.ui.DataCaptureView;

/**
 * Base class for generated Java snippet validators.
 *
 * Pre-declares the variables most commonly referenced across snippet sections
 * within a single documentation page, so concatenated statement-snippets
 * can find them in scope.
 */
@SuppressWarnings("all")
abstract class ValidationBaseJava {

    // Android context — typically an Activity or Application
    protected Context context;

    // Core SDK
    protected DataCaptureContext dataCaptureContext;
    protected Camera camera;
    protected DataCaptureView dataCaptureView;
}
