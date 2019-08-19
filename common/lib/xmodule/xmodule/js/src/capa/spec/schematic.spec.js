var cktsim = require('../schematic');
const fs = require('fs');
const {spawn} = require('child_process');

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

describe('cktsim: get transient analysis from circuit data', function() {
    it('should generate an array of records comparable to spice output records', function() {
        // TODO
    });
});

describe('cktsim: shell out to ngspice', function() {
    it('should create ngspice subprocess with exit code 0', function() {
        let circuit = new cktsim.Circuit();
        var success = circuit.emit_spice(circuit_data);
        const subprocess = spawn('ngspice');

        subprocess.on('error', err => {
            console.log('Failed to start subprocess: ngspice');
            console.log('perhaps it is not installed, it is available on many linux distributions');
            console.log(err);
        });

        // TODO figure out how to force jasmine to wait until the subprocess is done.
        subprocess.on('exit', code => {
            console.log(`Child exited with code ${code}`);
            // hypothesis.
            // this code doesn't run yet because jasmine exits before ngspice
            expect(true).not.toEqual(true);
        });
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

/*
describe('cktsim: check if results agree with ', function() {
    it('should run ngspice on generated spice netlist', function() {
        let circuit = new cktsim.Circuit();
        var spice = circuit.emit_spice(circuit_data);

        // use pipes here.
        const subprocess = spawn('ngspice', ['/tmp/spice-test']);

        //subprocess.expect(spice).not.toEqual(false);
    });
});
*/
