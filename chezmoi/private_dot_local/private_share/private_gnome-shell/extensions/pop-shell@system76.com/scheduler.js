import * as log from './log.js';
import Gio from 'gi://Gio';
const SchedulerInterface = '<node>\
<interface name="com.system76.Scheduler"> \
    <method name="SetForegroundProcess"> \
        <arg name="pid" type="u" direction="in"/> \
    </method> \
</interface> \
</node>';
const SchedulerProxy = Gio.DBusProxy.makeProxyWrapper(SchedulerInterface);
const SchedProxy = new SchedulerProxy(Gio.DBus.system, 'com.system76.Scheduler', '/com/system76/Scheduler');
let foreground = 0;
let failed = false;
export function setForeground(win) {
    if (failed)
        return;
    const pid = win.get_pid();
    if (pid) {
        if (foreground === pid)
            return;
        foreground = pid;
        try {
            SchedProxy.SetForegroundProcessRemote(pid, (_result, error, _fds) => {
                if (error !== null)
                    errorHandler(error);
            });
        }
        catch (error) {
            errorHandler(error);
        }
    }
}
function errorHandler(error) {
    log.warn(`system76-scheduler may not be installed and running: ${error}`);
    failed = true;
}
