using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Puerts;

public class CordisSmoke : MonoBehaviour
{
    // Start is called before the first frame update
    void Start()
    {
        // enable commonjs require
        var env = new ScriptEnv(new BackendV8());
        env.ExecuteModule("puerts/module.mjs");
        env.Eval(@"globalThis.require = puer.module.createRequire('');");

        env.Eval(@"
            const app = require('smoke.cjs');
            app.smoke();
        ");
        env.Dispose();
    }

    // Update is called once per frame
    void Update()
    {
        
    }
}
