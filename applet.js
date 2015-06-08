const Lang = imports.lang;
const Applet = imports.ui.applet;
const PopupMenu = imports.ui.popupMenu;
const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;
const St = imports.gi.St;
const Gettext = imports.gettext.domain('cinnamon-applets');
const _ = Gettext.gettext;
const AppletDir = imports.ui.appletManager.applets['daemon-info@bluec0re.eu'];

const Mainloop = imports.mainloop;

const TerminalReader = AppletDir.lib.TerminalReader;
const bind = AppletDir.lib.bind;
const PortList = AppletDir.portlist.PortList;


function DaemonInfo(metadata, orientation) {
    this.metadata = metadata;
    this._init(orientation);
}

DaemonInfo.prototype = {
    __proto__: Applet.TextIconApplet.prototype,

    _init: function(orientation) {
        Applet.TextIconApplet.prototype._init.call(this, orientation);
        this._orientation = orientation;

        try {
            this.set_applet_icon_name(this.metadata.icon);
            this._updateLabel();

            this.menuManager = new PopupMenu.PopupMenuManager(this);
            this._initMenu();

            this._portList = new PortList();
            this._portListArea = new St.BoxLayout({name: 'portListArea'});
            this._portListArea.add(this._portList.actor);
            this.menu.addActor(this._portListArea);
            this._portListArea.show_all();
        } catch(e) {
            global.logError(e);
        }
    },

    _updateLabel: function() {
        let self = this;
        let tr = new TerminalReader('/usr/bin/ss -ltun', function(cmd, success, result) {
            let lines = result.split('\n');
            let totalPorts = 0;
            let localPorts = 0;
            let globalPorts = 0;
            let udpPorts = 0;
            let tcpPorts = 0;
            for(let i = 1; i < lines.length; i++) {
                if(lines[i].length > 1 || lines[i].indexOf('LISTEN') >= 0) {
                    totalPorts++;
                    if(lines[i].indexOf('127.0.0.1') >= 0 || lines[i].indexOf('::1') >= 0) {
                        localPorts++;
                    } else {
                        globalPorts++;
                    }
                    if(lines[i].indexOf('udp') >= 0) {
                        udpPorts++;
                    }
                    if(lines[i].indexOf('tcp') >= 0) {
                        tcpPorts++;
                    }
                }
            }
            self.set_applet_label("" + totalPorts + ' (' + globalPorts + 'g,' + localPorts + 'l,' + tcpPorts + 't,' + udpPorts + 'u)');
        });
        tr.executeReader();
        this._timeoutId = Mainloop.timeout_add(2000, bind(this._updateLabel, this));
    },

    on_applet_clicked: function(event) {
        this.menu.toggle();
    },

    on_applet_remove_from_panel: function() {
        if(this._timeoutId) {
            Mainloop.source_remove(this._timeoutId);
        }
    },

    _initMenu: function() {
        if(this._portListArea) this._portListArea.unparent();
        if(this.menu) this.menuManager.removeMenu(this.menu);

        this.menu = new Applet.AppletPopupMenu(this, this._orientation);
        this.menuManager.addMenu(this.menu);

        if(this._portListArea) {
            this.menu.addActor(this._portListArea);
            this._portListArea.show_all();
        }

        this.menu.connect('open-state-changed', Lang.bind(this, function(menu, isOpen) {
            if(isOpen) {
                this._portList.update();
            }
        }));
    }
}

function main(metadata, orientation) {
    let applet = new DaemonInfo(metadata, orientation);
    return applet;
}
