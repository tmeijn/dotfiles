import GObject from 'gi://GObject';
import Shell from 'gi://Shell';
// local modules
import { readShader } from '../utils/file.js';
// ------------------------------------------------------------------- [imports]
const [declarations, code] = readShader(import.meta.url, 'shader/clip_shadow.frag');
export const ClipShadowEffect = GObject.registerClass({}, class extends Shell.GLSLEffect {
    vfunc_build_pipeline() {
        const hook = Shell.SnippetHook.FRAGMENT;
        this.add_glsl_snippet(hook, declarations, code, false);
    }
    vfunc_paint_target(node, ctx) {
        // Reset to default blend string.
        this.get_pipeline()?.set_blend('RGBA = ADD(SRC_COLOR, DST_COLOR*(1-SRC_COLOR[A]))');
        super.vfunc_paint_target(node, ctx);
    }
});
