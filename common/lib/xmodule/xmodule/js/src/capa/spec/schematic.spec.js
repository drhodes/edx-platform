var cktsim = require('../schematic');
const fs = require('fs');
const {spawnSync} = require('child_process');
const sop = require('./spice-output-parsing');

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

describe('cktsim: Can we build a circuit without crashing?', function() {
    it('should not crash', function() {
        let circuit = new cktsim.Circuit();
        let success = circuit.load_netlist(circuit_data);
        expect(success).toEqual(true);
    });
});

describe('cktsim: generate a netlist', function() {
    it('should emit a netlist ready for testing with ngspice', function() {
        let circuit = new cktsim.Circuit();
        var spice = circuit.emit_spice(circuit_data);
        expect(spice).not.toEqual(false);
    });
});

let voltage_divider_schem = [
    ['w', [152, 48, 216, 48]],
    ['r', [216, 48, 0], {r: '1', _json_: 1}, ['2', '1']],
    ['v', [152, 48, 0], {name: '', value: 'sin(0,1,1,0,0)', _json_: 2}, ['2', '0']],
    ['s', [216, 96, 0], {color: 'cyan', offset: '0', _json_: 3}, ['1']],
    ['r', [216, 96, 0], {r: '1', _json_: 4}, ['1', '0']],
    ['w', [216, 144, 152, 144]],
    ['w', [152, 96, 152, 144]],
    ['g', [152, 144, 0], {_json_: 7}, ['0']],
    ['view', 29.159999999999997, 12.792000000000002, 2.44140625, '50', '10', '1G', null, '100', '1', '1000'],
];

describe('cktsim: get transient analysis from circuit data', function() {
    it('should generate an array of records comparable to spice output records', function() {
        var circuit = new cktsim.Circuit();
        let {spice_src, probe_names} = circuit.emit_spice(voltage_divider_schem);

        let options = {input: spice_src};
        let subp = spawnSync('ngspice', ['-b'], options);
        expect(subp.status).toEqual(0);

        var spice_records;
        if (subp.status == 0) {
            let output = `${subp.stdout}`;
            spice_records = sop.parse_ngspice_output(output);
            expect(spice_records).not.toEqual({});
            //console.log(spice_records);
        } else {
            //console.log
            console.log(`stderr: ${subp.stderr}`);
        }

        // OK ngspice doesn't support fixed time steps, this is going
        // to be more involved. interpolation!  2.086 to the rescue!
        // so given these two time series data, build an abstract
        // function that supports rough equivalence.

        circuit = new cktsim.Circuit();
        circuit.load_netlist(voltage_divider_schem);
        let result = circuit.tran(1000, 0, 1, probe_names, false);
        console.log(result);
        debugger;
    });
});
