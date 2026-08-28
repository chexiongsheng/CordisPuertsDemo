using System;
using UnityEngine;
using Puerts;

/// <summary>
/// cordis 插件化内存管理 demo：商城 / 邮件 / 排行三个系统的开关与内存回收。
///
/// 把本脚本挂到场景中任意 GameObject 上运行，点击按钮打开/关闭对应系统。
/// 每帧调用 env.Backend.LowMemoryNotification() 强制 V8 GC 并刷新 heap 读数——
/// 打开系统 used 立即跳涨，关闭系统下一帧立即回落，实时可见。
/// 过程日志与哨兵报告全部走 Debug.Log（Unity Console）。
/// </summary>
public class CordisDemo : MonoBehaviour
{
    private ScriptEnv env;
    private Action<float> jsOnUpdate; // game.onUpdate 委托缓存，避免每帧 Eval 字符串
    private string heapDisplay = "V8 heap: 读取中...";
    private string moduleStatsDisplay = "模块缓存: 读取中...";
    private bool shopOpen;
    private bool mailOpen;
    private bool rankOpen;
    private int reportCountdown; // 系统关闭后延迟打哨兵报告的帧数
    private GUIStyle titleStyle;
    private GUIStyle statsStyle;

    void Start()
    {
        env = new ScriptEnv(new BackendV8());
        
        // enable commonjs require
        env.ExecuteModule("puerts/module.mjs");
        env.Eval(@"globalThis.require = puer.module.createRequire('');");
        // 供 game.cjs 按需动态加载系统模块（不经 webpack 静态依赖）；
        // 模块缓存为 WeakRef（见 puerts/module.mjs），无引用时整个模块可被 GC 卸载
        env.Eval(@"globalThis.lazyRequire = puer.module.createRequire('');");

        env.Eval(@"globalThis.game = require('game.cjs');");
        jsOnUpdate = env.Eval<Action<float>>(@"game.onUpdate");
        Debug.Log("[C#] PuerTS 就绪，game.cjs 已加载。点击按钮打开/关闭系统");
    }

    void Update()
    {
        if (env == null) return;
        // 驱动 V8 message loop：setInterval/setTimeout 回调依赖每帧 Tick
        env.Tick();

        // 广播 update 事件：各打开系统的场景表现（旋转立方体）由其插件内部驱动
        if (jsOnUpdate != null) jsOnUpdate(Time.deltaTime);

        // 每帧强制 V8 GC 并刷新 heap 读数：
        // 打开系统 used 立即跳涨，关闭系统下一帧立即回落
        env.Backend.LowMemoryNotification();
        try { heapDisplay = "V8 heap: " + env.Eval<string>("game.heapStats()"); }
        catch { /* 模块未就绪时忽略 */ }

        // 每帧刷新 PuerTS 模块缓存表：系统关闭后对应 .cjs 的 valid? 变 false
        try { moduleStatsDisplay = env.Eval<string>("game.moduleCacheStats()"); }
        catch { /* 模块未就绪时忽略 */ }

        // 系统关闭后延迟两帧输出哨兵报告（跨过 V8 keptObjects 的 job 边界）
        if (reportCountdown > 0 && --reportCountdown == 0)
        {
            try { Debug.Log("[C#] 哨兵报告：\n" + env.Eval<string>("game.gcReport()")); }
            catch { }
        }
    }

    void OnDestroy()
    {
        if (env != null)
        {
            env.Dispose();
            env = null;
        }
    }

    private void Toggle(string name)
    {
        try
        {
            env.Eval(string.Format("game.toggleSystem('{0}')", name));
            // toggle 是 async 的，但 Eval 返回前 PuerTS 已 drain 完 microtask，
            // 此时开关已生效，直接读最终状态
            bool open = env.Eval<bool>(string.Format("game.isSystemOpen('{0}')", name));
            if (name == "shop") shopOpen = open;
            else if (name == "mail") mailOpen = open;
            else rankOpen = open;
            if (!open) reportCountdown = 2;
        }
        catch (Exception e) { Debug.Log("[C#] toggle 异常: " + e.Message); }
    }

    void OnGUI()
    {
        if (titleStyle == null)
        {
            titleStyle = new GUIStyle(GUI.skin.label);
            titleStyle.fontStyle = FontStyle.Bold;
            titleStyle.fontSize = 15;
        }
        if (statsStyle == null)
        {
            statsStyle = new GUIStyle(GUI.skin.textArea);
            statsStyle.wordWrap = false;
        }

        GUILayout.BeginArea(new Rect(10, 10, 560, Screen.height - 20), GUI.skin.box);
        GUILayout.Label("cordis 游戏系统 · 插件化内存管理", titleStyle);
        GUILayout.Label(heapDisplay);

        GUILayout.BeginHorizontal();
        if (GUILayout.Button(shopOpen ? "关闭商城" : "打开商城", GUILayout.Height(40))) Toggle("shop");
        if (GUILayout.Button(mailOpen ? "关闭邮件" : "打开邮件", GUILayout.Height(40))) Toggle("mail");
        if (GUILayout.Button(rankOpen ? "关闭排行" : "打开排行", GUILayout.Height(40))) Toggle("rank");
        GUILayout.EndHorizontal();

        GUILayout.Label("PuerTS 模块缓存：");
        GUILayout.TextArea(moduleStatsDisplay, statsStyle, GUILayout.Height(90));

        GUILayout.Label("过程日志见 Unity Console（Debug.Log）");
        GUILayout.EndArea();
    }
}
