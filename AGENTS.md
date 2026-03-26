# UI 视觉风格标准 (UI Visual Style Guide)

## Tabs 标签页 (Segmented Control)

在应用中，Tabs（特别是分段控制器形式的 Tabs）应遵循以下基于 Tailwind CSS 的视觉风格标准，以保持与当前产品 UI 的统一。

### 1. 容器样式 (Container)
- **类名**: `inline-flex h-10 items-center justify-center rounded-lg bg-secondary p-1 text-muted-foreground`
- **说明**: 
  - 使用 `bg-secondary` 作为背景色，带有适当的内边距 (`p-1`)
  - 整体圆角为 `rounded-lg`，高度为 `h-10`

### 2. 选项卡样式 (Tab Item / Trigger)
- **基础类名**: `inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50`
- **说明**:
  - 圆角为 `rounded-md`（比容器的 `rounded-lg` 小一级，保持视觉嵌套协调）
  - 字体为 `text-sm font-medium`，带有 `transition-all` 以实现平滑状态切换

### 3. 状态样式 (States)
通过 `cn()` 动态组合以下状态：
- **激活状态 (Active)**: `bg-background text-foreground shadow-sm`
  - 激活时背景变为白色/深色卡片背景（依赖 `bg-background`），字体高亮，并带有轻微阴影凸显层级。
- **未激活/悬浮状态 (Inactive / Hover)**: `hover:text-foreground`
  - 未激活时默认使用容器的 `text-muted-foreground`，悬浮时文字高亮。

### 示例代码

```tsx
import { cn } from "@/lib/utils";

<div className="inline-flex h-10 items-center justify-center rounded-lg bg-secondary p-1 text-muted-foreground">
  <button
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      isActive
        ? "bg-background text-foreground shadow-sm"
        : "hover:text-foreground"
    )}
  >
    Tab 1
  </button>
  <button
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      !isActive
        ? "bg-background text-foreground shadow-sm"
        : "hover:text-foreground"
    )}
  >
    Tab 2
  </button>
</div>
```
