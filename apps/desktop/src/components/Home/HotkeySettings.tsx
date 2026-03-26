import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { analytics } from "@/lib/analytics";
import { AnalyticsEvents } from "@/lib/events";
import { useSettingsContext } from "@/contexts/SettingsContext";
import { HotkeyInput } from "@/components/ui/hotkey-input";
import { SettingsPageLayout } from "./SettingsPageLayout";
import { cn } from "@/lib/utils";

export function HotkeySettings() {
  const { t } = useTranslation();
  const { settings, updateSetting } = useSettingsContext();

  if (!settings) return null;

  const saveHotkey = async (value: string) => {
    analytics.track(AnalyticsEvents.SETTING_CHANGED, { setting: "hotkey", value });
    await updateSetting("hotkey", value);
  };

  const saveRecordingMode = async (value: string) => {
    analytics.track(AnalyticsEvents.SETTING_CHANGED, { setting: "recording_mode", value });
    await updateSetting("recording_mode", value);
  };

  const recordingModes = [
    { value: "hold", label: t("hotkey.recording.modeHold") },
    { value: "toggle", label: t("hotkey.recording.modeToggle") },
  ];

  return (
    <SettingsPageLayout
      title={t("hotkey.title")}
      description={t("hotkey.description")}
    >
      <Card>
        <CardHeader>
          <CardTitle>{t("hotkey.recording.title")}</CardTitle>
          <CardDescription>{t("hotkey.recording.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>{t("hotkey.recording.globalHotkey")}</Label>
            <HotkeyInput
              value={settings.hotkey}
              onChange={saveHotkey}
              placeholder={t("hotkey.recording.pressKeys")}
              className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background"
            />
            <p className="text-xs text-muted-foreground">
              {t("hotkey.recording.hint")}
            </p>
          </div>

          <div className="space-y-4">
            <div className="text-sm font-medium">{t("hotkey.recording.modeTitle")}</div>
            <div className="inline-flex h-10 items-center rounded-lg bg-secondary p-1 text-muted-foreground">
              {recordingModes.map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => saveRecordingMode(mode.value)}
                  className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    settings.recording_mode === mode.value
                      ? "bg-background text-foreground shadow-sm"
                      : "hover:text-foreground"
                  )}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {t("hotkey.recording.modeDesc")}
          </p>
        </CardContent>
      </Card>
    </SettingsPageLayout>
  );
}
