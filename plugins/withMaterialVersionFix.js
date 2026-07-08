const { withProjectBuildGradle } = require("@expo/config-plugins");

// material-components-android 1.13.0 trips a resource-compiler bug on the newer
// AAPT2 "aaptcompiler" backend (compileSdk 36 builds): mergeDebugResources fails with
// "Invalid <color> for given resource value" / "Can not extract resource from
// com.android.aaptcompiler.ParsedResource". Forcing the last known-good release fixes it.
const MARKER = "// withMaterialVersionFix";
const BLOCK = `
${MARKER}
allprojects {
  configurations.all {
    resolutionStrategy {
      force 'com.google.android.material:material:1.12.0'
    }
  }
}
`;

module.exports = function withMaterialVersionFix(config) {
  return withProjectBuildGradle(config, (config) => {
    if (config.modResults.language !== "groovy") {
      throw new Error("withMaterialVersionFix only supports Groovy build.gradle");
    }
    if (!config.modResults.contents.includes(MARKER)) {
      config.modResults.contents += BLOCK;
    }
    return config;
  });
};
