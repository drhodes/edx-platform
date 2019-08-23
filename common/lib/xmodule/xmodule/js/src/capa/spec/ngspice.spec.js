var cktsim = require('../schematic');
const fs = require('fs');
const {spawnSync} = require('child_process');
const sop = require('./spice-output-parsing');
const {ComparableTable} = require('./comparable-table');

let circuit_data = [
    ['v', [144, 64, 0], {name: '', value: 'sin(0,1,1,0,0)', _json_: 0}, ['1', '0']],
    ['r', [216, 64, 0], {r: '1', _json_: 1}, ['1', '0']],
    ['w', [216, 64, 144, 64]],
    ['s', [216, 64, 0], {color: 'cyan', offset: '0', _json_: 3}, ['1']],
    ['g', [184, 112, 0], {_json_: 4}, ['0']],
    ['w', [144, 112, 184, 112]],
    ['w', [216, 112, 184, 112]],
    ['view', 29.159999999999997, 12.792000000000002, 2.44140625, '50', '10', '1G', null, '100', '1', '1000'],
];

// http://ngspice.sourceforge.net/docs/ngspice-manual.pdf
// .tran tstep tstop <tstart <tmax>> <uic>

let example_spice = ` 
* shematic.js 
R__1 0 net_0 1 
V__0 0 net_0 DC SIN(0 1 1 0 0) 

.op
.control 

*tran 1s 1s 
tran 1n 100n 
echo "start delimeter net_0" 
print net_0 
echo "end delimeter net_0" 
.endc 
`;

describe('cktsim: shell out to ngspice', function() {
    it('should create ngspice subprocess with exit code 0', function() {
        let options = {input: example_spice};
        let subp = spawnSync('ngspice', ['-b'], options);
        if (subp.status == 0) {
            //console.log(subp.stdout);
        } else {
            //console.log(`stdout: ${subp.stdout}`);
            //console.log(`stderr: ${subp.stderr}`);
        }
        expect(subp.status).toEqual(0);
    });
});

// ngspice output, need to parse this.
// Index   time            net_0
// --------------------------------------------------------------------------------
// 9277	9.270280e-01	4.426005e-01
// 9278	9.271280e-01	4.420370e-01
// 9279	9.272280e-01	4.414733e-01
// 9280	9.273280e-01	4.409094e-01
// 9281	9.274280e-01	4.403454e-01

describe('ngspice: parse transient output construct spice reco', function() {
    it('should create ngspice subprocess and process the stdout', function() {
        let options = {input: example_spice};
        let subp = spawnSync('ngspice', ['-b'], options);
        if (subp.status == 0) {
            let output = `${subp.stdout}`;
            let spice_records = sop.parse_ngspice_output(output);
            expect(spice_records).not.toEqual({});
        } else {
            console.log(`stderr: ${subp.stderr}`);
        }
        expect(subp.status).toEqual(0);
    });
});

describe('ngspice: parse example output', function() {
    it('should parse one line of output', function() {
        let line = '9281	9.274280e-01	4.403454e-01';
        let result = sop.parse_ngspice_line(line);
        expect(result).not.toEqual(false);
    });
});

describe('ngspice: build comparable table', function() {
    it('should sucessfully build a ComparableTable', function() {
        let options = {input: example_spice};
        let subp = spawnSync('ngspice', ['-b'], options);
        if (subp.status == 0) {
            let output = `${subp.stdout}`;
            let time_record_map = sop.parse_ngspice_output(output);
            let ctable = new ComparableTable(time_record_map['net_0']);
            let [left, right] = ctable.get_nbrs(ctable.duration() / 4);
            expect(left.time).toEqual(2.428e-8);
            expect(right.time).toEqual(2.528e-8);
        } else {
            console.log(`stderr: ${subp.stderr}`);
        }
        expect(subp.status).toEqual(0);
    });
});

function build_ngspice_record_map(spice_src) {
    var time_record_map = {};
    let options = {input: spice_src};
    let subp = spawnSync('ngspice', ['-b'], options);
    if (subp.status == 0) {
        let output = `${subp.stdout}`;
        // time_record_map =
        let record_map = sop.parse_ngspice_output(output);
        Object.keys(record_map).forEach(key => {
            time_record_map[key] = new ComparableTable(record_map[key]);
        });
    } else {
        console.log(`stderr: ${subp.stderr}`);
    }
    return time_record_map;
}

