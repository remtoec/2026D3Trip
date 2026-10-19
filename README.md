# 北海道・雪與湯｜2026 D3 Trip — LLM 接手指南

> **先讀呢段：Moving Inn 係使用者指定重點，必須保留。**
> 目前任務係沿原酒店路線補充景點／活動，唔係重新揀酒店或優化成另一條路線。
> 唔好再因為車程長，將16日 Moving Inn 改成小樽、札幌或其他住宿。

- 網站：[remtoec.github.io/2026D3Trip](https://remtoec.github.io/2026D3Trip/)
- 積雪資料頁：[climate.html](https://remtoec.github.io/2026D3Trip/climate.html)
- Repository：[remtoec/2026D3Trip](https://github.com/remtoec/2026D3Trip)
- 交接更新：**2026-10-19，香港時間**。今次：65項研究過嘅景點／節慶／活動／溫泉／美食／補給，加上全新UI（手機一眼睇晒、桌面儀表板）。
- 分支／部署：`main` 根目錄，GitHub Pages 自動發布。

## 1. 接手時先做甚麼

1. 讀本README，然後讀 `assets/itinerary-data.js`（資料）、`assets/js/main.js`（路由同全站動作）、`assets/js/trip.js`、`assets/js/ui.js`。涉及雪況先讀weather檔案。
2. 讀最新遠端 `main`，確認有冇新使用者指示或其他修改；唔好直接用舊聊天摘要、舊草案或本地副本覆蓋現況。
3. 分清楚「使用者希望維持嘅住宿路線」、「暫擬交通安排」、「歷史氣象觀測」、「未確認活動」四種資料。
4. 先完成使用者新要求；如修改網站，沿用現有GitHub Pages、資料結構同設計系統，唔另開一個無關網站。
5. 改完一定跑 `node tools/check-data.mjs`（見§9）。

最新明確指示優先於本README。README係2026-10-19嘅交接快照，唔係不可更改嘅永久規則。

## 2. 使用者意圖與已接受方向

- 語言：**繁體中文、香港自然用語／廣東話**，避免台式用語、過多中英夾雜。
- 想要：雪景、溫泉、特色住宿；有七人車，六位成人同行。
- Moving Inn 係旅程重點，願意為呢晚住宿保留行程空間。
- 路線大機會不變，**減少替代路線與替代酒店**，重點增加景點及活動。
- 可考慮由住宿基地出發，**約一至兩小時單程車程內**嘅地方；唔代表所有活動都要加入行程。
- 不喜歡無限向下滾動嘅清單：用基地分頁、類別篩選、卡片分頁／左右掃及地圖。
- **手機版＝一眼睇晒嘅「今日」；桌面版＝延伸儀表板。** 想去標記只存喺各自手機（瀏覽器），用「複製清單」貼落group分享。
- 研究範圍：景點、節慶燈飾、活動體驗、日歸溫泉、**美食同自駕補給點**；每個基地揀8–12項左右。
- 資料來源要包括**日本、台灣、香港**；日期／時間／價錢只用日本官方。
- 分工：**UI/UX只由Claude Opus做**（主線或Opus subagent）；Codex `gpt-6.1-sol` 只做資料研究。
- 網站已指定放喺使用者GitHub。沒有代訂酒店／課堂／活動，也沒有聯絡宿主。

曾經提出將Moving Inn換成小樽住宿，使用者已明確否定。舊富良野／Tomamu替代二世古方案，亦已被最新「最後去二世古滑雪」方向取代；唔好當成目前主線。

## 3. 旅行事實、住宿表與暫定安排

年份全部係 **2026**，日期格式係日／月。不是2027年行程。星期：13日、14一、15二、16三、17四、18五、19六、20日。

- 13/12集合，六位成人（5男1女，包括一對夫婦）。
- 夫婦18/12返港，住五晚：13、14、15、16、17日。
- 其餘四位男士18–19/12二世古滑雪，20/12返港，住七晚：13–19日。
- 新千歲進出，自駕七人車；實際航班時間、租車詳情及滑雪程度未知。
- 床位方向：夫婦獨立房，四位男士各一張床；唔把「可住六人」等同六張獨立床。

### 使用者提供、希望維持嘅住宿路線

| 入住晚數 | 住宿 | 原表計價人數 | 組內合計／原幣 |
|---|---|---|---|
| 13日，1晚 | 薄野 Granbell Hotel | 6人 | HK$2,801.43 |
| 14日，1晚 | 美瑛 Spoon Valley・ザワザワ村 | 6人 | ¥29,000／人，按0.051換算，六人HK$8,874 |
| 15日，1晚 | La Vista 富良野 Hills | 6人 | HK$4,043.34 |
| 16日，1晚 | Moving Inn | 6人 | ¥216,888，即約HK$11,061.29 |
| 17、18日，2晚 | SISUMO 昆布 | 4人 | **兩晚合計**HK$6,273 |
| 19日，1晚 | 薄野 Granbell Hotel | 4人 | HK$3,062.02 |

呢啲係使用者圖片提供嘅價錢，唔係本系統重新查到嘅指定日期報價，也唔代表已訂房。
原圖只寫「Moving Inn」，目前按**十勝大樹町 Moving Inn Tokachi 北の森**理解。若日後提供嘅分館／地址有出入，先核實地址；唔自行取消Moving Inn。

### 目前網站嘅暫擬安排，未獲逐項確認

- 14日下午盡量早入住Spoon Valley，留時間享受木屋。
- 15日主推白鬚瀑布＋青池（16:30亮燈）；晚上富良野食飯。精靈露台、芝士工房等按時間選，唔全部硬排同日。
- 16日富良野早出發，途中帶廣午餐（豚丼）／幸福駅短停，盡量15時前後抵Moving Inn；住宿內桑拿／浴池／用餐按訂房方案安排。
- **17日經千歲附近分隊**：夫婦去住宿／JR站，四人保留車繼續去昆布。原表只計四人SISUMO，夫婦17晚需另外計。
- 17日跨區轉場暫留6–8小時，含短休息及分隊餘量；呢個係規劃估算，唔係已查實際導航。只列路線上／繞路≤30分鐘嘅短停。
- 18日四人滑雪；19日早上退房再滑雪，約13:30–14:00收隊還裝備，返回**原定札幌Granbell**。
- 20日按航班安排還車登機；未有航班時間，唔擅自將19晚改住千歲。

夫婦17日如果仍想六人同住，SISUMO要另問六人報價及18日機場接駁，唔可以直接把四人價除六。

## 4. 現行網站結構：改邊個檔案

靜態HTML、CSS、原生 ES modules，**沒有npm套件、建置步驟、後端或帳戶系統**。ES modules 要經HTTP開（GitHub Pages或本地 `python -m http.server`），直接雙擊 `file://` 唔會行。

| 檔案 | 用途／改動位置 |
|---|---|
| `index.html` | 主頁殼：頂部導覽（桌面）、底部分頁列（手機）、5個 `.view`、詳情 `<dialog id="sheet">` |
| `assets/itinerary-data.js` | `window.ITINERARY_DATA`：5間住宿、6個基地、8日（含路牌資料）、65項活動、`excluded`、`todo`、`roadLinks` |
| `assets/theme.css` | 設計 tokens（淺色／深色）。只喺度加顏色 |
| `assets/app.css` | 版面同元件：路牌 `.sign`、車程牌 `.plate`、印章 `.stamp-btn`、卡、日子條、carousel、sheet、地圖 |
| `assets/overview.css` | 總覽／今日頁專用版面 |
| `assets/js/main.js` | 路由、全站點擊委派（詳情、蓋印、複製）、`window.FIXED_TRIP` |
| `assets/js/router.js` | hash 路由 |
| `assets/js/trip.js` | 資料輔助：類別、車程文字、適合日子、Google Maps 連結 |
| `assets/js/ui.js` | 共用 render：路牌、卡、列、詳情、sheet、toast、clipboard |
| `assets/js/map.js` | Leaflet 控制器；Leaflet載入失敗時顯示後備文字 |
| `assets/js/state.js` | 想去印章（localStorage `d3jp26.stars.v1`）、深淺色（`d3jp26.theme`）、行程時鐘（日本時間） |
| `assets/js/budget.js` | **預算計算公式**（由舊 `itinerary.js` 原封搬過嚟） |
| `assets/js/views/*.js` | `overview`（今日／總覽）、`days`、`explore`、`stars`、`stays` |
| `tools/check-data.mjs` | 資料＋預算一致性檢查（§9） |
| `climate.html` + `assets/style.css` | 獨立近年氣溫／降雪／積雪頁（已換新設計 tokens） |
| `assets/weather-data.js` / `weather.js` / `climate-bridge.js` / `snow-history.csv` | 積雪頁資料同邏輯，冇改 |
| `proposal.html` | 舊草案網址，轉往 `index.html` |
| `.nojekyll` | Pages靜態發布設定，保留 |

**以下只係前版存檔，現行主頁唔載入：** `assets/proposal.js`、`assets/app.js`、`assets/data.js`、`assets/itinerary.js`、`assets/itinerary.css`。
佢哋含舊替代路線、換走Moving Inn等過時內容；唔好因為搜尋見到而改錯檔案或重新接上主頁。

載入次序（主頁）：Google Fonts → 固定版Leaflet CSS → `theme.css` → `app.css` → `overview.css`；scripts：`itinerary-data.js`（defer）→ `js/main.js`（module）；Leaflet用 **`async`**（`id="leaflet-js"`，onload／onerror設 `window.__leaflet`），`map.js` 等佢載入先畫地圖，CDN慢或者封鎖都唔會拖住成個網站（10秒後提示可用Google Maps連結，但Leaflet遲啲載到仍會照畫地圖）。
更新 `itinerary-data.js` 或CSS後，要同步改HTML引用嘅 `?v=`。Module之間嘅 import 冇加版本號；GitHub Pages快取約10分鐘。

### 路由同畫面

- `#/today` 總覽：手機＝今日路牌、今晚住、今日揀邊樣、聽日、出發前要確認；桌面加關鍵數字、全程地圖、8日板、活動日曆（甘特圖）、近年積雪摘要。
- `#/days/16` 每日行程：日子條（手機可左右掃）、路牌＋導航、日間／夜晚揀、你蓋咗印又啱呢日、路況連結；桌面右邊有當日地圖。
- `#/explore/taiki?cat=food&drive=60&time=evening&booking=need&starred=1&mode=map` 景點：基地分頁、類別、篩選sheet；手機＝左右掃卡（有頁數）或全屏地圖；平板＝每頁6張；桌面＝清單（每頁5張）｜地圖｜詳情側欄。
- `#/stars` 想去清單：按基地分組、「複製清單」（文字＋Google Maps連結）。
- `#/stays` 住宿及預算。
- `#/item/<id>` 直接開某項。舊連結 `?area=taiki` 會轉去 `#/explore/taiki`。
- **Google Maps（現場用）**：卡片／列尾導航圖示／地圖popup＝由手機目前位置開車去（`mapsGo`）；詳情有「開車去／公共交通（札幌）／行路（近距離）／地點資料／由住宿出發」；路牌「全日路線」連途經點（`sign.via[].coords`）；酒店有「開車去」同 Mapcode／電話（日本車載導航用）。目的地：信得過嘅座標用座標，約略位置用日文名（`mapsDest`）。
- `?date=2026-12-16` 可以模擬旅程中某日（測試用）；冇就用日本時間今日。

`window.FIXED_TRIP`：`calculate`、`activities()`（目前景點頁篩選結果）、`setBase`、`jumpBase`、`setTab`（舊ID `plan`／`activities`／`stays` 仍接受）、`showDetail`、`selectActivity`、`state()`。

### 設計系統（唔好隨手改走）

- 主角：**日本藍色道路指示牌（青看板）**＝每日「由→去＋車程」；小型車程牌 `.plate` 用同一語言。
- 「想去」＝朱紅色**印章**（道の駅蓋印文化），清單即「印章簿」。
- 其餘保持安靜：雪白底、細線、Barlow Semi Condensed 數字（tabular）、Noto Sans TC 文字。
- 避免：全大楷小標、按鈕文字尾加「→」、「A · B · C」中間點串字、漸變色塊、一式一樣嘅卡格。
- 深色模式：跟系統或右上角月亮切換；地圖深色用CSS filter，唔換底圖來源。

### 資料結構

`ITINERARY_DATA` 根欄位：`updated`、`hotels`、`bases`、`activities`、`days`、`excluded`、`route`、`todo`、`roadLinks`。

- `bases` ID：`sapporo`、`biei`、`furano`、`taiki`、`transfer`、`niseko`。
- `route`：`granbell → spoon → lavista → moving → sisumo → granbell`。
- `days[]`：`day, weekday, title, hotel, pax, base, plan, drive, picks[], sign{from, fromEn, via[{zh,en}], to, toEn, time, unit, note}`。`picks` 必須引用有效活動ID。
- `excluded[]`：`[名稱, 原因, 官方URL, base或null]`，景點頁「今次日子唔啱嘅項目」按基地顯示。
- `activities[]` 欄位：
  - 舊有：`id, name, bases, drive, stay, tag, priority, desc, fit, status, cost, url, sources, coords, approx, mapQuery, positionNote`
  - 新增：`nameJa`、`hook`（≤18字一句）、`category`（`sight|event|activity|onsen|food|stop`）、`days[]`（適合嘅行程日）、`timeOfDay`（`day|evening|any`）、`when{from,to,hours,closedOnTripDays[],season}`、`booking`（`none|recommended|required`）、`tips[[文字,來源名,URL,lang]]`、`food{dish,price,tabelog,queue}`、`navi{mapcode,tel}`、`confidence`（`confirmed|last-season|unverified`）、`checked`、`leg`（17日轉場項目：`taiki-chitose|chitose-kombu`）、`enRoute{day,from,label}`（16日途中站）。
  - `sources[]`：`[標籤, URL, lang(ja|zh-TW|zh-HK|en), kind(official|guide|blog|forum)]`；舊資料可能只有頭兩格。
- `drive` 係以基地ID為key嘅 `[最低, 最高]` **單程分鐘範圍**；`transfer` 基地嘅數字係**繞離路線分鐘**；`enRoute` 項目顯示「途中」，導航由前一晚住宿出發。
- `priority`：`main`主推、`extra`可加、`far`較遠、`check`需確認。
- 改活動數量時，同步改 `tools/check-data.mjs` 嘅 `EXPECT`、HTML description及本README。

## 5. 地圖與車程：不可混淆嘅資料

- 使用固定版 **Leaflet 1.9.4**（unpkg、SRI）及 `https://tile.openstreetmap.org/{z}/{x}/{y}.png`；保留OpenStreetMap版權連結；唔加預先大量下載底圖。
- 標記來自研究時嘅官方地圖／OSM／地址，**並非全部係入口位置**；`approx` 項目會標「約略位置」。
- SISUMO只標公開鄰近昆布站，唔係民宿確實地址；唔公開宿主未公開嘅地址。
- **虛線只表示住宿次序，唔係道路導航**。車程係冬季規劃估算，唔係即時交通或量度過嘅保證。
- 轉場基地 `transfer` 嘅短途分鐘數係繞離路線時間；千歲分隊點係約略範圍。
- Leaflet載入失敗時，卡片、篩選及Google Maps連結仍可用；底圖部分錯誤亦有提示。
- 隱藏畫面入面嘅地圖，顯示後會 `invalidateSize()`（`map.js` 嘅 `invalidate()`）。

## 6. 活動資料：研究方法同必須保留嘅限制

### 2026-10-19 研究方法

1. **七個研究工作**（Codex `gpt-6.1-sol`，平行、即時網上搜尋）：R1札幌、R2美瑛／旭川、R3富良野、R4十勝／大樹、R5十七日轉場、R6二世古、R7十二月13–20日節慶掃描。每項最多15個候選，連排除清單。
2. **來源分級**：①日本官方（町／觀光協會／店方／visit-hokkaido.jp／sapporo.travel）——**日期、時間、價錢、休息日只可以用呢級**；②日本指南（Walker+、じゃらん、北海道Likers、食べログ分數）；③台灣（樂吃購！日本、背包客棧、PIXNET／Mobile01）同香港（U Travel、HK01、TOPick、香討）——**只用嚟寫「點解去／貼士／陷阱／叫咩食」**。每項至少一個日本官方來源。
3. **人手揀選**（Claude）：保留原有25項（用研究更新文字，但保留已核實座標），刪重複，每基地揀8–13項，共65項；設定每日 `picks`。
4. **第二輪**：逐項再開官方頁核對日期／休息日／預約／座標（原定Codex，因Codex用量上限改由Claude Sonnet subagent做），同埋香港廣東話潤稿（只改 `hook/desc/fit/tips`，所有數字必須保留，否則唔接受）。
5. 每項標 `confidence`：今季已確認／按上季資料／待確認。研究原始JSON冇入repo。

### 必須保留嘅限制（之前已核實，研究再確認）

| 地區／活動 | 接手時要知道 |
|---|---|
| Moving Inn住宿內體驗 | 係16日主活動。官方NAGAME基本方案：入住15:00–17:00、私人桑拿及薪式露天浴、餐膳另選；六人單位按實際訂單確認 |
| 冬季河畔桑拿 | ¥10,000／人，日間約1小時；**16日場次未公布**，15:00先到可能太遲 |
| Moving Inn 狗拉雪橇 | 2027年1月下旬先有，唔啱今次 |
| 廣尾Santa Land | 冬季燈飾16:00–22:00，涵蓋16日；來回連參觀要2.5–3小時，同住宿晚餐／桑拿衝突 |
| 晩成溫泉 | 9:00–21:00、末受付20:00；10–3月星期二休，16/12係星期三 |
| 六花亭帶廣本店 | 16/12星期三**喫茶室休息**；一樓手信照開 |
| 美瑛青池 | 2026-10-22至2027-04-21亮燈，12月16:30–21:00；普通車泊車¥1,000 |
| 聖誕樹之木 | 冇泊車場，冬季建議由美瑛站坐的士／周遊巴士；唔可以自駕停喺樹前 |
| 旭山動物園 | 冬季10:30–15:30，末入園15:00；**企鵝散步上季12/18先開始，唔保證** |
| 四季彩之丘 | 園區照開；雪上項目今季開始日未確認 |
| 富良野芝士工房 | 11–3月9:00–16:00；獨立Ice Milk工房10/22已收 |
| 安努普利 | 2026–27預定11/28開季，夜滑12/12起；唔代表18日全山連通 |
| 幽泉閣 | 10:00–21:30、末受付21:00；11/30–12/3工程休館，唔撞今次 |
| 冰之村、歡寒村、珠寶冰、冰上釣公魚、雪祭等 | 全部喺今次日子之後先開，放喺 `excluded` |

主要官方入口：[Moving Inn](https://moving-inn.com/)／[河畔桑拿](https://moving-inn.com/activity/riversidesauna)、[Spoon Valley](https://spoonvalley.com/reservation/)、[SISUMO昆布](https://sisumo.jp/kombu)、[美瑛町亮燈公告](https://www.town.biei.hokkaido.jp/culture/event/illuminate.html)、[廣尾Santa Land](https://www.santaland.or.jp/illumination/)、[六花亭帶廣](https://www.rokkatei.co.jp/shop/obihiro/)。其他以各活動 `url`／`sources` 為準。

## 7. 預算規則：唔好改錯分攤

**價格唔係全部只放喺data檔。** `assets/js/views/stays.js` 有原始價格表，`assets/js/budget.js` 嘅 `calculate()` 有實際常數，`itinerary-data.js` 酒店也有價格文案。改價要同步檢查三處。

```js
window.FIXED_TRIP.calculate({
  couple: 1000, // 夫婦17日住宿，兩人全晚HK$，預留而非報價
  transfer: 0,  // 夫婦兩人交通HK$，0代表未加入
  ski: 0,       // 每位滑雪男士額外費用HK$，唔乘到夫婦
  extras: 0,    // 全六人其他活動總額HK$，按六人分
  two: false,   // Spoon夫婦一棟＋四人一棟，按所住棟別分攤
  river: false  // 額外預留六人河畔桑拿，唔代表已訂
});
// 回傳 { man, pair, group, riverTotal }；man/pair均為每人
```

- 匯率沿用使用者表格：`¥1 = HK$0.051`，唔靜默換成之前版本嘅0.05。
- 四位男士七晚住宿約HK$6,797／人；夫婦五晚由四個共同住宿晚數＋17日另住組成。
- SISUMO HK$6,273係四人**兩晚總額**，唔好再乘二。
- Spoon原表每人HK$1,479；兩棟模式下夫婦各¥29,000即HK$1,479，四位男士各¥27,000即HK$1,377。呢個係一般價及房型比較，未確認兩棟空房。
- 河畔桑拿預留為每人HK$510，六人約HK$3,060；避免同訂房方案已包內容重複計。
- 金額係浮點運算，驗證用容差，顯示再四捨五入。
- 主要守恆：**`group = 4 * man + 2 * pair`**；只加每名男士滑雪費HK$1,000，group加HK$4,000、pair不變；兩棟Spoon模式，man減HK$102、pair不變、group減HK$408。（`tools/check-data.mjs` 會自動檢查。）
- 未填嘅機票、租車、油費、高速費、滑雪／課堂、額外餐飲及入浴費未計。0唔係「免費」。

## 8. 近年天氣／積雪資料

原始研究查核日2026-10-12；2026-10-19只換咗積雪頁外觀，**冇重新下載或更新數據**。總覽頁桌面版會延遲載入 `weather-data.js` 做摘要。

- 來源日本氣象廳JMA，2021–2025各年12/13–20，每站40筆；11站共440筆。
- 可切換滑雪日期12/18–19（每站最多10筆）、五年或單一年份。
- 觀測站：倶知安、富良野、美瑛、占冠、旭川、札幌、小樽、登別、千歲、小金湯、新得。
- **未包括大樹町。唔用占冠／新得站冒充Moving Inn雪況。** 如果補研究，另找合適當地觀測及註明距離／高度差。
- 歷史積雪日數唔係未來落雪概率；城鎮觀測站亦唔係酒店門口、山上雪道或滑雪開放保證。

現行統計口徑：

1. 平均積雪深度＝**每日最深積雪**嘅平均，唔係全日連續積雪高度。
2. 「有積雪記錄」＝每日最大值≥1cm；≥10cm另列日數，唔係雪場營運門檻。
3. 新雪合計先逐年加總選定日期，再平均**資料完整年份**；唔把缺測補零，亦唔將零碎年份按比例放大。
4. 氣溫為日最高／日最低嘅平均，唔係期間極端值。
5. JMA `--`無現象按0；空白、未觀測、缺測、附 `)`／`]`等品質符號嘅值在本版排除。原值仍保留；0可能含不足1cm，唔等同完全冇雪。
6. 千歲2022/12/18、登別2025/12/20有品質符號；小金湯冇氣溫值，唔借別站填補。

`window.TRIP_SNOW.stats(stationId, 'trip'|'ski', 'all'|'2025'...)` 可查看統計。積雪頁需保留空 `#detail` dialog及 `climate-bridge.js` 提供嘅 `window.TRIP_APP`相容介面。

## 9. 檢查方式與已知驗證界限

無 `package.json`／`npm test`。由乾淨checkout執行：

```bash
for f in assets/js/*.js assets/js/views/*.js assets/weather.js assets/climate-bridge.js; do node --check "$f"; done
node tools/check-data.mjs
```

`check-data.mjs` 會檢查：數量（`EXPECT`）、路線及16／19日住宿不變、ID唯一、每日 `picks`／酒店／基地有效、類別／優先次序／預約值、座標範圍、`drive` 與 `bases` 對應且≤120分鐘、官方URL、預算守恆。新增或刪除活動要按有意改動調整 `EXPECT`，唔為通過而刪資料。

瀏覽器檢查（2026-10-19有做，用本地 `python -m http.server` 加內置瀏覽器／Playwright）：

- 375×812及1440×900、淺色／深色；`#/today`、`#/days/<n>`、`#/explore/<base>`、`#/stars`、`#/stays`、`?area=taiki`、`?date=2026-12-16`。
- 景點：類別／篩選／分頁上下界、手機左右掃卡同頁數、地圖模式、桌面詳情側欄、標記選卡。
- 想去：蓋印、重新整理後仍在、複製清單、localStorage被封時唔會出錯。
- 預算數字同 `calculate()` 一致；積雪頁控制項。
- 冇console錯誤。實機（真iPhone／Android）未測。

## 10. 發布與後續工作

### 發布

- 本repo已由GitHub Pages以 `main`根目錄發布，唔需要其他hosting。
- 真正Git checkout可用正常commit／push流程；push去main前先問使用者。
- 若用GitHub connector：先讀 `refs/heads/main`取得head，再讀commit嘅tree；用base tree建立只包含所需改動嘅新tree，create commit以舊head為parent，update ref時帶 `expected_sha`、`force:false`。
- 分支已變動就重新讀取及整合，唔強推。保留未修改檔案及`.nojekyll`。
- 唔把研究暫存（`.research/`）、本地預覽設定（`.claude/`）、相片、憑證或無關資料加入repo。

### 真正未確認事項（亦顯示喺網站「出發前要確認」）

1. 夫婦18日、四人20日航班時間，13日最後抵達時間。
2. Moving Inn確實分館、六人所訂單位、床位、包餐及已包設施；16日河畔桑拿場次。
3. Spoon Valley棟數、四張獨立床、付款／餐飲與實際空房。
4. 17日夫婦住宿及分隊交通，是否接受目前千歲附近分隊安排。
5. 四人滑雪程度、ski／snowboard、課堂語言、器材、18–19日實際雪道開放。
6. 冬季營業／接駁／活動開始日期，尤其聖誕樹之木、企鵝散步及四季彩之丘。
7. 真機手機畫面驗證。

下一個LLM應以新要求為先；以上係已知空白，唔代表要一次過擴大成訂房、購票、聯絡或長期監察任務。保持原路線，將活動變成容易選擇、理解車程及知道限制嘅資訊。
