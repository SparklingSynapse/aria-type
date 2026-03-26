import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  settingsCommands,
  type ModelInfo,
} from "@/lib/tauri";
import { analytics } from "@/lib/analytics";
import { AnalyticsEvents } from "@/lib/events";
import { useSettingsContext } from "@/contexts/SettingsContext";

const WHISPER_LANGUAGES = [
  { code: "auto", label: "Auto", prompt: "" },
  { code: "af", label: "Afrikaans", prompt: "" },
  { code: "sq", label: "Albanian", prompt: "" },
  { code: "am", label: "Amharic", prompt: "" },
  { code: "ar", label: "Arabic", prompt: "" },
  { code: "hy", label: "Armenian", prompt: "" },
  { code: "as", label: "Assamese", prompt: "" },
  { code: "az", label: "Azerbaijani", prompt: "" },
  { code: "ba", label: "Bashkir", prompt: "" },
  { code: "eu", label: "Basque", prompt: "" },
  { code: "be", label: "Belarusian", prompt: "" },
  { code: "bn", label: "Bengali", prompt: "" },
  { code: "bs", label: "Bosnian", prompt: "" },
  { code: "br", label: "Breton", prompt: "" },
  { code: "bg", label: "Bulgarian", prompt: "" },
  { code: "yue", label: "Cantonese", prompt: "" },
  { code: "ca", label: "Catalan", prompt: "" },
  {
    code: "zh",
    label: "Chinese (Simplified)",
    prompt:
      "This is a Mandarin speech-to-text result. Please output in Simplified Chinese characters. Do not use Traditional Chinese. The speaker is from mainland China.",
  },
  {
    code: "zh-TW",
    label: "Chinese (Traditional)",
    prompt:
      "This is a Mandarin transcription. Use Traditional Chinese characters. The speaker is from Taiwan. Please output all content in Traditional Chinese.",
  },
  { code: "hr", label: "Croatian", prompt: "" },
  { code: "cs", label: "Czech", prompt: "" },
  { code: "da", label: "Danish", prompt: "" },
  { code: "nl", label: "Dutch", prompt: "" },
  { code: "en", label: "English", prompt: "" },
  { code: "et", label: "Estonian", prompt: "" },
  { code: "fo", label: "Faroese", prompt: "" },
  { code: "fi", label: "Finnish", prompt: "" },
  { code: "fr", label: "French", prompt: "" },
  { code: "gl", label: "Galician", prompt: "" },
  { code: "ka", label: "Georgian", prompt: "" },
  { code: "de", label: "German", prompt: "" },
  { code: "el", label: "Greek", prompt: "" },
  { code: "gu", label: "Gujarati", prompt: "" },
  { code: "ht", label: "Haitian Creole", prompt: "" },
  { code: "ha", label: "Hausa", prompt: "" },
  { code: "haw", label: "Hawaiian", prompt: "" },
  { code: "he", label: "Hebrew", prompt: "" },
  { code: "hi", label: "Hindi", prompt: "" },
  { code: "hu", label: "Hungarian", prompt: "" },
  { code: "is", label: "Icelandic", prompt: "" },
  { code: "id", label: "Indonesian", prompt: "" },
  { code: "jw", label: "Javanese", prompt: "" },
  { code: "kn", label: "Kannada", prompt: "" },
  { code: "kk", label: "Kazakh", prompt: "" },
  { code: "km", label: "Khmer", prompt: "" },
  { code: "ko", label: "Korean", prompt: "" },
  { code: "lo", label: "Lao", prompt: "" },
  { code: "la", label: "Latin", prompt: "" },
  { code: "lv", label: "Latvian", prompt: "" },
  { code: "ln", label: "Lingala", prompt: "" },
  { code: "lt", label: "Lithuanian", prompt: "" },
  { code: "lb", label: "Luxembourgish", prompt: "" },
  { code: "mk", label: "Macedonian", prompt: "" },
  { code: "mg", label: "Malagasy", prompt: "" },
  { code: "ms", label: "Malay", prompt: "" },
  { code: "ml", label: "Malayalam", prompt: "" },
  { code: "mt", label: "Maltese", prompt: "" },
  { code: "mi", label: "Maori", prompt: "" },
  { code: "mr", label: "Marathi", prompt: "" },
  { code: "mn", label: "Mongolian", prompt: "" },
  { code: "my", label: "Myanmar", prompt: "" },
  { code: "ne", label: "Nepali", prompt: "" },
  { code: "no", label: "Norwegian", prompt: "" },
  { code: "nn", label: "Nynorsk", prompt: "" },
  { code: "oc", label: "Occitan", prompt: "" },
  { code: "ps", label: "Pashto", prompt: "" },
  { code: "fa", label: "Persian", prompt: "" },
  { code: "pl", label: "Polish", prompt: "" },
  { code: "pt", label: "Portuguese", prompt: "" },
  { code: "pa", label: "Punjabi", prompt: "" },
  { code: "ro", label: "Romanian", prompt: "" },
  { code: "ru", label: "Russian", prompt: "" },
  { code: "sa", label: "Sanskrit", prompt: "" },
  { code: "sr", label: "Serbian", prompt: "" },
  { code: "sn", label: "Shona", prompt: "" },
  { code: "sd", label: "Sindhi", prompt: "" },
  { code: "si", label: "Sinhala", prompt: "" },
  { code: "sk", label: "Slovak", prompt: "" },
  { code: "sl", label: "Slovenian", prompt: "" },
  { code: "so", label: "Somali", prompt: "" },
  { code: "es", label: "Spanish", prompt: "" },
  { code: "su", label: "Sundanese", prompt: "" },
  { code: "sw", label: "Swahili", prompt: "" },
  { code: "sv", label: "Swedish", prompt: "" },
  { code: "tl", label: "Tagalog", prompt: "" },
  { code: "tg", label: "Tajik", prompt: "" },
  { code: "ta", label: "Tamil", prompt: "" },
  { code: "tt", label: "Tatar", prompt: "" },
  { code: "te", label: "Telugu", prompt: "" },
  { code: "th", label: "Thai", prompt: "" },
  { code: "bo", label: "Tibetan", prompt: "" },
  { code: "tk", label: "Turkmen", prompt: "" },
  { code: "tr", label: "Turkish", prompt: "" },
  { code: "uk", label: "Ukrainian", prompt: "" },
  { code: "ur", label: "Urdu", prompt: "" },
  { code: "uz", label: "Uzbek", prompt: "" },
  { code: "vi", label: "Vietnamese", prompt: "" },
  { code: "cy", label: "Welsh", prompt: "" },
  { code: "yi", label: "Yiddish", prompt: "" },
  { code: "yo", label: "Yoruba", prompt: "" },
];