describe('ngspice: build comparable table', function() {
    it('should sucessfully build a ComparableTable from spice src', function() {
        let rmap = build_ngspice_record_map(example_spice);
        expect(rmap).not.toEqual({});
    });

    it('should sucessfully build a ComparableTable from spice src', function() {
        let rmap = build_ngspice_record_map(example_spice);
        expect(rmap).not.toEqual({});
    });
});

describe('sch: build a Comparable table from a probe', function() {
    it('should generate an array of records comparable to spice output records', function() {});
});

// -----------------------------------------------------------------------------
//
// VOLTAGE DIVIDER 2
//
// -----------------------------------------------------------------------------

let voltage_divider_spice2 = `
* schematic.js
R__7 net_0 0 1
R__6 net_1 net_0 1
V__3 net_1 net_2 DC SIN(0 1 1 0 0)
R__1 net_2 0 10
.op
.control
tran 1ms 1s
echo "start delimeter net_0"
print net_0
echo "end delimeter net_0"
echo "start delimeter net_1"
print net_1
echo "end delimeter net_1"
echo "start delimeter net_2"
print net_2
echo "end delimeter net_2"
.endc
`;

let voltage_divider_schem2 = [
    ['w', [104, 128, 104, 176]],
    ['r', [104, 80, 0], {name: '', r: '10', _json_: 1}, ['3', '0']],
    ['g', [288, 176, 0], {_json_: 2}, ['0']],
    ['v', [104, 32, 0], {name: '', value: 'sin(0,1,1,0,0)', _json_: 3}, ['2', '3']],
    ['w', [104, 176, 288, 176]],
    ['w', [104, 32, 288, 32]],
    ['r', [288, 32, 0], {r: '1', _json_: 6}, ['2', '1']],
    ['r', [288, 80, 0], {r: '1', _json_: 7}, ['1', '0']],
    ['w', [288, 128, 288, 176]],
    ['w', [288, 80, 344, 80]],
    ['s', [344, 80, 0], {color: 'cyan', offset: '0', _json_: 10}, ['1']],
    ['view', -63, -40.2, 1.5625, '50', '10', '1G', null, '100', '1', '1000'],
];

// ['s', [184, 24, 0], {color: 'cyan', offset: '0', _json_: 8}, ['3']],
// ['s', [184, 72, 0], {color: 'cyan', offset: '0', _json_: 9}, ['2']],
// ['s', [184, 120, 0], {color: 'cyan', offset: '0', _json_: 10}, ['1']],

function gather_probes(schem_json) {
    var probe_infos = [];
    for (var i = 0; i < schem_json.length - 1; i++) {
        var c = schem_json[i];
        if (c[0] == 's') {
            // got a probe.
            var color = c[2].color;
            var offset = 0; // because not going to mess with that.
            var label = c[c.length - 1][0];
            var probe_type = 'voltage'; // only using voltage probes for testing, for now.
            //probe_infos.push([color, label, offset, probe_type]);
            probe_infos.push(label);
        }
    }
    return probe_infos;
}

function build_schematic_record_map(schematic_json, num_timepoints, start, stop) {
    if (start == undefined) throw 'start undefined';
    if (stop == undefined) throw 'stop undefined';
    if (num_timepoints == undefined) throw 'num_timepoints undefined';

    var circuit = new cktsim.Circuit();
    let {spice_src, _} = circuit.emit_spice(schematic_json);
    circuit = new cktsim.Circuit();
    circuit.load_netlist(schematic_json);
    circuit.finalize();
    //circuit.extract_circuit();

    var probe_infos = gather_probes(schematic_json);

    let result = circuit.tran(num_timepoints, start, stop, probe_infos, true); //probe_infos, false);
    debugger;

    let time_record_map = {};
    Object.keys(result).forEach(key => {
        if (key == '_time_') return;
        let arr = result[key];
        if (typeof arr != 'object') return;

        let time_col = result['_time_'];
        expect(arr.length).toEqual(time_col.length);
        let records = [];
        for (var i = 0; i < arr.length; i++) {
            records.push(new sop.TimeRecord(time_col[i], arr[i]));
        }
        time_record_map[key] = new ComparableTable(records);
    });
    return time_record_map;
}

describe('ComparableTable: compare two simulations', function() {
    it('compare two simulations to see if they match', function() {
        // establish a threshold for matching as some percent
        // difference
        let schem_map = build_schematic_record_map(voltage_divider_schem2, 1000, 0, 1);
        expect(schem_map).not.toEqual({});
        let spice_map = build_ngspice_record_map(voltage_divider_spice2);
        expect(spice_map).not.toEqual({});

        Object.keys(schem_map).forEach(schem_key => {
            Object.keys(spice_map).forEach(spice_key => {
                let schem_table = schem_map[schem_key];
                let spice_table = spice_map[spice_key];
                let d = schem_table.value_distance(spice_table);
            });
        });
    });
});

