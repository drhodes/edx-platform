const {spawnSync} = require('child_process');
const {TimeRecord} = require('./spice-output-parsing');
const {ComparableTable} = require('./comparable-table');

describe('comparable-table: interpolation working?', function() {
    it('should correctly interpolate between two points', function() {
        let recs = [new TimeRecord(0, 0), new TimeRecord(1, 1)];
        let table = new ComparableTable(recs);
        expect(table.linear_interpolate(0.5)).toEqual(0.5);
    });

    it('should correctly interpolate between two points', function() {
        let recs = [new TimeRecord(0, 0), new TimeRecord(1, 0.1)];
        let table = new ComparableTable(recs);
        expect(table.linear_interpolate(0.5)).toEqual(0.05);
    });

    it('should correctly interpolate between two points', function() {
        let recs = [
            new TimeRecord(0, 0),
            new TimeRecord(1, 0.1),
            new TimeRecord(2, 0.1),
            new TimeRecord(3, 0.1),
            new TimeRecord(4, 0.1),
            new TimeRecord(5, 0.1),
            new TimeRecord(6, 0.1),
        ];
        let table = new ComparableTable(recs);
        expect(table.linear_interpolate(0.5)).toEqual(0.05);
        expect(table.linear_interpolate(5.5)).toEqual(0.1);
    });
});

describe('comparable-table: discover the distance between two tables', function() {
    it('should correctly interpolate between two points', function() {});
});
