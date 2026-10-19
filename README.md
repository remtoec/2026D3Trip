# 北海道・雪與湯｜2026 D3 Trip — LLM 接手指南

> **先讀呢段：Moving Inn 係使用者指定重點，必須保留。**
> 目前任務係沿原酒店路線補充景點／活動，唔係重新揀酒店或優化成另一條路線。
> 唔好再因為車程長，將16日 Moving Inn 改成小樽、札幌或其他住宿。

- 網站：[remtoec.github.io/2026D3Trip](https://remtoec.github.io/2026D3Trip/)
- 積雪資料頁：[climate.html](https://remtoec.github.io/2026D3Trip/climate.html)
- Repository：[remtoec/2026D3Trip](https://github.com/remtoec/2026D3Trip)
- 交接更新：**2026-10-19，香港時間**。
- 最近功能版本：[`d440311`](https://github.com/remtoec/2026D3Trip/commit/d44031139202216fdbd73b89b8a606687d072473)。本次只補充README交接資料。
- 分支／部署：`main` 根目錄，GitHub Pages 自動發布。

## 1. 接手時先做甚麼

1. 讀本README，然後讀 `index.html`、`assets/itinerary-data.js`、`assets/itinerary.js`。涉及雪況才再讀weather檔案。
2. 讀最新遠端 `main`，確認有冇新使用者指示或其他修改；唔好直接用舊聊天摘要、舊草案或本地副本覆蓋現況。
3. 分清楚「使用者希望維持嘅住宿路線」、「暫擬交通安排」、「歷史氣象觀測」、「未確認活動」四種資料。
4. 先完成使用者新要求；如修改網站，沿用現有GitHub Pages、分頁、地圖及資料結構，唔另開一個無關網站。

最新明確指示優先於本README。README係2026-10-19嘅交接快照，唔係不可更改嘅永久規則。

## 2. 使用者意圖與已接受方向

- 語言：**繁體中文、香港自然用語／廣東話**，避免台式用語、過多中英夾雜。
- 想要：雪景、溫泉、特色住宿；有七人車，六位成人同行。
- Moving Inn 係旅程重點，願意為呢晚住宿保留行程空間。
- 路線大機會不變，**減少替代路線與替代酒店**，重點增加景點及活動。
- 可考慮由住宿基地出發，**約一至兩小時單程車程內**嘅地方；唔代表所有活動都要加入行程。
- 不喜歡無限向下滾動嘅清單：用基地分頁、篩選、卡片分頁及地圖。
- 網站已指定放喺使用者GitHub。沒有代訂酒店／課堂／活動，也沒有聯絡宿主。

曾經提出將Moving Inn換成小樽住宿，使用者已明確否定。舊富良野／Tomamu替代二世古方案，亦已被最新「最後去二世古滑雪」方向取代；唔好當成目前主線。

## 3. 旅行事實、住宿表與暫定安排

年份全部係 **2026**，日期格式係日／月。不是2027年行程。

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
- 15日主推白鬚瀑布＋青池；精靈露台、芝士工房等按時間選，唔全部硬排同日。
- 16日富良野早出發，盡量15時前後抵Moving Inn；住宿內桑拿／浴池／用餐按訂房方案安排。
- **17日經千歲附近分隊**：夫婦去住宿／JR站，四人保留車繼續去昆布。原表只計四人SISUMO，夫婦17晚需另外計。
- 17日跨區轉場暫留6–8小時，含短休息及分隊餘量；呢個係規劃估算，唔係已查實際導航。不安排額外一至兩小時遠遊。
- 18日四人滑雪；19日早上退房再滑雪，約13:30–14:00收隊還裝備，返回**原定札幌Granbell**。
- 20日按航班安排還車登機；未有航班時間，唔擅自將19晚改住千歲。

夫婦17日如果仍想六人同住，SISUMO要另問六人報價及18日機場接駁，唔可以直接把四人價除六。

## 4. 現行網站結構：改邊個檔案

靜態HTML、CSS、vanilla JavaScript，**沒有npm套件、建置步驟、後端或帳戶系統**。

| 檔案 | 用途／改動位置 |
|---|---|
| `index.html` | 現行主頁：每日行程、景點／活動與地圖、住宿與預算；亦有部分寫死嘅金額及文案 |
| `assets/itinerary-data.js` | `window.ITINERARY_DATA`：5間住宿、6個基地、8日日程、25項活動、季節限制 |
| `assets/itinerary.js` | 分頁、篩選、卡片分頁、地圖、詳情、住宿資訊及**預算計算公式** |
| `assets/itinerary.css` | 現行行程頁專用樣式 |
| `assets/style.css` | 共用奶油色／森林綠樣式，也供積雪頁使用 |
| `climate.html` | 獨立近年氣溫／降雪／積雪頁 |
| `assets/weather-data.js` | `window.TRIP_WEATHER`：JMA歷史觀測快照及來源 |
| `assets/weather.js` | 歷史資料統計、年份／日期／觀測站控制項、逐日雪深表 |
| `assets/climate-bridge.js` | 積雪頁相容介面及返回主頁基地嘅連結 |
| `assets/snow-history.csv` | 440筆歷史記錄，保留原值符號及逐年月表URL，可下載 |
| `proposal.html` | 舊草案網址，現在轉往 `index.html`；唔再編輯成另一個方案 |
| `.nojekyll` | Pages靜態發布設定，保留 |

**以下只係前版存檔，現行主頁唔載入：** `assets/proposal.js`、`assets/app.js`、`assets/data.js`。
佢哋含舊替代路線、換走Moving Inn等過時內容；唔好因為搜尋見到而改錯檔案或重新接上主頁。

現行載入次序：

- 主頁：共用／行程CSS → 固定版Leaflet → `itinerary-data.js` → `itinerary.js`，scripts用 `defer`。
- 積雪頁：共用CSS → `weather-data.js` → `weather.js` → `climate-bridge.js`。
- 更新靜態檔案後，視需要同步更改HTML引用嘅 `?v=`，避免用戶混用新舊快取。

### 資料結構與操作接口

`ITINERARY_DATA` 根欄位：`updated`、`hotels`、`bases`、`activities`、`days`、`excluded`、`route`。

- `bases` ID：`sapporo`、`biei`、`furano`、`taiki`、`transfer`、`niseko`。
- `route`：`granbell → spoon → lavista → moving → sisumo → granbell`。
- 活動含 `id, name, bases, drive, stay, tag, priority, desc, fit, status, cost, url, sources, coords, approx, positionNote`。
- `drive` 係以基地ID為key嘅 `[最低, 最高]` **單程分鐘範圍**；同一景點由不同基地出發，數字可以不同。
- `priority`：`main`主推、`extra`額外、`far`較遠、`check`需確認；UI「額外候選」包含extra及far。
- 車程篩選按範圍上限；「約一至兩小時」包含上限超過60分鐘嘅候選，唔係精確路線計算。
- `days[].picks` 必須引用有效活動ID；酒店、基地ID亦要一致。
- 改活動數量時，同步檢查HTML description及README等有冇寫死數量。

主頁瀏覽器介面：`window.FIXED_TRIP` 暴露 `calculate`、`activities`、`setBase`、`jumpBase`、`setTab`、`showDetail`、`selectActivity`、`state`。

- `setTab` 接受 `plan`／`activities`／`stays`。
- `?area=taiki` 等基地ID可直接打開活動頁，例如 [Moving Inn附近活動](https://remtoec.github.io/2026D3Trip/?area=taiki)。
- 預設先顯示每日行程；活動頁預設基地為Moving Inn／十勝。
- 桌面每頁3張活動卡，≤700px每頁2張。保留分頁，唔改回全部卡片向下堆疊。
- 卡片與地圖標記連動；詳情用原生 `<dialog>`，保留關閉及鍵盤操作。

## 5. 地圖與車程：不可混淆嘅資料

- 使用固定版 **Leaflet 1.9.4**（CDN、SRI）及 `https://tile.openstreetmap.org/{z}/{x}/{y}.png`。
- 保留OpenStreetMap版權連結；唔加預先大量下載底圖。
- 標記來自OSM或酒店／景點官方嵌入地圖中心，**並非全部係入口位置**。
- SISUMO只標公開鄰近昆布站，唔係民宿確實地址；唔公開宿主未公開嘅地址。
- Spoon Valley、部分景點用官方地圖中心；安努普利用雪場區域約略標記，保留 `approx` 說明。
- 多個住宿內活動共用同一座標，並非各自定位到確實河邊設施。
- **虛線只表示住宿次序，唔係道路導航**。車程係冬季規劃估算，唔係即時交通或量度過嘅保證。
- 轉場基地 `transfer` 嘅短途分鐘數由**千歲市區分隊點**計，唔係由Moving Inn出發到千歲只需十幾分鐘。
- Leaflet載入失敗時，資料、篩選及Google Maps連結仍可用；底圖部分錯誤亦有提示。
- 隱藏頁籤內嘅地圖，顯示後要呼叫 `invalidateSize()` 再定位，避免空白／錯位。

## 6. 活動資料：已核實內容與必須保留嘅限制

資料於2026-10-19查核；活動 `url`／`sources` 內有官方連結。以下係研究摘要，唔係預訂紀錄，日後有關日期需再查。

| 地區／活動 | 接手時要知道 |
|---|---|
| Moving Inn住宿內體驗 | 係16日主活動。房內桑拿、露天浴、圍爐、餐飲及六人房型按實際訂單確認，唔假設全部已包 |
| 冬季河畔桑拿 | 官網約1小時、¥10,000／人；**16日下午是否有場次未知**，與房型附設桑拿分開，避免重複收費假設 |
| 廣尾Santa Land | 12月中有冬季燈飾，官方列16:00–22:00；來回及用餐時間要同Moving Inn體驗取捨 |
| 晩成溫泉 | 官方9:00–21:00、末受付20:00；10–3月星期二休息，16/12係星期三 |
| 六花亭帶廣本店 | 16/12星期三，**喫茶室休息**；可以按店舖營業時間買外帶，唔排堂食 |
| 美瑛青池 | 2026–27今季12月16:30起亮燈；冬季主打雪地燈光，唔保證睇到夏天藍水 |
| 聖誕樹之木 | 官方現行資料列2025/11/29起樹前路段步行觀看、車輛禁停、建議接駁；2026冬季安排需再確認，唔當直接自駕停車影相點 |
| 旭山動物園 | 今次日期冬季10:30–15:30，末入園15:00；**企鵝散步要積雪足夠，唔保證12月中已有** |
| 四季彩之丘 | 官網有冬季雪上活動，14–15日是否已開未確認；唔用冬季宣傳頁保證日期 |
| 富良野芝士工房 | 11–3月9:00–16:00；手作項目另查預約。16日要早出發去Moving Inn，唔預設等工房開門後先走 |
| 幽泉閣 | 滑雪後近民宿溫泉；官方日歸10:00–21:30、末受付21:00，星期一延至12:00開 |
| 珠寶冰／冰上釣公魚 | 珠寶冰通常1月中後，公魚通常12月下旬後按結冰情況；**唔列作16日保證活動** |

住宿參考：SISUMO官方列三睡房，其中一間四張單人床，另兩間各一張雙人床；Spoon Valley ザワザワ村每棟最多4成人，與另一分館「タンネの小道」嘅價錢及房型唔混用。

主要官方入口：

- [Moving Inn](https://moving-inn.com/)／[河畔桑拿](https://moving-inn.com/activity/riversidesauna)
- [Spoon Valley價格／日曆](https://spoonvalley.com/reservation/)／[SISUMO昆布](https://sisumo.jp/kombu)
- [美瑛町亮燈公告](https://www.town.biei.hokkaido.jp/culture/event/illuminate.html)
- [廣尾Santa Land](https://www.santaland.or.jp/illumination/)／[晩成溫泉町公所資料](https://www.town.taiki.hokkaido.jp/choseijoho/taikichonitsuite/3/1151.html)
- [六花亭帶廣地區](https://www.rokkatei.co.jp/shop/obihiro/)／[旭山動物園2026日曆](https://www.city.asahikawa.hokkaido.jp/asahiyamazoo/event/event202601.html)

其他來源以 `assets/itinerary-data.js` 各活動連結為準；優先用官方資料，分清舊年度頁面與今季公布日期。

## 7. 預算規則：唔好改錯分攤

**價格唔係全部只放喺data檔。** `index.html` 有原始表格及說明，`itinerary.js` 嘅 `calculate()` 有實際常數，`itinerary-data.js` 酒店也有價格文案。改價要同步檢查三處。

函數：

```js
window.FIXED_TRIP.calculate({
  couple: 1000, // 夫婦17日住宿，兩人全晚HK$，預留而非報價
  transfer: 0,  // 夫婦兩人交通HK$，0代表未加入
  ski: 0,       // 每位滑雪男士額外費用HK$，唔乘到夫婦
  extras: 0,    // 全六人其他活動總額HK$，按六人分
  two: false,  // Spoon夫婦一棟＋四人一棟，按所住棟別分攤
  river: false // 額外預留六人河畔桑拿，唔代表已訂
});
// 回傳 { man, pair, group, riverTotal }；man/pair均為每人
```

- 匯率沿用使用者表格：`¥1 = HK$0.051`，唔靜默換成之前版本嘅0.05。
- 四位男士七晚住宿約HK$6,797／人；夫婦五晚由四個共同住宿晚數＋17日另住組成。
- SISUMO HK$6,273係四人**兩晚總額**，唔好再乘二。
- Spoon原表每人HK$1,479；兩棟模式下夫婦各¥29,000即HK$1,479，四位男士各¥27,000即HK$1,377。呢個係一般價及房型比較，未確認兩棟空房。
- 河畔桑拿預留為每人HK$510，六人約HK$3,060；避免同訂房方案已包內容重複計。
- 金額係浮點運算，驗證用容差，顯示再四捨五入，唔用嚴格相等比較 `10000 * .051`。
- 主要守恆：**`group = 4 * man + 2 * pair`**。
- 只加每名男士滑雪費HK$1,000，group應加HK$4,000、pair不變；兩棟Spoon模式，man減HK$102、pair不變、group減HK$408。
- 未填嘅機票、租車、油費、高速費、滑雪／課堂、額外餐飲及入浴費未計。0唔係「免費」。

## 8. 近年天氣／積雪資料

原始研究查核日2026-10-12；2026-10-19將介面獨立到 `climate.html`，**冇因此重新下載或更新數據**。

- 來源日本氣象廳JMA，2021–2025各年12/13–20，每站40筆；11站共440筆。
- 可切換滑雪日期12/18–19（每站最多10筆）、五年或單一年份。
- 觀測站：倶知安、富良野、美瑛、占冠、旭川、札幌、小樽、登別、千歲、小金湯、新得。
- **未包括大樹町。唔用占冠／新得站冒充Moving Inn雪況。** 如果補研究，另找合適當地觀測及註明距離／高度差。
- 歷史積雪日數唔係未來落雪概率；城鎮觀測站亦唔係酒店門口、山上雪道或滑雪開放保證。
- `weather-data.js` 含逐日數字、原始字串、觀測站資料及每站逐年月表URL；CSV亦保留來源。

現行統計口徑：

1. 平均積雪深度＝**每日最深積雪**嘅平均，唔係全日連續積雪高度。
2. 「有積雪記錄」＝每日最大值≥1cm；≥10cm另列日數，唔係雪場營運門檻。
3. 新雪合計先逐年加總選定日期，再平均**資料完整年份**；唔把缺測補零，亦唔將零碎年份按比例放大。
4. 氣溫為日最高／日最低嘅平均，唔係期間極端值。
5. JMA `--`無現象按0；空白、未觀測、缺測、附 `)`／`]`等品質符號嘅值在本版排除。原值仍保留；0可能含不足1cm，唔等同完全冇雪。
6. 千歲2022/12/18、登別2025/12/20有品質符號；小金湯冇氣溫值，唔借別站填補。

`window.TRIP_SNOW.stats(stationId, 'trip'|'ski', 'all'|'2025'...)` 可查看統計。現行積雪頁需保留空 `#detail` dialog及 `climate-bridge.js` 提供嘅 `window.TRIP_APP`相容介面，避免沿用函數缺DOM而出錯。

## 9. 檢查方式與已知驗證界限

無 `package.json`／`npm test`／正式測試框架。上一輪有在工作環境做模擬DOM／Leaflet功能檢查，但**該測試腳本冇提交到repo**，唔依賴其他LLM見唔到嘅暫存路徑。

可由乾淨checkout執行嘅語法檢查：

```bash
node --check assets/itinerary.js
node --check assets/itinerary-data.js
node --check assets/weather.js
node --check assets/weather-data.js
node --check assets/climate-bridge.js
```

以下只檢查資料一致性，唔會啟動伺服器或瀏覽器，亦唔等同UI測試：

```bash
node <<'JS'
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const context = { window: {} };
vm.createContext(context);
for (const file of ['assets/itinerary-data.js', 'assets/weather-data.js']) {
  vm.runInContext(fs.readFileSync(file, 'utf8'), context);
}
const trip = context.window.ITINERARY_DATA;
const weather = context.window.TRIP_WEATHER;
assert.equal(trip.hotels.length, 5);
assert.equal(trip.bases.length, 6);
assert.equal(trip.days.length, 8);
assert.equal(trip.activities.length, 25);
assert.equal(trip.days.find(d => d.day === 16).hotel, 'moving');
assert.equal(trip.days.find(d => d.day === 19).hotel, 'granbell');
const activityIds = new Set(trip.activities.map(a => a.id));
assert.equal(activityIds.size, trip.activities.length);
for (const day of trip.days) {
  assert(!day.hotel || trip.hotels.some(h => h.id === day.hotel));
  for (const id of day.picks) assert(activityIds.has(id));
}
for (const a of trip.activities) {
  assert(a.url.startsWith('https://'));
  assert(a.coords && a.coords.length === 2);
  assert(a.coords[0] > 41 && a.coords[0] < 46);
  assert(a.coords[1] > 139 && a.coords[1] < 145);
  for (const base of a.bases) {
    assert(trip.bases.some(b => b.id === base));
    assert(a.drive[base][0] >= 0);
    assert(a.drive[base][1] >= a.drive[base][0]);
    assert(a.drive[base][1] <= 120);
  }
}
assert.equal(weather.stations.length, 11);
assert.equal(weather.stations.reduce((n, s) => n + s.days.length, 0), 440);
console.log('Data consistency OK');
JS
```

新增或刪除活動／觀測站時，要按有意改動調整上述數量斷言，唔為通過舊數量而刪走新資料。

涉及功能修改，至少再檢查：

- 三主頁分頁、六基地、車程／安排方式篩選、空結果、分頁上下界、手機每頁2張。
- 點標記選卡、卡片定位、官方及Google Maps連結、dialog關閉、鍵盤左右鍵切換。
- 地圖不可用時仍可讀資料；切換隱藏頁籤後地圖尺寸正確。
- Moving Inn仍在16日、19日仍為原札幌酒店、17日分隊費用沒有漏計。
- 上節4＋2預算守恆及活動增額；積雪頁年份／日期／觀測站及缺測處理。
- HTML無重複ID、所有相對檔案與CSS／JS引用存在、舊 `proposal.html`連結仍可到主頁。

**沒有做實際瀏覽器畫面驗證。** 模擬DOM檢查唔代表已驗證視覺、真實Leaflet互動或所有裝置。後續按環境可用工具做瀏覽器QA；缺工具就如實說明，唔宣稱做過截圖／真機測試。

## 10. 發布與後續工作

### 發布

- 本repo已由GitHub Pages以 `main`根目錄發布，唔需要Cloudflare、Sites重新註冊或其他hosting。
- 真正Git checkout可用正常commit／push流程；唔假設LLM工作資料夾一定有 `.git` 或已同步遠端。
- 若用GitHub connector：先讀 `refs/heads/main`取得head，再讀commit嘅tree；用base tree建立只包含所需改動嘅新tree，create commit以舊head為parent，update ref時帶 `expected_sha`、`force:false`。
- 分支已變動就重新讀取及整合，唔強推。保留未修改檔案及`.nojekyll`。
- 如有網站檔案改動，確認同一commit嘅Pages工作流程成功，並檢查公開HTML／新資產已更新；單獨改文件則核對遠端README即可。
- 唔把暫存測試、地理查詢快取、個人相片、憑證或無關資料加入repo。

### 真正未確認事項

1. 夫婦18日、四人20日航班時間，13日最後抵達時間。
2. Moving Inn確實分館、六人所訂單位、床位、包餐及已包設施；16日河畔桑拿場次。
3. Spoon Valley棟數、四張獨立床、付款／餐飲與實際空房。
4. 17日夫婦住宿及分隊交通，是否接受目前千歲附近分隊安排。
5. 四人滑雪程度、ski／snowboard、課堂語言、器材、18–19日實際雪道開放。
6. 冬季營業／接駁／活動開始日期，尤其聖誕樹之木、企鵝散步及四季彩之丘。
7. 真實瀏覽器及手機畫面驗證。

下一個LLM應以新要求為先；以上係已知空白，唔代表要一次過擴大成訂房、購票、聯絡或長期監察任務。保持原路線，將活動變成容易選擇、理解車程及知道限制嘅資訊。