// -----------------------------------------------------------------------------
//
const voltage_divider_spice3 = `
* schematic.js
R__14 net_1 net_0 1
R__10 net_0 net_2 1
R__7 net_2 net_3 1
R__4 net_4 0 1
R__3 net_3 net_4 1
V__1 net_1 0 DC SIN(0 1 1 0 0)
.op
.control
tran 1ms 1s
echo "start delimeter net_1"
print v(net_1)
echo "end delimeter net_1"
echo "start delimeter net_0"
print v(net_0)
echo "end delimeter net_0"
echo "start delimeter net_2"
print v(net_2)
echo "end delimeter net_2"
echo "start delimeter net_4"
print v(net_4)
echo "end delimeter net_4"
echo "start delimeter net_3"
print v(net_3)
echo "end delimeter net_3"
.endc
`;

const voltage_divider_schem3 = [
    ['g', [288, 176, 0], {_json_: 0}, ['0']],
    ['v', [104, 32, 0], {name: '', value: 'sin(0,1,1,0,0)', _json_: 1}, ['2', '0']],
    ['w', [104, 176, 288, 176]],
    ['r', [288, 80, 0], {r: '1', _json_: 3}, ['4', '5']],
    ['r', [288, 128, 0], {r: '1', _json_: 4}, ['5', '0']],
    ['w', [288, 128, 344, 128]],
    ['s', [344, 128, 0], {color: 'cyan', offset: '0', _json_: 6}, ['5']],
    ['r', [288, 32, 0], {r: '1', _json_: 7}, ['3', '4']],
    ['w', [288, 80, 344, 80]],
    ['s', [344, 80, 0], {color: 'cyan', offset: '0', _json_: 9}, ['4']],
    ['r', [288, -16, 0], {r: '1', _json_: 10}, ['1', '3']],
    ['s', [344, 32, 0], {color: 'cyan', offset: '0', _json_: 11}, ['3']],
    ['s', [344, 32, 0], {color: 'cyan', offset: '0', _json_: 12}, ['3']],
    ['w', [344, 32, 288, 32]],
    ['r', [288, -64, 0], {r: '1', _json_: 14}, ['2', '1']],
    ['w', [288, -16, 344, -16]],
    ['s', [344, -16, 0], {color: 'cyan', offset: '0', _json_: 16}, ['1']],
    ['w', [288, -64, 104, -64]],
    ['w', [104, 176, 104, 80]],
    ['w', [104, 32, 104, -64]],
    ['view', -207, -123, 1, '50', '10', '1G', null, '100', '1', '1000'],
];

describe('ComparableTable: N-way voltage divider', function() {
    it('compare two simulations to see if they match', function() {
        // establish a threshold for matching as some percent
        // difference
        let schem_map = build_schematic_record_map(voltage_divider_schem3, 1000, 0, 1);
        expect(schem_map).not.toEqual({});
        let spice_map = build_ngspice_record_map(voltage_divider_spice3);
        expect(spice_map).not.toEqual({});

        Object.keys(schem_map).forEach(schem_key => {
            Object.keys(spice_map).forEach(spice_key => {
                function zip(xs, ys) {
                    if (xs.length == 0 || ys.length == 0) {
                        return [];
                    } else {
                        return [[xs[0], ys[0]]].concat(zip(xs.slice(1, -1), ys.slice(1, -1)));
                    }
                }
                let schem_table = schem_map[schem_key];
                let spice_table = spice_map[spice_key];
                let d = schem_table.value_distance(spice_table);
            });
        });
    });
});

// -----------------------------------------------------------------------------

const voltage_divider_spice4 = `
* schematic.js
R__5 net_1 net_0 1
R__4 net_0 net_2 1
R__3 net_2 0 1
V__0 net_1 0 DC 1
.op
.control
tran 1ms 1s
echo "start delimeter net_1"
print v(net_1)
echo "end delimeter net_1"
echo "start delimeter net_0"
print v(net_0)
echo "end delimeter net_0"
echo "start delimeter net_2"
print v(net_2)
echo "end delimeter net_2"
.endc
`;

