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
import { Sparkles, Zap, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSettingsContext } from "@/contexts/SettingsContext";
import { SettingsPageLayout } from "./SettingsPageLayout";

export function CloudService() {
  const { t } = useTranslation();
  const { settings, updateSetting } = useSettingsContext();

  const handleCloudPolishChange = async (key: string, value: string | boolean) => {
    const currentConfig = settings?.cloud_polish ?? {
      enabled: false,
      provider_type: "anthropic",
      api_key: "",
      base_url: "",
      model: "",
      enable_thinking: false,
    };
    const newConfig = { ...currentConfig, [key]: value };
    await updateSetting("cloud_polish", newConfig);
  };

  if (!settings) return null;

  return (
    <SettingsPageLayout
      title={t("cloud.title")}
      description={t("cloud.description")}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>{t("cloud.polish.title")}</CardTitle>
              <CardDescription>{t("cloud.polish.description")}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between space-x-4">
            <div>
              <Label htmlFor="cloud-polish">{t("model.polish.cloud.enable")}</Label>
              <p className="text-xs text-muted-foreground">
                {t("model.polish.cloud.enableDesc")}
              </p>
            </div>
            <Switch
              id="cloud-polish"
              checked={settings.cloud_polish?.enabled ?? false}
              onCheckedChange={(checked) => handleCloudPolishChange("enabled", checked)}
            />
          </div>

          {settings.cloud_polish?.enabled && (
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="space-y-2">
                <Label>{t("model.polish.cloud.provider")}</Label>
                <Select
                  value={settings.cloud_polish?.provider_type ?? "anthropic"}
                  onChange={(e) => handleCloudPolishChange("provider_type", e.target.value)}
                  options={[
                    { value: "anthropic", label: t("model.polish.cloud.providerAnthropic") },
                    { value: "openai", label: t("model.polish.cloud.providerOpenAI") },
                    { value: "custom", label: t("model.polish.cloud.providerCustom") },
                  ]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cloud-api-key">{t("model.polish.cloud.apiKey")}</Label>
                <input
                  id="cloud-api-key"
                  type="password"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  value={settings.cloud_polish?.api_key ?? ""}
                  onChange={(e) => handleCloudPolishChange("api_key", e.target.value)}
                  placeholder={t("model.polish.cloud.apiKeyPlaceholder")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cloud-base-url">{t("model.polish.cloud.baseUrl")}</Label>
                <input
                  id="cloud-base-url"
                  type="text"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  value={settings.cloud_polish?.base_url ?? ""}
                  onChange={(e) => handleCloudPolishChange("base_url", e.target.value)}
                  placeholder={t("model.polish.cloud.baseUrlPlaceholder")}
                />
                <p className="text-xs text-muted-foreground">
                  {t("model.polish.cloud.baseUrlDesc")}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cloud-model">{t("model.polish.cloud.model")}</Label>
                <input
                  id="cloud-model"
                  type="text"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  value={settings.cloud_polish?.model ?? ""}
                  onChange={(e) => handleCloudPolishChange("model", e.target.value)}
                  placeholder={t("model.polish.cloud.modelPlaceholder")}
                />
              </div>

              <div className="flex items-center justify-between space-x-4 pt-4 border-t border-border">
                <div>
                  <Label htmlFor="cloud-thinking">{t("model.polish.cloud.enableThinking")}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t("model.polish.cloud.enableThinkingDesc")}
                  </p>
                </div>
                <Switch
                  id="cloud-thinking"
                  checked={settings.cloud_polish?.enable_thinking ?? false}
                  onCheckedChange={(checked) => handleCloudPolishChange("enable_thinking", checked)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {!settings.cloud_polish?.enabled && (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Zap className="h-5 w-5 text-green-500" />
                </div>
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Sparkles className="h-5 w-5 text-blue-500" />
                </div>
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <RefreshCw className="h-5 w-5 text-purple-500" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">{t("cloud.polish.feature1")}</p>
                <p className="text-sm font-medium">{t("cloud.polish.feature2")}</p>
                <p className="text-sm font-medium">{t("cloud.polish.feature3")}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("model.polish.cloud.enableDesc")}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </SettingsPageLayout>
  );
}