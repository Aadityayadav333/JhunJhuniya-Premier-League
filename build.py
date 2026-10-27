#!/usr/bin/env python3
"""Bundle src/*.js into one classic script (game.bundle.js) so index.html works by double-click (no server)."""
import re, os
here = os.path.dirname(os.path.abspath(__file__))
order = ['data','lines','audio','compat','physics','ai','characters','stadium','world','ui','game','play','main']
out = ["/* JhunJhuniya Premier League - bundled build. Edit files in /src and run: python3 build.py */\n(function(){\n'use strict';\nconst THREE = window.THREE; const __M = {};\n"]
for name in order:
    s = open(os.path.join(here, 'src', name + '.js'), encoding='utf-8').read()
    s = re.sub(r"import\s+\*\s+as\s+THREE\s+from\s+'three';\n?", '', s)
    def imp(m):
        names = [n.strip() for n in m.group(1).split(',') if n.strip()]
        names = [n.replace(' as ', ': ') for n in names]
        return "const { %s } = __M.%s;" % (', '.join(names), m.group(2))
    s = re.sub(r"import\s*\{([^}]*)\}\s*from\s*'\./(\w+)\.js';", imp, s)
    s = re.sub(r"import\s+'\./\w+\.js';\n?", '', s)
    exports = []
    def exp(m):
        exports.append(m.group(2)); return m.group(1) + ' ' + m.group(2) if m.group(1) != 'async function' else 'async function ' + m.group(2)
    s = re.sub(r"^export\s+(const|let|function|class|async function)\s+(\w+)", exp, s, flags=re.M)
    out.append("\n/* ---- %s ---- */\n__M.%s = (function(){\n%s\nreturn { %s };\n})();\n" % (name, name, s, ', '.join(exports)))
out.append("})();\n")
open(os.path.join(here, 'game.bundle.js'), 'w', encoding='utf-8').write(''.join(out))
print('built game.bundle.js', sum(len(x) for x in out), 'bytes')
