var cktsim = require('../schematic');

let circuit_data = [
    [
        'v',
        [216, 56, 0],
        {
            value: 'dc(1)',
            _json_: 0,
        },
        ['1', '0'],
    ],
    [
        'r',
        [264, 56, 0],
        {
            r: '1',
            _json_: 1,
        },
        ['1', '0'],
    ],
    ['w', [264, 56, 216, 56]],
    ['w', [216, 104, 264, 104]],
    [
        'g',
        [216, 104, 0],
        {
            _json_: 4,
        },
        ['0'],
    ],
    ['view', -11.8, -10.76, 1.953125, '50', '10', '1G', null, '100', '1', '1000'],
];

describe('cktsim: Can we build a circuit without crashing?', function() {
    it('should not crash', function() {
        let circuit = new cktsim.Circuit();
        let success = circuit.load_netlist(circuit_data);

        expect(success).toEqual(true);
    });
});
