# 功能与 UX 审查报告（2026-08-26）

> 方法：三路并行代码审查（Today 语音打卡流程 / Pattern Card + 行动闭环 / 周报 + 全局 UX），全部发现均引用代码为证，对照 docs/ 下的规格契约（mvp-data-contract.md、action-system-v1.md、today-v1-freeze.md、product/rora-product-design.md、product/action-reward-system.md）。
> 共 36 条原始发现，去重合并后 30 条。按严重度分级。

---

## P0 — 安全与信任（GTM 前必须修，每条都可能直接伤害用户或摧毁信任）

### S1. 中文危机语句在本地安全路径完全漏检
- `src/trace/dataFoundation.ts:317-346`：`selfHarmKeywords` 只有英文（'suicide'、'kill myself' 等）。服务端 OpenAI moderation 可覆盖中文，但 `App.tsx:3966` 在 AI 响应缺失时落回本地英文检测——**中文用户写"想死"会被判 low，照常出卡片出行动推荐**。同表还影响行动路由（`actionRecommendation.ts:99` 的 `transcript.includes('worry')` 对中文永假）。
- 修复：关键词表补中文危机词；本地路径无 AI safety 时按保守级别处理。

### S2. 高危（resources_panel）时没有任何真实求助资源
- `App.tsx:733-741`：高危只显示一句 "contact local emergency services or someone you trust"，无热线号码、无可点链接。禁卡片禁行动的降级已做，但资源引导缺失。
- 修复：加入本地化热线列表（中国心理援助热线等，可点拨打）。

### S3. "What helped before" 用硬编码假数据冒充用户历史
- `App.tsx:543-576` + `3469-3477`：真实记录不足 3 条时用假行补齐（'2-min Body Scan — Helped — Today'）。新用户看到从未发生过的"历史"——这正是研究里"用户最怕 AI 幻觉自己的记录"的直接触发器。
- 修复：删除 fallback 假行，不足时展示空态。

### S4. AI 提取失败后用户的话永远存不下来（违反数据契约）
- `App.tsx:3846-3873` + `4643-4669`：error 态只有 Cancel / Try again，没有契约要求的"仅保存转写"（`mvp-data-contract.md:81-82`："AI failure must not destroy the user's record"）。错误文案自己都写着 "save a few words manually"，但按钮不存在。
- 修复：error 态加"仅保存我的话"按钮（`submitTranscript` 已有 null-response fallback 分支，接上即可）。

---

## P1 — 核心闭环断点（产品差异化"洞察→行动→验证"的断裂处）

### C1. 完成反馈缺 "did_not_help" 选项，"Not today" 被错记为跳过
- `App.tsx:586-591` + `3748-3761`：反馈四选项里没有"没帮助"；用户做完行动想说没用，只能选 "Not today"，而它被记为 `completionStatus: 'skipped'`——**做了被记成没做**。整个 did_not_help 分支从 UI 上永远不可达。
- 修复：补"没什么用"→ `did_not_help`；"Not today" 只在未开始/中途退出时提供。

### C2. 行动效果回访完全未实现（三轮报告确认的承重墙）
- 全仓无任何"行动完成后 loop 是否复现"的比较逻辑。差异化卖点的后半段（"上次散步后这个循环没再出现"）不存在。
- 修复：check-in 结果生成时对比 `ActionMemoryEntry.completedAt` 之后同 chainKey 的复现间隔，产出一句归因文案。

### C3. did_not_help / too_much 降权未实现，"AI 不听劝"风险
- `src/actions/actionRecommendation.ts:62-85`：评分只算 `helped*2 + helped_a_little`，忽略负向计数。**1 次 helped + 3 次 did_not_help 的行动仍会以"上次这个有效"身份置顶**——踩中品类第一弃用原因。
- 修复：评分改 `helped*2 + helped_a_little - too_much*2`；did_not_help 占多数时排除出 memory_helped。

### C4. 行动推荐是"直接展示式"而非"递上式"，不可拒绝
- `App.tsx:4200-4222`、`1855-1898`：推荐默认全展开，无收起、无"今天不要"；拒绝必须走完 Start→Complete 全流程。与研究结论（递上式、明确可拒绝、拒绝不追问）相反。
- 修复：默认折叠为一行"有一个可以试的小实验，想看吗？"，卡上加"今天不要"（记 skip 不追问）。

### C5. Pattern Card 无证据链露出
- `App.tsx:2373`、`842-849`：证据只有一行 "Seen in N saved traces"，不可点开，无日期无原话。用户被要求确认"这是你的循环"却看不到依据——feels_right 变盲投。`getTranscriptExcerpt`（`App.tsx:595`）已存在但未用于卡片。
- 修复：加"基于这几条记录"展开区，列日期 + 用户确认过的转写摘录。

