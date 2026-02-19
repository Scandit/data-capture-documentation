plugins {
    id("com.android.application")
}

val scanditSdkVersion = (project.findProperty("scanditSdkVersion") as String?) ?: "8.2.0"

android {
    namespace = "com.scandit.validation"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.scandit.validation"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }
}

tasks.withType<JavaCompile>().configureEach {
    options.compilerArgs.addAll(listOf("-Xmaxerrs", "10000"))
}

// Resolves and exports the debug compile classpath to a file so the
// validate.py script can invoke javac directly per snippet.
tasks.register("exportClasspath") {
    doLast {
        val outputFile = layout.buildDirectory.file("compile-classpath.txt").get().asFile
        outputFile.parentFile.mkdirs()
        outputFile.writeText(
            configurations.getByName("debugCompileClasspath")
                .resolve()
                .joinToString(File.pathSeparator) { it.absolutePath }
        )
    }
}

dependencies {
    // All SDK modules as compileOnly — we only need the types, not the runtime
    compileOnly("com.scandit.datacapture:core:$scanditSdkVersion")
    compileOnly("com.scandit.datacapture:barcode:$scanditSdkVersion")
    compileOnly("com.scandit.datacapture:id:$scanditSdkVersion")
    compileOnly("com.scandit.datacapture:label:$scanditSdkVersion")
    compileOnly("com.scandit.datacapture:parser:$scanditSdkVersion")

    compileOnly("androidx.annotation:annotation:1.7.0")
    compileOnly("androidx.appcompat:appcompat:1.7.0")
    compileOnly("androidx.lifecycle:lifecycle-livedata:2.8.0")
}
