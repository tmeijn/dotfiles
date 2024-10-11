import GLib from 'gi://GLib';


export default class BatteryUtil {

    constructor(callback) {
        this._bat_path = [];    // Path to batteries for cat
        this._find_batteries();
    }

    get available(){
        return (this._bat_path[0]) ? true : false;
    }

    get energy() {
        let features = []
        this._bat_path.forEach((bat_path) => {
            let energy = parseFloat(this._get_sensor_data(bat_path, "energy_now"));
            energy /= 1000000.00;

            let bat_name = bat_path.split('/').pop();
            let feature = {
                label: bat_name + " Energy",
                ["power"]: energy
            };
            features.push(feature);
        });
        return features;
    }

    get power() {
        let features = [];
        this._bat_path.forEach((bat_path) => {
            let power = parseFloat(this._get_sensor_data(bat_path, "power_now"));
            power /= 1000000.00;

            let state = this._get_sensor_data(bat_path, "status");
            if (state.startsWith("Dis"))
                power *= -1;

            let bat_name = bat_path.split('/').pop();
            let feature = {
                label: bat_name + " Power",
                ["power"]: power
            };
            features.push(feature);
        })
        return features;
    }

    get voltage() {
        let features = [];
        this._bat_path.forEach((bat_path) => {
            let voltage = parseFloat(this._get_sensor_data(bat_path, "voltage_now"));
            voltage /= 1000000.00;

            let bat_name = bat_path.split('/').pop();
            let feature = {
                label: bat_name + " Voltage",
                ["volt"]: voltage
            };
            features.push(feature);
        })
        return features;
    }


    destroy(callback) {
        this._bat_path = [];
    }

    execute(callback) {
    }

    _find_batteries() {
        const cmd = `find /sys/class/power_supply/ -type l -name "BAT*"`
        let cmd_res = []
        try {
            cmd_res = GLib.spawn_command_line_sync(cmd)
        } catch (e) {
            logError(e, `[FREON] failed to execute "find"`)
        }
        if (cmd_res[0] == true) {
            this._bat_path = new TextDecoder().decode( cmd_res[1] ).split('\n')
            let trailing_path = this._bat_path.pop()
            if (trailing_path.length > 1)   // remove empty trailing Elements
                this._bat_path.push(trailing_path)
        }
        else {
            print(`"find" returned an error: ${cmd_res[2]}`)
        }
    }

    _get_sensor_data(bat_path, sensor) {
        const path = `${bat_path}/${sensor}`
        const cmd = "cat " + path;

        let cmd_res = []
        try {
            cmd_res = GLib.spawn_command_line_sync(cmd)
        } catch (e) {
            logError(e, `[FREON] failed to execute "cat"`)
        }
        if (cmd_res[0] == true)
            return new TextDecoder().decode(cmd_res[1])
        else
            return ""
    }

};
