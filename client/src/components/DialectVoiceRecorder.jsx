  return (
    <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/60 dark:bg-slate-900 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            ৬৪ জেলা আঞ্চলিক ভয়েস ও ভিডিও স্মার্ট বুকিং
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            আপনার এলাকার ভাষায় বলুন কত স্কয়ার ফিট বা কয়টি রুম রঙ করবেন, অথবা দেয়ালের ভিডিও দিন
          </p>
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-600 text-white font-medium">
          AI Slot Engine
        </span>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {!isRecording ? (
          <button
            type="button"
            onClick={startVoiceRecording}
            className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5"
          >
            <span>🎙️</span> ভয়েস রেকর্ড করুন
          </button>
        ) : (
          <button
            type="button"
            onClick={stopVoiceRecording}
            className="px-3.5 py-2 rounded-lg bg-slate-800 text-white text-xs font-semibold animate-pulse"
          >
            ⏹️ থামান ({recordingSeconds}s / 60s)
          </button>
        )}

        <label className="px-3.5 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 text-xs font-semibold cursor-pointer">
          🎥 দেয়ালের ভিডিও আপলোড
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoSelect}
            className="hidden"
          />
        </label>

        {mediaFile && (
          <button
            type="button"
            onClick={clearMedia}
            className="px-2.5 py-2 text-xs text-red-600 hover:underline"
          >
            মুছুন
          </button>
        )}
      </div>

      {/* Preview & Analyze Trigger */}
      {previewUrl && (
        <div className="p-3 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
          {mediaType === 'voice' ? (
            <audio src={previewUrl} controls className="w-full h-9" />
          ) : (
            <video src={previewUrl} controls className="w-full max-h-44 rounded" />
          )}

          <button
            type="button"
            onClick={handleAnalyzeMedia}
            disabled={analyzing}
            className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold"
          >
            {analyzing ? 'আঞ্চলিক ভাষা ও Sqft বিশ্লেষণ হচ্ছে...' : 'অটো Sqft ও স্লট বের করুন'}
          </button>
        </div>
      )}

      {errorMsg && (
        <p className="text-xs text-red-600 bg-red-50 dark:bg-red-950/40 p-2.5 rounded-lg">
          {errorMsg}
        </p>
      )}

      {/* Detected Result Summary */}
      {result && (
        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1">
          <p className="font-semibold text-emerald-800 dark:text-emerald-300">
            শনাক্তকৃত ভাষা: {result.detectedDialect} (নির্ভুলতা: {Math.round(result.confidence * 100)}%)
          </p>
          {result.transcribedText && (
            <p className="text-slate-700 dark:text-slate-300">
              “{result.transcribedText}”
            </p>
          )}
          <div className="flex flex-wrap gap-3 pt-1 font-semibold text-slate-900 dark:text-white">
            <span>মোট Sqft: {result.detectedSqft}</span>
            <span>প্রয়োজনীয় স্লট: {result.calculatedSlots} দিন</span>
            {result.suggestedService && <span>কাজ: {result.suggestedService}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
