module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/lib/supabase/server.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createClient",
    ()=>createClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/module/index.js [app-route] (ecmascript) <locals>");
;
async function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseServiceKey) {
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!supabaseUrl || !anonKey) {
            throw new Error("Missing Supabase URL and keys");
        }
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, anonKey);
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseServiceKey);
}
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/app/api/games/[gameId]/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/server.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
;
async function GET(request, { params }) {
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createClient"])();
    const gameId = Number(params.gameId);
    console.log("[API] requested gameID:", gameId);
    try {
        // 1️⃣ fetch main game first
        const { data: game, error: gameError } = await supabase.from("games").select("*").eq("gameid", gameId).single();
        if (gameError || !game) {
            console.error("[API] game not found:", gameError);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Game not found"
            }, {
                status: 404
            });
        }
        // 2️⃣ fetch related tables safely
        const [{ data: charactersRaw }, { data: mapsRaw }, { data: mobsRaw }, { data: arcsRaw }, { data: contributorsRaw }] = await Promise.all([
            supabase.from("games_characters").select(`
          characterid,
          ingamecharacters (
            characterName,
            backstory,
            englishVA,
            japaneseVA,
            motionCapture,
            description,
            spriteURL
          )
        `).eq("gameid", gameId).maybeSingle(),
            supabase.from("maps").select(`
          mapid,
          mapname,
          floorname,
          description,
          mapurl
        `).eq("gameid", gameId),
            supabase.from("mobs").select(`
          mobid,
          mobname,
          mobtype,
          description,
          weakness,
          mobspriteurl,
          spawnnotes
        `).eq("gameid", gameId),
            supabase.from("storyarcs").select(`
          storyarcid,
          parentarcid,
          arctitle,
          arcorder,
          summary,
          description,
          ismainarc
        `).eq("gameid", gameId),
            supabase.from("games_contributors").select(`
          contributorid,
          roleid,
          contributors (
            contributorName,
            specialization
          ),
          roles (
            roleName
          )
        `).eq("gameid", gameId)
        ]);
        // 3️⃣ map characters safely
        const characters = (charactersRaw ? [
            charactersRaw
        ] : []).map((c)=>({
                characterID: c.characterid,
                characterName: c.ingamecharacters?.characterName || "Unknown",
                backstory: c.ingamecharacters?.backstory || ""
            }));
        // 4️⃣ map contributors safely
        const contributors = (contributorsRaw || []).map((c)=>({
                contributorID: c.contributorid,
                contributorName: c.contributors?.contributorName || "Unknown",
                specialization: c.contributors?.specialization || "",
                role: c.roles?.roleName || ""
            }));
        // 5️⃣ return safe JSON
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            gameID: game.gameid,
            title: game.title,
            plotSummary: game.plotsummary || "",
            releaseDate: game.releasedate,
            gameCoverURL: game.gamecoverurl || "",
            gameLogoURL: game.gamelogourl || "",
            multiplayerSupport: game.multiplayersupport || false,
            characters,
            maps: mapsRaw || [],
            mobs: mobsRaw || [],
            storyArcs: arcsRaw || [],
            contributors
        }, {
            status: 200
        });
    } catch (error) {
        console.error("[API] Failed to fetch game details:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to fetch game details"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__de7d48ab._.js.map