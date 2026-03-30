/** コア `termId`（英字 snake）→ 表示用（暦書表記） */
const SOLAR_TERM_LABELS: Record<string, string> = {
  lichun: "立春",
  yushui: "雨水",
  jingzhe: "啓蟄",
  chunfen: "春分",
  qingming: "清明",
  guyu: "穀雨",
  lixia: "立夏",
  xiaoman: "小満",
  mangzhong: "芒種",
  xiazhi: "夏至",
  xiaoshu: "小暑",
  dashu: "大暑",
  liqiu: "立秋",
  chushu: "処暑",
  bailu: "白露",
  qiufen: "秋分",
  hanlu: "寒露",
  shuangjiang: "霜降",
  lidong: "立冬",
  xiaoxue: "小雪",
  daxue: "大雪",
  dongzhi: "冬至",
  xiaohan: "小寒",
  dahan: "大寒",
};

export function solarTermLabel(termId: string | null | undefined): string {
  if (!termId) return "（未特定の節気）";
  return SOLAR_TERM_LABELS[termId] ?? termId;
}
