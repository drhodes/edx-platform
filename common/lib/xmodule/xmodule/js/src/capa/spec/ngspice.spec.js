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
