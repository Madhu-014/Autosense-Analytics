(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/ChartPreview.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ChartPreview
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$echarts$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/echarts/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$echarts$2f$lib$2f$core$2f$echarts$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/echarts/lib/core/echarts.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$echarts$2f$lib$2f$export$2f$api$2f$graphic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__graphic$3e$__ = __turbopack_context__.i("[project]/node_modules/echarts/lib/export/api/graphic.js [app-client] (ecmascript) <export * as graphic>");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function ChartPreview() {
    _s();
    const chartRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ChartPreview.useEffect": ()=>{
            const chart = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$echarts$2f$lib$2f$core$2f$echarts$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["init"](chartRef.current);
            chart.setOption({
                backgroundColor: "transparent",
                tooltip: {},
                xAxis: {
                    type: "category",
                    data: [
                        "Mon",
                        "Tue",
                        "Wed",
                        "Thu",
                        "Fri",
                        "Sat",
                        "Sun"
                    ],
                    axisLabel: {
                        color: "#fff"
                    }
                },
                yAxis: {
                    type: "value",
                    axisLabel: {
                        color: "#fff"
                    }
                },
                series: [
                    {
                        type: "line",
                        smooth: true,
                        data: [
                            120,
                            200,
                            150,
                            320,
                            480,
                            350,
                            600
                        ],
                        itemStyle: {
                            color: "#6366f1"
                        },
                        areaStyle: {
                            color: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$echarts$2f$lib$2f$export$2f$api$2f$graphic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__graphic$3e$__["graphic"].LinearGradient(0, 0, 0, 1, [
                                {
                                    offset: 0,
                                    color: "rgba(99,102,241,0.5)"
                                },
                                {
                                    offset: 1,
                                    color: "rgba(99,102,241,0.1)"
                                }
                            ])
                        }
                    }
                ]
            });
            const resize = {
                "ChartPreview.useEffect.resize": ()=>chart.resize()
            }["ChartPreview.useEffect.resize"];
            window.addEventListener("resize", resize);
            return ({
                "ChartPreview.useEffect": ()=>{
                    window.removeEventListener("resize", resize);
                    chart.dispose();
                }
            })["ChartPreview.useEffect"];
        }
    }["ChartPreview.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: chartRef,
        style: {
            height: 300
        }
    }, void 0, false, {
        fileName: "[project]/components/ChartPreview.js",
        lineNumber: 49,
        columnNumber: 10
    }, this);
}
_s(ChartPreview, "X+1SfQQ6xefXNU27aQW843M7cTw=");
_c = ChartPreview;
var _c;
__turbopack_context__.k.register(_c, "ChartPreview");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ChartPreview.js [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/components/ChartPreview.js [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=components_ChartPreview_3efb7d98.js.map