### C6. 硬拒绝后下一条 trace 就复活卡片再次追问
- `src/trace/dataFoundation.ts:1086-1107`：cooldown 仅在无新证据时成立，任一新证据即转 watching 且可再问。用户说"没有这个循环"，第二天就可能再被问——违反"拒绝后不追问"。
- 修复：`not_a_pattern` 的 cooldown 要求累计 ≥3 条新证据/2 天或固定冷却期。

### C7. 推荐理由夸大疗效
- `src/trace/dataFoundation.ts:1469-1474`："Rora has seen X help this loop N times" 的 N 是全部完成数（含没帮助/too_much）。1 helped + 1 did_not_help 显示"帮助过 2 次"。"Best signal:" 是系统日志腔，违反 voice 规则。
- 修复：N 改正向 outcome 计数；文案改自然语句。

---

## P2 — 打卡流程断点（入口体验，直接决定"30 秒打卡"卖点成立与否）

### T1. "Edit" 编辑转写进入死局界面
- `App.tsx:3776-3786` + `4454-4572`：`openEditTranscript` 把状态归零到 `'idle'`，但编辑框/Save/Cancel 只在 `'ready' || 'unsupported'` 渲染。点 Edit 后唯一出路是误触停止按钮触发重录覆盖原转写。
- 修复：`openEditTranscript` 置 `'ready'` 而非经 `resetRecordedAudio` 归零。

### T2. 转写/提取请求无超时，进度页无出口
- `App.tsx:813-836`、`aiTraceExtraction.ts:459-481`（无 AbortController）+ `App.tsx:4575-4599`（进度页无任何按钮）。服务器挂起 = 用户永久卡死，只能刷新（进而触发 T5 丢草稿）。
- 修复：fetch 加 15-30s 超时进 error 态；进度页加 Cancel。

### T3. AI 端点硬编码 `http://localhost:8084`
- `App.tsx:820`、`aiTraceExtraction.ts:459/488/561`。任何非本机环境转写/提取/周报改写全挂；HTTPS 下被 mixed-content 拦截后进入静默失败。
- 修复：环境变量/相对路径注入 base URL。

### T4. 停止录音后转写失败是静默的
- `App.tsx:3402-3416`（catch 无提示）、`3300-3302`（blob 失败直接 return）。Firefox 等无 Web Speech 的浏览器里，用户说完 30 秒得到空白输入框，无任何解释。
- 修复：catch 给出"没听清，可以重录或直接打字"。

### T5. 刷新丢失整个草稿
- `App.tsx:2943-2952`：只持久化已保存 traces，draft 全在 React state。转写确认页刷新 = 录音+转写+编辑全丢。
- 修复：draft 转写进 localStorage，刷新可恢复。

### T6. 录音中/TTS 播报中无法取消
- `App.tsx:4549-4571`（Cancel 只在 ready/unsupported 渲染）、`4527-4538`（preparing/speaking 时唯一按钮 disabled）。误触 "Tap to speak" 被锁在全屏 overlay 里。
- 修复：overlay 全程渲染关闭入口（`closeRecordingReview` 已存在）。

### T7. 强制 TTS 播报阻塞录音最长 7 秒
- `App.tsx:3216-3218`：录音要等 TTS 播完或超时（2.6-7s）才开始，期间开口的话录不到。全流程最少 4 次点击 + 两次网络往返，"30 秒打卡"难达成。
- 修复：TTS 与录音并行，或点击即跳过播报开录。

### T8. 转写确认页缺隐私说明
- `mvp-data-contract.md:583-589` 要求 "Audio is deleted after transcription. You control what gets saved."——全文 grep 零命中。对情绪语音产品是关键信任缺口。
- 修复：'Your words' 卡片下加一行隐私说明。

### T9. trace 草稿卡缺 confidence 与 Feels right 入口
- `App.tsx:4670-4784`：AI 返回的每字段 `confidence` 被完全丢弃；review 时无 pattern feedback 入口（契约 `mvp-data-contract.md:591-600` 要求）。
- 修复：草稿卡展示字段来源/置信度 + 轻量 Feels right。

---

## P3 — 一致性与数据正确性

### W1. 时间窗口三种口径并存（7 月报告问题未修）
- 周报：滚动 7 天（`dataFoundation.ts:1548-1556`）；loop 规则：锚定最后一条 trace 的 5 天（`913-916`）；UI 同屏另有 "Last 5 days"（`App.tsx:2369`）、"7D" 自然日历（`2496`）、"Last 7 days"（`2128`）。
- 修复：统一自然周（明确周起始日），loop 窗口与周报对齐。

### W2. n=1 就断言模式："You caught the signal early"
- `dataFoundation.ts:1704-1717` + `1776-1785`：1 条带身体信号的 trace 即触发 early_cue 洞察卡。从单数据点宣称模式，违反 copy-rules。
- 修复：early_cue 加门槛（bodyEvidenceTraceIds ≥ 2）。

