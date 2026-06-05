# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# React Native
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keepclassmembers class * { @com.facebook.react.bridge.ReactMethod <methods>; }

# TensorFlow Lite
-keep class org.tensorflow.lite.** { *; }
-keep interface org.tensorflow.lite.** { *; }

# Vision Camera
-keep class com.mrousavy.camera.** { *; }

# Reanimated
-keep class com.swmansion.reanimated.** { *; }

# SQLite
-keep class android.database.sqlite.** { *; }

# Crypto-js (JavaScript, but keep reflection patterns)
-dontwarn javax.crypto.**
