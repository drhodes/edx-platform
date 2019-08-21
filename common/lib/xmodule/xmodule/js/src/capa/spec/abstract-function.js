// -----------------------------------------------------------------------------
// We need to compare output from ngspice and schematics.js.  What
// kind of output, one might ask? The output is a two column table,
// [Time|Value] that approximates a testable property calculated for a
// given circuit as a function of time.

// So. The goal is to compare two tables, A and B. Why? To make sure
// schematic.js is producing results that agree with ngspice. This
// will allow very good automated testing of schematic.js

// The first problem is: the time domain does not use deterministic
// time intervals. Why? ngspice uses numerical intergration methods
// that require variable time steps.

// See this thread for more detail.
// https://web.archive.org/web/20190821160856/https://sourceforge.net/p/ngspice/mailman/message/26358448/

// since no two points in time can be guarenteed to be shared by both
// tables, then we're going to have to interpolate. that's what the
// following code does.

const {TimeRecord} = require('./spice-output-parsing');

module.export = {
    ComparableTable: ComparableTable,
};

function ComparableTable(records) {
    // invarient: records are sorted by time ascending.
    this.records = records;
}

ComparableTable.prototype.min_time = function() {
    assert(this.records.length > 0);
    return this.records[0].time;
};

ComparableTable.prototype.max_time = function() {
    assert(this.records.length > 0);
    return this.records[this.records.length - 1].time;
};

ComparableTable.prototype.total_duration = function() {
    return this.max_time() - this.min_time();
};

// is a point in time contained within the domain?
ComparableTable.prototype.in_bounds = function(t) {
    return t >= this.min_time() && t <= this.max_time();
};