interface VoiceInputSectionProps {
  models: ModelInfo[];
  downloading: Set<string>;
  downloadProgress: Record<string, number>;
  onDownload: (modelName: string) => void;
  onCancel: (modelName: string) => void;
  onDelete: (modelName: string) => void;
}

export function VoiceInputSection({
  models,
  downloading,
  downloadProgress,
  onDownload,
  onCancel,
  onDelete,
}: VoiceInputSectionProps) {
  const { t } = useTranslation();
  const { settings, updateSetting } = useSettingsContext();
  const [availableSubdomains, setAvailableSubdomains] = useState<string[]>([]);

  useEffect(() => {
    if (!settings) return;

    if (settings.stt_engine_work_domain && settings.stt_engine_work_domain !== "general") {
      settingsCommands.getAvailableSubdomains(settings.stt_engine_work_domain)
        .then(setAvailableSubdomains)
        .catch(console.error);
    }
  }, [settings?.stt_engine_work_domain]);

  useEffect(() => {
    if (models.length === 0 || !settings) return;

    const downloadedModels = models.filter((m) => m.downloaded);
    const currentModelIsValid = downloadedModels.some((m) => m.name === settings.model);

    if (!currentModelIsValid && downloadedModels.length > 0) {
      updateSetting("model", downloadedModels[0].name).catch(console.error);
    }
  }, [models, settings?.model]);

  const handleModelChange = async (value: string) => {
    analytics.track(AnalyticsEvents.SETTING_CHANGED, { setting: "model", value });
    await updateSetting("model", value);
  };

  const handleWhisperLanguageChange = async (value: string) => {
    analytics.track(AnalyticsEvents.SETTING_CHANGED, { setting: "stt_engine_language", value });
    const lang = WHISPER_LANGUAGES.find((l) => l.code === value);
    await updateSetting("stt_engine_language", value);
    await updateSetting("stt_engine_initial_prompt", lang?.prompt ?? "");
  };

  const handleWhisperDomainChange = async (domain: string) => {
    analytics.track(AnalyticsEvents.SETTING_CHANGED, { setting: "stt_engine_work_domain", value: domain });
    await updateSetting("stt_engine_work_domain", domain);

    if (domain !== "general") {
      const subs = await settingsCommands.getAvailableSubdomains(domain);
      setAvailableSubdomains(subs);
      if (subs.includes("general")) {
        await updateSetting("stt_engine_work_subdomain", "general");
      }
    } else {
      setAvailableSubdomains([]);
      await updateSetting("stt_engine_work_subdomain", "general");
    }
  };

  const handleWhisperSubdomainChange = async (subdomain: string) => {
    analytics.track(AnalyticsEvents.SETTING_CHANGED, { setting: "stt_engine_work_subdomain", value: subdomain });
    await updateSetting("stt_engine_work_subdomain", subdomain);
  };

  const handleWhisperGlossaryChange = async (value: string) => {
    await updateSetting("stt_engine_user_glossary", value);
  };

  if (!settings) return null;

  const downloadedModels = models.filter((m) => m.downloaded);
  const selectedModel = models.find((m) => m.name === settings.model);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("model.active.title")}</CardTitle>
          <CardDescription>{t("model.active.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("model.active.model")}</Label>
            <Select
              value={downloadedModels.length === 0 ? "" : settings.model}
              onChange={(e) => handleModelChange(e.target.value)}
              options={downloadedModels.map((m) => ({
                value: m.name,
                label: m.display_name,
              }))}
              placeholder={
                downloadedModels.length === 0
                  ? t("model.active.noModels")
                  : undefined
              }
            />
            {downloadedModels.length === 0 && (
              <p className="text-xs text-amber-500">
                {t("model.active.noModels")}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>{t("model.active.language")}</Label>
            <Select
              value={settings.stt_engine_language ?? "auto"}
              onChange={(e) => handleWhisperLanguageChange(e.target.value)}
              options={WHISPER_LANGUAGES.map((lang) => ({
                value: lang.code,
                label: lang.label,
              }))}
            />
            <p className="text-xs text-muted-foreground">
              {t("model.active.languageDesc")}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("model.domain.title")}</CardTitle>
          <CardDescription>{t("model.domain.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("model.domain.domain")}</Label>
            <Select
              value={settings.stt_engine_work_domain ?? "general"}
              onChange={(e) => handleWhisperDomainChange(e.target.value)}
              options={[
                { value: "general", label: t("model.domain.domain_general") },
                { value: "it", label: t("model.domain.domain_it") },
                { value: "legal", label: t("model.domain.domain_legal") },
                { value: "medical", label: t("model.domain.domain_medical") },
              ]}
            />
          </div>

          {settings.stt_engine_work_domain !== "general" && availableSubdomains.length > 0 && (
            <div className="space-y-2">
              <Label>{t("model.domain.subdomain")}</Label>
              <Select
                value={settings.stt_engine_work_subdomain ?? "general"}
                onChange={(e) => handleWhisperSubdomainChange(e.target.value)}
                options={availableSubdomains.map((sub) => ({
                  value: sub,
                  label: t(
                    `model.domain.subdomain_${sub}`,
                    sub.charAt(0).toUpperCase() + sub.slice(1),
                  ),
                }))}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>{t("model.domain.glossary")}</Label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 scrollbar-overlay"
              value={settings.stt_engine_user_glossary ?? ""}
              onChange={(e) => handleWhisperGlossaryChange(e.target.value)}
              placeholder={t("model.domain.glossaryPlaceholder")}
            />
            <p className="text-xs text-muted-foreground">
              {t("model.domain.glossaryDesc")}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("model.available.title")}</CardTitle>
          <CardDescription>
            {t("model.available.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {models.map((m) => {
            const isDownloading = downloading.has(m.name);
            const progress = downloadProgress[m.name];
            return (
              <div
                key={m.name}
                className="flex items-center justify-between space-x-4 p-3 rounded-lg border border-border"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {m.display_name}
                    </span>
                    {m.downloaded && m.name === settings.model && (
                      <Check className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {m.size_mb}MB · {t("model.available.speed")}:{" "}
                    {m.speed_score}/10 · {t("model.available.accuracy")}:{" "}
                    {m.accuracy_score}/10
                  </div>
                  {isDownloading && (
                    <div className="mt-2">
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden border border-border">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${progress ?? 0}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {progress ?? 0}%
                      </span>
                    </div>
                  )}
                </div>
                <div className="ml-3 flex gap-2">
                  {m.downloaded ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-24"
                      onClick={() => onDelete(m.name)}
                      disabled={isDownloading}
                    >
                      {t("model.available.delete")}
                    </Button>
                  ) : isDownloading ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-24"
                      onClick={() => onCancel(m.name)}
                    >
                      {t("model.available.cancel")}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="w-24"
                      onClick={() => onDownload(m.name)}
                    >
                      {t("model.available.download")}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {selectedModel && (
        <Card>
          <CardHeader>
            <CardTitle>{t("model.info.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("model.info.model")}
                </span>
                <span>{selectedModel.display_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("model.info.size")}
                </span>
                <span>{selectedModel.size_mb}MB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("model.info.status")}
                </span>
                <span
                  className={
                    selectedModel.downloaded
                      ? "text-green-600"
                      : "text-amber-600"
                  }
                >
                  {selectedModel.downloaded
                    ? t("model.info.ready")
                    : t("model.info.notDownloaded")}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}