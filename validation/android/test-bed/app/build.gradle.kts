import java.util.zip.ZipFile

plugins {
    `java-library`
    kotlin("jvm")
}

val scanditSdkVersion = (project.findProperty("scanditSdkVersion") as String?) ?: "8.2.0"

java {
    sourceCompatibility = JavaVersion.VERSION_1_8
    targetCompatibility = JavaVersion.VERSION_1_8
}

sourceSets {
    main {
        kotlin.srcDirs("src/main/kotlin", "src/generated")
    }
}

// ---------------------------------------------------------------------------
// Make Gradle accept .aar artifacts from Android libraries in a JVM project.
// Two pieces are needed:
//   1) Attribute compatibility rule: tells variant selection that "aar"
//      library elements are acceptable when the consumer wants "jar".
//   2) Artifact transform: extracts classes.jar from each resolved .aar.
// ---------------------------------------------------------------------------

abstract class AarCompatibilityRule : AttributeCompatibilityRule<LibraryElements> {
    override fun execute(details: CompatibilityCheckDetails<LibraryElements>) {
        if (details.producerValue?.name == "aar") {
            details.compatible()
        }
    }
}

@CacheableTransform
abstract class AarToJarTransform : TransformAction<TransformParameters.None> {
    @get:InputArtifact
    @get:PathSensitive(PathSensitivity.NAME_ONLY)
    abstract val inputArtifact: Provider<FileSystemLocation>

    override fun transform(outputs: TransformOutputs) {
        val aar = inputArtifact.get().asFile
        ZipFile(aar).use { zip ->
            val entry = zip.getEntry("classes.jar") ?: return
            outputs.file("${aar.nameWithoutExtension}.jar").outputStream().use { out ->
                zip.getInputStream(entry).copyTo(out)
            }
        }
    }
}

val artifactType = Attribute.of("artifactType", String::class.java)

dependencies {
    attributesSchema {
        attribute(LibraryElements.LIBRARY_ELEMENTS_ATTRIBUTE) {
            compatibilityRules.add(AarCompatibilityRule::class)
        }
    }
    registerTransform(AarToJarTransform::class) {
        from.attribute(artifactType, "aar")
        to.attribute(artifactType, "jar")
    }
}

// ---------------------------------------------------------------------------
// Export the compile classpath so the Python script can invoke javac/kotlinc
// ---------------------------------------------------------------------------

tasks.register("exportClasspath") {
    doLast {
        val outputFile = layout.buildDirectory.file("compile-classpath.txt").get().asFile
        outputFile.parentFile.mkdirs()
        outputFile.writeText(
            configurations.getByName("compileClasspath")
                .incoming
                .artifactView {
                    attributes {
                        attribute(artifactType, "jar")
                    }
                }
                .artifacts
                .artifactFiles
                .files
                .joinToString(File.pathSeparator) { it.absolutePath }
        )
    }
}

// ---------------------------------------------------------------------------
// Dependencies
// ---------------------------------------------------------------------------

dependencies {
    // Android framework stubs via Robolectric — replaces local android.jar
    compileOnly("org.robolectric:android-all:14-robolectric-10818077")

    // All SDK modules as compileOnly — we only need the types, not the runtime
    compileOnly("com.scandit.datacapture:core:$scanditSdkVersion")
    compileOnly("com.scandit.datacapture:barcode:$scanditSdkVersion")
    compileOnly("com.scandit.datacapture:id:$scanditSdkVersion")
    compileOnly("com.scandit.datacapture:label:$scanditSdkVersion")
    compileOnly("com.scandit.datacapture:parser:$scanditSdkVersion")

    compileOnly("androidx.annotation:annotation:1.9.1")
    compileOnly("androidx.appcompat:appcompat:1.7.1")
    compileOnly("androidx.lifecycle:lifecycle-livedata:2.10.0")
}
