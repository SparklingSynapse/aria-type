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
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  modelCommands,
  type PolishModelInfo,
} from "@/lib/tauri";
import { analytics } from "@/lib/analytics";
import { AnalyticsEvents } from "@/lib/events";
import { useSettingsContext } from "@/contexts/SettingsContext";

interface PolishSectionProps {
  polishModels: PolishModelInfo[];
  selectedPolishModel: string;
  setSelectedPolishModel: (id: string) => void;
  polishDownloadingId: string | null;
  polishProgress: number | null;
  onDownload: (modelId: string) => void;
  onCancel: (modelId: string) => void;
  onDelete: (modelId: string) => void;
}

export function PolishSection({
  polishModels,
  selectedPolishModel,
  setSelectedPolishModel,
  polishDownloadingId,
  polishProgress,
  onDownload,
  onCancel,
  onDelete,
}: PolishSectionProps) {
  const { t } = useTranslation();
  const { settings, updateSetting } = useSettingsContext();
  const [polishTemplate, setPolishTemplate] = useState<string>("filler");

  useEffect(() => {
    if (polishModels.length === 0 || !settings) return;

    const downloadedModels = polishModels.filter((m) => m.downloaded);
    const isValid = downloadedModels.some((m) => m.id === selectedPolishModel);

    if (!isValid && downloadedModels.length > 0) {
      const first = downloadedModels[0].id;
      setSelectedPolishModel(first);
      updateSetting("polish_model", first).catch(console.error);
    }
  }, [polishModels, selectedPolishModel, settings]);

  const handlePolishToggle = async (checked: boolean) => {
    analytics.track(AnalyticsEvents.SETTING_CHANGED, { setting: "polish_enabled", value: String(checked) });
    await updateSetting("polish_enabled", checked);
  };

  const handlePolishSystemPromptChange = async (value: string) => {
    setPolishTemplate("custom");
    await updateSetting("polish_system_prompt", value);
  };

  const handlePolishTemplateChange = async (template: string) => {
    setPolishTemplate(template as "filler" | "formal" | "concise" | "agent" | "custom");
    analytics.track(AnalyticsEvents.SETTING_CHANGED, { setting: "polish_template", value: template });

    if (template !== "custom") {
      try {
        const prompt = await modelCommands.getPolishTemplatePrompt(template);
        await updateSetting("polish_system_prompt", prompt);
      } catch (err) {
        console.error("Failed to get template prompt:", err);
      }
    }
  };

  const handlePolishModelSelect = async (modelId: string) => {
    setSelectedPolishModel(modelId);
    analytics.track(AnalyticsEvents.SETTING_CHANGED, { setting: "polish_model", value: modelId });
    await updateSetting("polish_model", modelId);
  };

  if (!settings) return null;

  const downloadedPolishModels = polishModels.filter((m) => m.downloaded);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("model.polishSection.title")}</CardTitle>
          <CardDescription>{t("model.polishSection.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("model.polish.selectModel")}</Label>
            <Select
              value={
                downloadedPolishModels.length === 0 ? "" : selectedPolishModel
              }
              onChange={(e) => handlePolishModelSelect(e.target.value)}
              options={downloadedPolishModels.map((m) => ({
                value: m.id,
                label: `${m.name} · ${m.size}`,
              }))}
              placeholder={
                downloadedPolishModels.length === 0
                  ? t("model.active.noModels")
                  : undefined
              }
            />
            {downloadedPolishModels.length === 0 && (
              <p className="text-xs text-amber-500">
                {t("model.active.noModels")}
              </p>
            )}
          </div>

          <div className="space-y-3">
            {polishModels.map((m) => {
              const isDownloading = polishDownloadingId === m.id;
              return (
                <div
                  key={m.id}
                  className="flex items-center justify-between space-x-4 p-3 rounded-lg border border-border"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{m.name}</span>
                      {m.downloaded && m.id === selectedPolishModel && (
                        <Check className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {m.size}
                    </div>
                    {isDownloading && polishProgress !== null && (
                      <div className="mt-2">
                        <div className="h-1.5 bg-secondary rounded-full overflow-hidden border border-border">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${polishProgress}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {polishProgress}%
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="ml-3">
                    {m.downloaded ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-24"
                        onClick={() => onDelete(m.id)}
                        disabled={isDownloading}
                      >
                        {t("model.available.delete")}
                      </Button>
                    ) : isDownloading ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-24"
                        onClick={() => onCancel(m.id)}
                      >
                        {t("model.available.cancel")}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="w-24"
                        onClick={() => onDownload(m.id)}
                        disabled={polishDownloadingId !== null}
                      >
                        {t("model.available.download")}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between space-x-4">
            <div>
              <Label htmlFor="polish">{t("model.polish.enable")}</Label>
              <p className="text-xs text-muted-foreground">
                {t("model.polish.enableDesc")}
              </p>
            </div>
            <Switch
              id="polish"
              checked={settings.polish_enabled}
              onCheckedChange={handlePolishToggle}
              disabled={downloadedPolishModels.length === 0}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("model.polish.template")}</Label>
            <Select
              value={polishTemplate}
              onChange={(e) => handlePolishTemplateChange(e.target.value)}
              options={[
                { value: "filler", label: t("model.polish.templateFiller") },
                { value: "formal", label: t("model.polish.templateFormal") },
                { value: "concise", label: t("model.polish.templateConcise") },
                { value: "agent", label: t("model.polish.templateAgent") },
                { value: "custom", label: t("model.polish.templateCustom") },
              ]}
            />
            <p className="text-xs text-muted-foreground">
              {polishTemplate === "filler" && t("model.polish.templateFillerDesc")}
              {polishTemplate === "formal" && t("model.polish.templateFormalDesc")}
              {polishTemplate === "concise" && t("model.polish.templateConciseDesc")}
              {polishTemplate === "agent" && t("model.polish.templateAgentDesc")}
              {polishTemplate === "custom" && t("model.polish.templateCustomDesc")}
            </p>
          </div>

          {polishTemplate === "custom" && (
            <div className="space-y-2">
              <Label htmlFor="polish-system-prompt">
                {t("model.polish.prompt")}
              </Label>
              <textarea
                id="polish-system-prompt"
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 scrollbar-overlay"
                value={settings.polish_system_prompt}
                onChange={(e) =>
                  handlePolishSystemPromptChange(e.target.value)
                }
                placeholder={t("model.polish.promptPlaceholder")}
                disabled={downloadedPolishModels.length === 0}
              />
              <p className="text-xs text-muted-foreground">
                {t("model.polish.promptDesc")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}