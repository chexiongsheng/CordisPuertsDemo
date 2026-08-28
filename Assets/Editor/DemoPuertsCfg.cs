using System;
using System.Collections.Generic;
using Puerts;

/// <summary>
/// PuerTS configuration for demo-specific C# types (outside the PuertsAgent package).
/// These types are in Assembly-CSharp and need their own [Configure] class.
/// Run "Tools > PuerTS > Generate index.d.ts" in Unity Editor to regenerate.
/// </summary>
[Configure]
public class DemoPuertsCfg
{
    [Typing]
    static IEnumerable<Type> Typings
    {
        get
        {
            return new List<Type>()
            {
                // 商城/邮件/排行系统的场景表现：创建、摆放、旋转、销毁立方体
                typeof(UnityEngine.GameObject),      // CreatePrimitive / name / transform
                typeof(UnityEngine.PrimitiveType),   // CreatePrimitive 参数（Cube）
                typeof(UnityEngine.Transform),       // position / Rotate
                typeof(UnityEngine.Vector3),         // 位置坐标
                typeof(UnityEngine.Object),          // Destroy 静态方法
            };
        }
    }
}
