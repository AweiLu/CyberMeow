#  賽博喵的奇幻冒險 | Cyber Cat's Fantasy Adventure

<div align="center">

**一款充滿賽博朋克風格的 2D 橫向卷軸動作遊戲**

*在霓虹閃爍的數位世界中，扮演一隻賽博強化貓咪，對抗無盡的敵人與強大的 BOSS*

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)

</div>

---

## 📖 目錄

- [遊戲簡介](#-遊戲簡介)
- [核心特色](#-核心特色)
- [遊戲玩法](#-遊戲玩法)
- [技術特點](#-技術特點)
- [系統需求](#-系統需求)
- [快速開始](#-快速開始)
- [遊戲控制](#-遊戲控制)
- [遊戲機制](#-遊戲機制)
- [開發技術棧](#-開發技術棧)
- [專案結構](#-專案結構)
- [開發者說明](#-開發者說明)
- [授權資訊](#-授權資訊)

---

## 🎮 遊戲簡介

**賽博喵的奇幻冒險**是一款結合賽博朋克美學與高強度動作戰鬥的橫向卷軸遊戲。玩家將扮演一隻經過賽博強化的貓咪，在無盡的數位戰場上與各種敵人和 BOSS 戰鬥。

遊戲採用**程序生成式關卡**和**無盡生存模式**，每一次遊玩都是全新的挑戰。隨著時間推移，敵人會變得更加強大，而玩家需要運用靈活的操作和戰術思維來生存得更久。

### 🌟 遊戲亮點

- 🎨 **純粹的賽博朋克視覺風格**：霓虹色彩、粒子特效、動態光影
- 🎵 **復古街機風格 BGM**：三首原創芯片音樂，自動隨機輪播
- ⚔️ **多樣化的 BOSS 戰鬥**：4 種不同類型的 BOSS，每種有 3 個攻擊模式
- 🔄 **動態難度系統**：每 30 秒增加一次難度（最多 5 級）
- ⚡ **流暢的戰鬥體驗**：幀率獨立的遊戲邏輯，60 FPS 穩定運行
- 🎯 **精密的打擊感**：粒子特效、屏幕震動、慢動作效果

---

## 🌈 核心特色

### 戰鬥系統
- **基礎攻擊**：快速的貓爪攻擊，每次擊中敵人回復能量
- **閃避系統**：
  - 冷卻時間：3.5 秒
  - 無敵時間：1.5 秒
  - 效果：2 倍移動速度持續 0.5 秒
  - 體力消耗：40
- **二段跳躍**：消耗 30 體力進行空中二段跳
- **量子毀滅砲**（大招）：
  - 需擊中敵人 8 次充滿能量
  - 發射大範圍爆炸性彈幕
  - 能量滿時右側顯示「ULTIMATE READY」

### 敵人系統
- **普通敵人類型**：
  - WALKER（步行者）：基礎近戰敵人
  - FLYER（飛行者）：空中機動敵人
  - TURRET（炮塔）：遠程射擊，發射頻率慢但穩定
  - DASHER（衝鋒者）：高速移動的危險敵人
  - ELITE（精英）：強化型敵人，HP 較高
  - HEAVY（重裝）：血量最厚的坦克型敵人

- **BOSS 系統**（4 種類型，每種有 3 個攻擊模式）：
  1. **淵核支配者（ASSAULT）**：空中戰鬥專家
     - 模式 1：9 連發擴散彈幕
     - 模式 2：快速三連射
     - 模式 3：三發追蹤導彈
  
  2. **天罰轟炸者（BOMBER）**：地毯式轟炸
     - 模式 1：5 發地毯式炸彈
     - 模式 2：大型集束炸彈
     - 模式 3：對角線炸彈雨
  
  3. **電馭魔王（TANK）**：重裝火力壓制
     - 模式 1：單發重型炮彈
     - 模式 2：5 連發霰彈
     - 模式 3：雙向地面震波
  
  4. **終端執行者（SPEED）**：高機動性攻擊
     - 模式 1：環繞速射
     - 模式 2：瞬移爆發射擊
     - 模式 3：側移精準狙擊

### 道具系統
- **能量球（藍色）**：回復 30% 能量，加速大招充能
- **生命包（紅色）**：回復 30% 生命值
- **護盾（青色）**：提供一次傷害抵擋
- **神經加速藥劑（紫色）**：攻速和移動速度大幅提升 10 秒

### 環境元素
- **彈簧裝置（S）**：提供超高彈跳力
- **電磁地刺**：接觸即受到傷害

---

## 🎮 遊戲玩法

### 目標
在無盡的數位戰場上生存得越久越好，擊敗盡可能多的 BOSS，挑戰你的極限！

### 遊戲流程
1. **開始連結**：進入遊戲主選單，點擊 "Let's Go!" 開始
2. **戰鬥準備**：15 秒後第一個 BOSS 出現
3. **無盡戰鬥**：
   - 擊敗敵人和 BOSS 獲得分數
   - 收集道具強化自身
   - 應對每 30 秒增加的難度
4. **極限挑戰**：看你能生存多久，擊敗多少 BOSS！

### 電馭對話系統
戰鬥過程中，主角貓與 BOSS 會進行賽博風格的互動對話：
- **玩家台詞**（青色）：
  - "你的數據已經過時了！"
  - "連結中斷，拜拜！"
  - "這就是量子速度！"
  - 等超過 15 種台詞

- **BOSS 台詞**（紅色）：
  - "系統入侵失敗。"
  - "第六代防火牆啟動中。"
  - "偵測到威脅等級上升。"
  - 等超過 15 種台詞

對話每 7-9 秒隨機出現，增加戰鬥氛圍！

---

## 🕹️ 遊戲控制

### 移動控制
| 按鍵 | 功能 |
|------|------|
| `←` / `A` | 向左移動 |
| `→` / `D` | 向右移動 |
| `↑` / `W` / `Space` | 跳躍 / 二段跳 |

### 戰鬥操作
| 按鍵 | 功能 | 說明 |
|------|------|------|
| `左鍵` / `K` | 貓爪攻擊 | 冷卻時間 1.2 秒，擊中回復能量 |
| `Z` | 量子毀滅砲 | 能量滿時可使用，大範圍爆炸傷害 |
| `Shift` | 閃避 | 冷卻 3.5 秒，無敵 1.5 秒，2 倍速 0.5 秒 |

### 系統控制
| 按鍵 | 功能 |
|------|------|
| `ESC` | 暫停 / 查看說明 |

---

## 🎯 遊戲機制

### 體力系統
- **最大體力**：100
- **自動回復**：每幀 0.15（約 9 點/秒）
- **消耗**：
  - 閃避：40 體力
  - 二段跳：30 體力
- **無限體力狀態**：拾取紫色藥劑時，體力無限且自動補滿

### 能量系統
- **充能方式**：每次攻擊擊中敵人獲得 12.5 能量
- **充滿條件**：擊中 8 次敵人
- **大招消耗**：100 能量（全部消耗）

### 難度階梯
- **初始難度**：Lv 0
- **增長週期**：每 30 秒增加 1 級
- **最高難度**：Lv 5（150 秒後達到）
- **難度效果**：
  - Lv 1：敵人傷害 +20%
  - Lv 2：敵人傷害 +40%
  - Lv 3：敵人傷害 +60%
  - Lv 4：敵人傷害 +80%
  - Lv 5：敵人傷害 +100%（最高）

### 敵人生成機制
- **生成速率**：
  - 普通戰鬥：0.375% 每幀
  - BOSS 戰鬥：0.125% 每幀（減少壓力）
- **數量上限**：場景中最多同時存在 10 個敵人
- **BOSS 週期**：每固定時間生成一個隨機類型的 BOSS

### 受傷保護
- **無敵時間**：受傷後 2.5 秒無敵（150 幀）
- **視覺提示**：受傷期間角色閃爍紅色
- **護盾機制**：擁有護盾時，第一次傷害被抵擋，獲得 0.5 秒無敵

---

## 💻 技術特點

### 核心技術實現

#### 幀率獨立遊戲邏輯
```typescript
// 確保在不同幀率下遊戲速度一致
const deltaTime = (currentTime - lastFrameTime) / 1000;
const frameMultiplier = deltaTime * 60; // 基準 60 FPS
```

#### 粒子系統
- 攻擊命中粒子效果
- 跳躍塵埃粒子
- BOSS 死亡爆炸粒子
- 動態顏色與生命週期管理

#### 音效系統
- **Web Audio API** 實現的完整合成引擎
- 三首原創 8-bit 風格 BGM
- 動態音效（跳躍、攻擊、爆炸等）
- BGM 自動隨機輪播，每首循環 3 次後切換

#### 碰撞檢測
- AABB（軸對齊邊界框）碰撞檢測
- 優化的範圍剔除
- 精確的攻擊判定範圍

#### 視覺效果
- 屏幕震動系統（分級：小怪、BOSS、擊殺）
- 數位毛刺效果
- 霓虹光暈與陰影
- 浮動傷害數字與對話氣泡
- 攻擊特效動畫

---

## 🖥️ 系統需求

### 最低配置
- **瀏覽器**：Chrome 90+、Firefox 88+、Edge 90+、Safari 14+
- **記憶體**：4 GB RAM
- **顯示器**：1280x720 解析度
- **JavaScript**：必須啟用

### 建議配置
- **瀏覽器**：最新版 Chrome 或 Edge
- **記憶體**：8 GB RAM
- **顯示器**：1920x1080 或更高解析度
- **硬體加速**：啟用 GPU 加速

---

## 🚀 快速開始
- **vercel部署遊玩網址**：https://cybermeow.vercel.app/

### 本利安裝與運行

```bash
# 1. 克隆專案（如果從 Git 倉庫）
git clone <repository-url>
cd 賽博喵的奇幻冒險

# 2. 安裝依賴
npm install

# 3. 啟動開發伺服器
npm run dev

# 4. 打開瀏覽器訪問
# 通常是 http://localhost:3000
```

### 構建生產版本

```bash
# 構建優化版本
npm run build

# 預覽構建結果
npm run preview
```

---

## 🛠️ 開發技術棧

### 前端框架
- **React 18** - UI 框架
- **TypeScript** - 類型安全的開發體驗
- **Vite** - 極速構建工具

### 樣式方案
- **Tailwind CSS** - 實用優先的 CSS 框架
- **原生 Canvas API** - 遊戲渲染引擎

### 核心庫
- **@google/generative-ai** - AI 生成 BOSS 名稱（可選功能）

### 開發工具
- **ESLint** - 代碼質量檢查
- **PostCSS** - CSS 處理
- **Autoprefixer** - CSS 前綴自動添加

---

## 📁 專案結構

```
賽博喵的奇幻冒險/
├── index.html              # HTML 入口
├── index.tsx              # 遊戲主程式（單一檔案架構）
├── index.css              # 全局樣式
├── package.json           # 專案配置
├── tsconfig.json          # TypeScript 配置
├── vite.config.ts         # Vite 構建配置
├── tailwind.config.js     # Tailwind CSS 配置
├── postcss.config.js      # PostCSS 配置
└── README.md             # 專案說明（本文件）
```

### 代碼架構說明

遊戲採用**單一檔案架構**（`index.tsx`），包含：

1. **常量定義區** (Line 1-50)
   - 畫布尺寸、世界參數
   - 顏色配置
   - 物理參數（重力、跳躍力、速度等）

2. **音效系統** (Line 51-450)
   - `SoundSynthesizer` 類
   - BGM 音軌數據
   - 音效播放邏輯

3. **遊戲實體類** (Line 451-1550)
   - `FloatingText` - 浮動文字
   - `Platform` - 平台
   - `InteractiveObject` - 互動物件
   - `Particle` - 粒子效果
   - `VisualEffect` - 視覺特效
   - `Explosion` - 爆炸效果
   - `Item` - 道具
   - `Projectile` - 彈道
   - `BackgroundBuilding` - 背景建築
   - `Player` - 玩家角色
   - `Enemy` - 敵人與 BOSS

4. **React 組件** (Line 1551-2837)
   - `CyberpunkGame` - 主遊戲組件
   - 遊戲狀態管理
   - 遊戲循環實現
   - UI 渲染邏輯

---

## 👨‍💻 開發者說明

### 添加新的敵人類型

在 `Enemy` 類的構造函數中添加新類型：

```typescript
else if (r < YOUR_THRESHOLD) {
    this.type = 'YOUR_TYPE';
    this.color = YOUR_COLOR;
    this.hp = YOUR_HP * hpScale;
    // 其他屬性...
}
```

然後在 `update` 方法中實現行為邏輯。

### 調整遊戲難度

修改以下常量（位於檔案開頭）：

```typescript
const GRAVITY_DEFAULT = 1.5;        // 重力
const JUMP_FORCE_DEFAULT = -20;     // 跳躍力
const SPEED_DEFAULT = 6;            // 移動速度
const STAMINA_REGEN = 0.15;         // 體力回復速度
```

### 修改 BOSS 行為

BOSS 行為位於 `Enemy` 類的 `update` 方法中。每個 BOSS 有 3 個攻擊模式（`attackMode` 0-2），可以修改：
- 攻擊間隔
- 彈道速度
- 移動模式
- 特殊效果

### 性能優化建議

1. **粒子系統優化**：限制同時存在的粒子數量
2. **範圍剔除**：不在視野內的實體跳過更新
3. **對象池**：重用 Projectile 和 Particle 對象
4. **Canvas 優化**：使用離屏 Canvas 預渲染靜態元素

---

## 🎨 遊戲設計理念

### 視覺設計
- **賽博朋克美學**：霓虹色、深色背景、數位感
- **粒子效果**：強化打擊感與動態感
- **UI 設計**：斜角邊框、發光效果、科技感字體

### 音效設計
- **復古街機風格**：8-bit 芯片音樂
- **三首 BGM**：
  - Track 1: 經典合成波風格
  - Track 2: 復古街機英雄風
  - Track 3: 街機戰士風
- **動態音效**：Web Audio API 實時合成

### 平衡性設計
- **難度曲線**：從簡單到困難的漸進式挑戰
- **風險與回報**：高風險操作獲得更多能量
- **策略深度**：體力、能量、閃避的資源管理
- **BOSS 多樣性**：不同 BOSS 需要不同應對策略

---

## 📊 遊戲數據

### 統計追蹤
- **擊殺 BOSS 數**：右上角顯示
- **生存時間**：右上角顯示（分:秒格式）
- **當前難度等級**：以浮動文字顯示升級

### 遊戲結束
死亡後顯示：
- 總生存時間
- 擊敗的 BOSS 數量
- 隨機勵志名言

---

## 🔧 故障排除

### 常見問題

**Q: 遊戲畫面卡頓？**
A: 
- 關閉其他佔用 GPU 的應用程式
- 確保瀏覽器硬體加速已啟用
- 降低瀏覽器縮放比例

**Q: 音效無法播放？**
A: 
- 確認瀏覽器允許自動播放音訊
- 點擊畫面任意位置以啟用音訊上下文
- 檢查瀏覽器音量設置

**Q: 遊戲速度異常（太快或太慢）？**
A: 
- 這已通過幀率獨立邏輯修復
- 如仍有問題，請更新瀏覽器到最新版本

**Q: BOSS 無法攻擊到我？**
A: 
- 已修復，所有彈道現在有足夠射程
- 確保使用最新版本代碼

---

## 🎯 未來發展方向

### 計劃中的功能
- 🔄 **技能升級系統**：擊敗 BOSS 後選擇永久升級
- 🏗️ **動態環境**：移動平台、崩塌地板、雷射陷阱
- 📈 **階段系統**：每 3 個 BOSS 一個階段，不同視覺主題
- 🏆 **成就系統**：追蹤玩家里程碑
- 💾 **本地存檔**：保存最高分數和解鎖內容
- 🎨 **皮膚系統**：不同的角色外觀
- 🌐 **多語言支持**：英文、日文等

### 社區貢獻
歡迎提交 Issue 和 Pull Request！

---

## 📝 更新日誌

### v1.0.0 (2025-01)
- ✨ 完整的遊戲核心機制
- 🎮 4 種 BOSS，每種 3 個攻擊模式
- 🎵 三首原創 BGM
- ⚖️ 完善的戰鬥平衡
- 🐛 修復所有已知 Bug

---

## 👥 製作團隊

**開發者**：AweiLu  
**項目類型**：個人遊戲開發專案  
**開發時間**：2025 年  
**技術顧問**：Google Gemini AI

---

## 📄 授權資訊

本專案採用 **MIT License** 授權。

### MIT License

```
Copyright (c) 2025 AweiLu

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 致謝

- **React 團隊** - 提供優秀的 UI 框架
- **Vite 團隊** - 提供極速的構建工具
- **Tailwind CSS** - 提供便捷的樣式方案
- **所有測試玩家** - 提供寶貴的反饋意見

---

## 📞 聯絡方式

如有任何問題或建議，歡迎通過以下方式聯繫：

- **GitHub Issues**: [提交問題](https://github.com/AweiLu/--------/issues)
- **Email**: [b2004931124@gmail.com]

---

<div align="center">

**🎮 享受遊戲，挑戰極限！**

開發於2025/11/24
Made with ❤️ by 陳政緯 

*在賽博世界中書寫屬於你的傳奇*
</div>