### W3. 行动进行中切 tab 丢已填答案
- `App.tsx:4294` + `3524-3537`：切走再进同一行动，`setActionAnswers(getEmptyActionAnswers(...))` 清空。
- 修复：同 action 未完成 run 时保留 answers。

### W4. me tab 是死图标（未修）
- `App.tsx:4299-4301`：非 TouchableOpacity，无 onPress。
- 修复：做最小 me 页（隐私/导出入口正好放这里）或先移除图标。

### W5. localStorage 写失败静默 + 无多 tab 同步
- `App.tsx:905-916`（空 catch）、无 storage 事件监听。隐私模式/超限下数据只在内存，关页即失零提示；双 tab 整包互覆。
- 修复：写失败显示"未能保存到本机"；监听 storage 合并。

### W6. 周报 AI 改写无加载态，内容在阅读中被静默替换
- `App.tsx:2900-2925` + `2724`：本地模板先显示（好的兜底），但 3-10 秒后 headline/summary 突然整体变文字，无 pending 指示，失败也无提示。
- 修复：pending 时加轻量"Rora is polishing this note"标识。

### W7. "helped" 自动推导 effort='easy'
- `dataFoundation.ts:1302-1312`："有帮助但很累"这一关键信号无法存在，污染 too_much 降级的数据基础。
- 修复：effort 未采集存 null，不从 helpfulness 推导。

### W8. mismatch 追问收集后从不使用
- `dataFoundation.ts:1095`：context_mismatch 与 feeling_mismatch 结局完全相同，`lastMismatchReason` 无消费方。用户多花一步给的原因被丢弃。
- 修复：短期在 watching 文案回显原因；长期用于调整 chainKey 匹配维度。

### W9. cooldown 对用户不可见
- `dataFoundation.ts:1114-1121` + `App.tsx:2475-2483`：拒绝后卡片无声消失，渲染与新用户相同的 learning 卡。无法感知拒绝已生效。
- 修复：一次性确认文案（"你说过这不是循环，Rora 已收起它"）。

### W10. 周报 "What helped" 用全时段记忆未按本周过滤
- `dataFoundation.ts:2059`：可能引用数周前动作，且污染发给 AI 改写的事实依据——违背"delta 来自本周"的付费契约。
- 修复：bestMemory 只从本周 actionMemory 构建。

### W11. 证据条数字与实际保存数不符
- `dataFoundation.ts:1794`："Based on N traces" 的 N 是主 loop 出现次数而非本周总数。本周 6 条、loop 占 4 时显示 4，用户觉得"我明明记了 6 次"。
- 修复：evidenceChip 用 `weeklyTraceRecords.length`。

### W12. 周报"四问"字段是死数据
- `dataFoundation.ts:2100-2130` 算好的 `whatRepeated/whatShifted/whatHelped/gentleNextStep` 在 UI（`App.tsx:2562-2597`）零引用。
- 修复：卡片补 repeated/shifted 双栏，或删死字段。

### W13. 人格命名不一致：Mood vs Rora
- `App.tsx:4442`、`4747`（"Mood"）vs `713`、`4031`（"Rora"）。同一对话流里伙伴换名。
- 修复：统一为一个名字。

### W14. 实时字幕语言跟随浏览器而非产品 locale
- `App.tsx:3356`（`navigator.language`）+ `3372`（onerror 静默吞）。en 浏览器的中文用户录音时看到英文乱码字幕，停止后才被服务端结果替换。
- 修复：lang 跟随产品 locale，或字幕失真时降级波形提示。

---

## 已确认合格的（不用动）

- feels_right/not_quite 按钮、mismatch 三选一追问、confirmed/watching 状态回显——已实现且可用（`App.tsx:2381-2451`）
- 周报是叙事卡片而非仪表盘（符合 Required Shape）；依赖 action schema 的文案确实全部走 `actionRewardCopy.ts` 契约路由，无散落
- 录音 overlay 全屏盖住底栏，录音中不会误切 tab 丢语音草稿
- 无障碍抽查合格：MoodButton/BodyButton/RecordButton/nav 均有 accessibilityRole+Label+State，web 翻转卡有 aria
- 周报 0 条空态（"Rora is still gathering the week"）设计过
- LLM 失败时周报有本地模板兜底（两层架构正确）

## 修复顺序建议（结合三轮市场研究）

1. **P0 四条**（S1-S4）：安全和信任是底线，中文安全词一天能修，假数据删除半天。
2. **C1 + C3 + C4**（did_not_help 通路 + 降权 + 递上式）：这三条合起来就是"AI 听劝"——研究确认的品类第一弃用原因的直接对策，也是 concierge 验证前必须有的形态。
3. **T1-T4**（死局、超时、localhost、静默失败）：任何真人测试前的可用性底线。T3（localhost）是部署给种子用户的前提。
4. **C2（行动效果回访）+ C5（证据链）**：差异化的兑现，做完才配叫"验证过的行动"。
5. W 系列按顺手程度插入，W1（时间口径）建议与周报重构一起做。
