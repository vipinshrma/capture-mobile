import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

patch("../node_modules/expo-audio/ios/AudioRecordingRequester.swift", [
  ["return [\"status\": EXPermissionStatusDenied]", "return [\"status\": NSNumber(value: EXPermissionStatusDenied.rawValue)]"],
  ["\"status\": status.rawValue", "\"status\": NSNumber(value: status.rawValue)"],
]);

patch("../node_modules/expo-sharing/ios/SharingRecords.swift", [[
`    if expoSharePayload.shareType == .url, let url = URL(string: payload.value) {
      let contentDetails = try await resolveUrlContentDetails(url: url)
      return Self.init(
        // Base payload
        value: expoSharePayload.value,
        shareType: expoSharePayload.shareType,
        mimeType: expoSharePayload.mimeType,
        // Resolved data
        contentUri: contentDetails.uri,
        contentType: contentDetails.type,
        contentSize: contentDetails.size,
        contentMimeType: contentDetails.mimeType,
        originalName: contentDetails.originalName
      )
    }`,
`    if expoSharePayload.shareType == .url {
      return Self.init(value: expoSharePayload.value, shareType: .url, mimeType: expoSharePayload.mimeType)
    }`,
]]);

patch("../node_modules/expo-sharing/ios/SharingModule.swift", [[
`    Function("clearSharedPayloads") {
      try UserDefaults(suiteName: appGroupId)?.removeObject(forKey: SHARE_INTO_DEFAULTS_KEY)
    }`,
`    Function("clearSharedPayloads") {
      if let container = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: try appGroupId),
         let files = try? FileManager.default.contentsOfDirectory(at: container, includingPropertiesForKeys: [.isRegularFileKey]) {
        for file in files where (try? file.resourceValues(forKeys: [.isRegularFileKey]).isRegularFile) == true {
          try? FileManager.default.removeItem(at: file)
        }
      }
      try UserDefaults(suiteName: appGroupId)?.removeObject(forKey: SHARE_INTO_DEFAULTS_KEY)
    }`,
]]);

patch("../node_modules/expo-sharing/android/src/main/java/expo/modules/sharing/dataParsers/ResolvingShareIntentDataParser.kt", [
  ["  companion object {", "  companion object {\n    private const val MAX_INCOMING_BYTES = 100L * 1024 * 1024"],
  [
`          FileOutputStream(file).use { output ->
            input.copyTo(output)
          }`,
`          FileOutputStream(file).use { output ->
            val buffer = ByteArray(DEFAULT_BUFFER_SIZE)
            var copied = 0L
            while (true) {
              val count = input.read(buffer)
              if (count < 0) break
              copied += count
              if (copied > MAX_INCOMING_BYTES) throw IllegalArgumentException("Attachment exceeds the 100 MB limit")
              output.write(buffer, 0, count)
            }
          }`,
  ],
  ["      } catch (e: Exception) {\n        e.printStackTrace()\n      }", "      } catch (e: Exception) {\n        file.delete()\n        throw e\n      }"],
]);

const androidPath = fileURLToPath(new URL("../node_modules/expo-sharing/android/src/main/java/expo/modules/sharing/dataParsers/ResolvingShareIntentDataParser.kt", import.meta.url));
let android = readFileSync(androidPath, "utf8");
const safeResolver = `    private fun resolveUrlContext(urlString: String) = ResolvedSharePayload().apply {
      value = urlString
      shareType = ShareType.Url
      mimeType = "text/plain"
    }`;
if (!android.includes(safeResolver)) {
  const urlStart = android.indexOf("    private fun resolveUrlContext(urlString: String): ResolvedSharePayload {");
  const urlEnd = android.indexOf("\n    }\n  }\n}", urlStart);
  if (urlStart < 0 || urlEnd < 0) throw new Error("expo-sharing URL resolver source changed");
  android = android.slice(0, urlStart) + safeResolver + android.slice(urlEnd + 6);
  writeFileSync(androidPath, android);
}

function patch(relativePath, replacements) {
  const path = fileURLToPath(new URL(relativePath, import.meta.url));
  let source = readFileSync(path, "utf8");

  for (const [before, after] of replacements) {
    if (source.includes(after)) continue;
    if (!source.includes(before)) throw new Error(`${relativePath} changed; missing: ${before}`);
    source = source.replace(before, after);
  }

  writeFileSync(path, source);
}
