import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  settingsCommands,
  modelCommands,
  events,
  type ModelInfo,
  type PolishModelInfo,
} from "@/lib/tauri";
import { useSettingsContext } from "@/contexts/SettingsContext";
import { SettingsPageLayout } from "./SettingsPageLayout";
import { confirm } from "@/components/ui/confirm";
import { VoiceInputSection } from "./model/VoiceInputSection";
import { PolishSection } from "./model/PolishSection";
import { PerformanceSection } from "./model/PerformanceSection";

export function ModelSettings() {
  const { t } = useTranslation();
  const { settings } = useSettingsContext();
  const [activeTab, setActiveTab] = useState<"voice" | "polish" | "performance">("voice");

  const [models, setModels] = useState<ModelInfo[]>([]);
  const [downloading, setDownloading] = useState<Set<string>>(new Set());
  const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({});
  
  const [polishModels, setPolishModels] = useState<PolishModelInfo[]>([]);
  const [selectedPolishModel, setSelectedPolishModel] = useState<string>("");
  const [polishDownloadingId, setPolishDownloadingId] = useState<string | null>(null);
  const [polishProgress, setPolishProgress] = useState<number | null>(null);

  const loadModels = useCallback(async () => {
    try {
      const list = await modelCommands.getModels();
      setModels(list);
    } catch (err) {
      console.error("Failed to load models:", err);
    }
  }, []);

  const loadPolishModels = useCallback(async () => {
    try {
      const models = await modelCommands.getPolishModels();
      setPolishModels(models);
    } catch (err) {
      console.error("Failed to load polish models:", err);
    }
  }, []);

  useEffect(() => {
    if (!settings) return;

    loadModels();

    loadPolishModels().then(() => {
      if (settings.polish_model) setSelectedPolishModel(settings.polish_model);
    });
  }, [settings === null, loadModels, loadPolishModels]);

  useEffect(() => {
    let unlistenComplete: (() => void) | undefined;
    let unlistenCancelled: (() => void) | undefined;
    let unlistenProgress: (() => void) | undefined;
    let unlistenDeleted: (() => void) | undefined;
    let unlistenPolishProgress: (() => void) | undefined;
    let unlistenPolishComplete: (() => void) | undefined;
    let unlistenPolishCancelled: (() => void) | undefined;
    let unlistenPolishDeleted: (() => void) | undefined;

    const setup = async () => {
      unlistenComplete = await events.onModelDownloadComplete((model) => {
        setDownloading((prev) => {
          const next = new Set(prev);
          next.delete(model);
          return next;
        });
        setDownloadProgress((prev) => {
          const next = { ...prev };
          delete next[model];
          return next;
        });
        loadModels();
      });

      unlistenCancelled = await events.onModelDownloadCancelled((model) => {
        setDownloading((prev) => {
          const next = new Set(prev);
          next.delete(model);
          return next;
        });
        setDownloadProgress((prev) => {
          const next = { ...prev };
          delete next[model];
          return next;
        });
      });

      unlistenProgress = await events.onModelDownloadProgress((data) => {
        setDownloadProgress((prev) => ({
          ...prev,
          [data.model]: data.progress,
        }));
      });

      unlistenDeleted = await events.onModelDeleted(() => {
        loadModels();
      });

      unlistenPolishProgress = await events.onPolishModelDownloadProgress(
        (data) => {
          if (data.model_id === polishDownloadingId) {
            setPolishProgress(data.progress);
          }
        },
      );

      unlistenPolishComplete = await events.onPolishModelDownloadComplete(
        (modelId) => {
          if (modelId === polishDownloadingId) {
            setPolishDownloadingId(null);
            setPolishProgress(null);
            loadPolishModels();
            setSelectedPolishModel((prev) => {
              if (!prev) {
                settingsCommands
                  .updateSettings("polish_model", modelId)
                  .catch(console.error);
                return modelId;
              }
              return prev;
            });
          }
        },
      );

      unlistenPolishCancelled = await events.onPolishModelDownloadCancelled(
        (modelId) => {
          if (modelId === polishDownloadingId) {
            setPolishDownloadingId(null);
            setPolishProgress(null);
          }
        },
      );

      unlistenPolishDeleted = await events.onPolishModelDeleted(() => {
        loadPolishModels();
      });
    };
    setup();

    return () => {
      unlistenComplete?.();
      unlistenCancelled?.();
      unlistenProgress?.();
      unlistenDeleted?.();
      unlistenPolishProgress?.();
      unlistenPolishComplete?.();
      unlistenPolishCancelled?.();
      unlistenPolishDeleted?.();
    };
  }, [loadModels, loadPolishModels, polishDownloadingId]);

  const handleDownload = async (modelName: string) => {
    if (downloading.has(modelName)) return;
    setDownloading((prev) => new Set(prev).add(modelName));
    try {
      await modelCommands.downloadModel(modelName);
    } catch (err) {
      console.error("Failed to download model:", err);
      setDownloading((prev) => {
        const next = new Set(prev);
        next.delete(modelName);
        return next;
      });
      setDownloadProgress((prev) => {
        const next = { ...prev };
        delete next[modelName];
        return next;
      });
    }
  };

  const handleCancel = async (modelName: string) => {
    try {
      await modelCommands.cancelDownload(modelName);
    } catch (err) {
      console.error("Failed to cancel download:", err);
    }
  };

  const handleDelete = async (modelName: string) => {
    const confirmed = await confirm({
      title: "Delete Model",
      description: `Are you sure you want to delete the "${modelName}" model? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "danger",
    });
    if (!confirmed) return;

    try {
      await modelCommands.deleteModel(modelName);
      await loadModels();
    } catch (err) {
      console.error("Failed to delete model:", err);
    }
  };

  const handlePolishDownload = async (modelId: string) => {
    setPolishDownloadingId(modelId);
    setPolishProgress(0);
    try {
      await modelCommands.downloadPolishModelById(modelId);
    } catch (err) {
      console.error("Failed to download polish model:", err);
      setPolishDownloadingId(null);
      setPolishProgress(null);
    }
  };

  const handlePolishCancel = async (modelId: string) => {
    try {
      await modelCommands.cancelPolishDownload(modelId);
    } catch (err) {
      console.error("Failed to cancel polish download:", err);
    }
  };

  const handlePolishDelete = async (modelId: string) => {
    const confirmed = await confirm({
      title: "Delete Polish Model",
      description: `Are you sure you want to delete this polish model? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "danger",
    });
    if (!confirmed) return;

    try {
      await modelCommands.deletePolishModelById(modelId);
      setPolishModels((prev) =>
        prev.map((m) => (m.id === modelId ? { ...m, downloaded: false } : m)),
      );
      if (selectedPolishModel === modelId) {
        setSelectedPolishModel("");
      }
    } catch (err) {
      console.error("Failed to delete polish model:", err);
    }
  };

  if (!settings) return null;

  return (
    <SettingsPageLayout
      title={t("model.title")}
      description={t("model.description")}
    >
      <div className="flex space-x-1 bg-secondary/50 p-1 rounded-lg w-fit mb-6">
        <button
          onClick={() => setActiveTab("voice")}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === "voice"
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {t("model.tabs.voice", "Voice Input")}
        </button>
        <button
          onClick={() => setActiveTab("polish")}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === "polish"
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {t("model.tabs.polish", "Polish")}
        </button>
        <button
          onClick={() => setActiveTab("performance")}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === "performance"
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {t("model.tabs.performance", "Performance")}
        </button>
      </div>

      <div className="mt-4">
        {activeTab === "voice" && (
          <VoiceInputSection
            models={models}
            downloading={downloading}
            downloadProgress={downloadProgress}
            onDownload={handleDownload}
            onCancel={handleCancel}
            onDelete={handleDelete}
          />
        )}
        
        {activeTab === "polish" && (
          <PolishSection
            polishModels={polishModels}
            selectedPolishModel={selectedPolishModel}
            setSelectedPolishModel={setSelectedPolishModel}
            polishDownloadingId={polishDownloadingId}
            polishProgress={polishProgress}
            onDownload={handlePolishDownload}
            onCancel={handlePolishCancel}
            onDelete={handlePolishDelete}
          />
        )}

        {activeTab === "performance" && (
          <PerformanceSection />
        )}
      </div>
    </SettingsPageLayout>
  );
}