const voltage_divider_schem4 = [
    // HEY I CHANGE THE ORDER OF THE NODES FEEDING THIS SIN SOURCE AND IT WORKS.
    ['v', [104, 56, 0], {value: 'dc(1)', _json_: 0}, ['3', '0']],
    ['w', [104, 104, 104, 168]],
    ['w', [104, 168, 184, 168]],
    ['r', [184, 120, 0], {r: '1', _json_: 3}, ['1', '0']],
    ['r', [184, 72, 0], {r: '1', _json_: 4}, ['2', '1']],
    ['r', [184, 24, 0], {r: '1', _json_: 5}, ['3', '2']],
    ['w', [104, 56, 104, 24]],
    ['w', [104, 24, 184, 24]],
    ['s', [184, 24, 0], {color: 'cyan', offset: '0', _json_: 8}, ['3']],
    ['s', [184, 72, 0], {color: 'cyan', offset: '0', _json_: 9}, ['2']],
    ['s', [184, 120, 0], {color: 'cyan', offset: '0', _json_: 10}, ['1']],
    ['g', [184, 168, 0], {_json_: 11}, ['0']],
    ['view', -11.799999999999997, -10.759999999999994, 1.953125, '50', '10', '1G', null, '100', '1', '1000'],
];

describe('SpecComp: N-way voltage divider', function() {
    it('compare two simulations to see if they match', function() {
        // establish a threshold for matching as some percent
        // difference
        let schem_map = build_schematic_record_map(voltage_divider_schem4, 1000, 0, 1);
        expect(schem_map).not.toEqual({});
        let spice_map = build_ngspice_record_map(voltage_divider_spice4);
        expect(spice_map).not.toEqual({});

        Object.keys(schem_map).forEach(schem_key => {
            let schem_table = schem_map[schem_key];
            //schem_table.plot(); //TODO Here's the problem.  Some
            // values are negative. Which values? Voltages on trans()
            // results after read_netlist
            // try doing DC analysis on the

            Object.keys(spice_map).forEach(spice_key => {
                let spice_table = spice_map[spice_key];
                let d = schem_table.value_distance(spice_table);
                //console.log([d, schem_key, spice_key]);
            });
        });
    });
});

// -----------------------------------------------------------------------------

const voltage_divider_spice5 = `
* schematic.js
V__3 net_0 0 DC SIN(0 1 1 0 0)
R__2 net_0 net_1 1
R__1 net_1 0 1
.op
.control
tran 1ms 10ms
echo "start delimeter net_0"
print v(net_0)
echo "end delimeter net_0"
echo "start delimeter net_1"
print v(net_1)
echo "end delimeter net_1"
.endc
`;

const voltage_divider_schem5 = [
    ['g', [288, 176, 0], {_json_: 0}, ['0']],
    ['r', [288, 128, 0], {r: '1', _json_: 1}, ['1', '0']],
    ['r', [288, 80, 0], {r: '1', _json_: 2}, ['2', '1']],
    ['v', [104, 32, 0], {name: '', value: 'sin(0,1,1,0,0)', _json_: 3}, ['2', '0']],
    ['s', [288, 80, 0], {color: 'cyan', offset: '0', _json_: 4}, ['2']],
    ['w', [104, 176, 104, 80]],
    ['s', [288, 128, 0], {color: 'cyan', offset: '0', _json_: 6}, ['1']],
    ['w', [104, 32, 288, 32]],
    ['w', [288, 176, 104, 176]],
    ['w', [288, 32, 288, 80]],
    ['view', 29.159999999999997, 12.792000000000002, 2.44140625, '50', '10', '1G', null, '100', '1', '1000'],
];

describe('SpecComp: N-way voltage divider', function() {
    it('compare two simulations to see if they match', function() {
        // establish a threshold for matching as some percent
        // difference

        let schem_map = build_schematic_record_map(voltage_divider_schem5, 5, 0, 10 / 1000);
        expect(schem_map).not.toEqual({});
        let spice_map = build_ngspice_record_map(voltage_divider_spice5);
        expect(spice_map).not.toEqual({});

        Object.keys(schem_map).forEach(schem_key => {
            let schem_table = schem_map[schem_key];
            schem_table.plot(); //TODO Here's the problem.  Some
            // values are negative. Which values? Voltages on trans()
            // results after read_netlist
            // try doing DC analysis on the

            Object.keys(spice_map).forEach(spice_key => {
                let spice_table = spice_map[spice_key];
                let d = schem_table.value_distance(spice_table);
                console.log([d, schem_key, spice_key]);
            });
        });
    });
});
