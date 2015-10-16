const St = imports.gi.St;
const AppletDir = imports.ui.appletManager.applets['daemon-info@bluec0re.eu'];
const TerminalReader = AppletDir.lib.TerminalReader;

function PortList() {
    this._init();
}

PortList.prototype = {
    _init: function() {
        this.actor = new St.Table({
            homogeneous: false
        });
        this.actor.set_style('padding: 20px');
    },

    update: function() {
        this.actor.destroy_children();
        let actor = this.actor;

        actor.add(new St.Label({text: 'Protocol', style: 'padding-right: 5px'}), {row: 0, col: 0});
        actor.add(new St.Label({text: 'Address', style: 'padding-right: 5px; padding-left: 5px'}), {row: 0, col: 1});
        actor.add(new St.Label({text: 'Port', style: 'padding-right: 5px; padding-left: 5px'}), {row: 0, col: 2});
        actor.add(new St.Label({text: 'Exe', style: 'padding-left: 5px'}), {row: 0, col: 3});

        let tr = new TerminalReader('/usr/bin/ss -ltunp', function(cmd, success, result) {
            let lines = result.split('\n');
            for(let i = 1; i < lines.length; i++) {
                let line = lines[i];
                line = line.replace(/ +/g, ' ').split(' ');
                let proto = line[0];
                let state = line[1];
                let recv = line[2];
                let send = line[3];
                let laddr = line[4].split(':');
                if(laddr.length > 2) {
                    let port = laddr.pop();
                    laddr = [laddr.join(':'), port];
                }
                let raddr = line[5].split(':');
                if(raddr.length > 2) {
                    let port = raddr.pop();
                    raddr = [raddr.join(':'), port];
                }
                let exe = '';
                if(line.length > 5)
                    exe = line[6];

                actor.add(new St.Label({text: proto, style: 'padding-right: 5px'}), {row: i, col: 0});
                actor.add(new St.Label({text: laddr[0], style: 'padding-right: 5px; padding-left: 5px'}), {row: i, col: 1});
                actor.add(new St.Label({text: laddr[1], style: 'padding-right: 5px; padding-left: 5px'}), {row: i, col: 2});
                actor.add(new St.Label({text: exe, style: 'padding-left: 5px'}), {row: i, col: 3});
            }

            for(let child of actor.get_children()) {
                child.get_children()[0].set_style('padding-left: 1em; padding-right: 1em;');
            }
        });
        tr.executeReader();
    }
};
