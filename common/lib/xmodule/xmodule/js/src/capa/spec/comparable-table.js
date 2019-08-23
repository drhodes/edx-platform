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

function ComparableTable(records) {
    // invarient: records are sorted by time ascending.
    // records.sort();
    // console.log(records.map(x => x.time));
    this.records = records;
    this.assert_records_sorted();
}

ComparableTable.prototype.assert_records_sorted = function() {
    for (var i = 0; i < this.records.length - 2; i++) {
        if (this.records[i + 1] < this.records[i]) {
            throw 'ComparableTable encountered unsorted records on construction';
        }
    }
};

ComparableTable.prototype.min_time = function() {
    //assert(this.records.length > 0);
    return this.records[0].time;
};

ComparableTable.prototype.max_time = function() {
    //assert(this.records.length > 0);
    return this.records[this.records.length - 1].time;
};

ComparableTable.prototype.duration = function() {
    return this.max_time() - this.min_time();
};

// Is a point in time contained within the domain?
ComparableTable.prototype.in_bounds = function(t) {
    // us an open boundary to ensure t has two neighboring points.
    return t > this.min_time() && t < this.max_time();
};

ComparableTable.prototype.find_closest_left_nbr = function(t) {
    // find which indices a time t is between.
    // binary search.
    let narrow = (idxL, idxR) => {
        if (idxR - idxL <= 1) return idxL;
        let timeL = this.records[idxL].time;
        let timeR = this.records[idxR].time;
        let idxM = Math.floor((idxL + idxR) / 2);
        let timeM = this.records[idxM].time;

        if (t > timeL && t < timeM) {
            return narrow(idxL, idxM);
        } else if (t > timeM && t < timeR) {
            return narrow(idxM, idxR);
        }
        throw 't is out of range, which ought to be impossible.';
    };
    return narrow(0, this.records.length - 1);
};

ComparableTable.prototype.get_nbrs = function(t) {
    if (!this.in_bounds(t)) {
        throw 'ComparableTable.get_left_nbr got out of bounds t: ' + t;
    }
    let left_nbr_idx = this.find_closest_left_nbr(t);
    return [this.records[left_nbr_idx], this.records[left_nbr_idx + 1]];
};

ComparableTable.prototype.find_exact_match = function(t) {
    // linear search :/
    for (var i = 0; i < this.records.length - 1; i++) {
        if (this.records[i].time == t) {
            return records[i].value;
        }
    }
    return false;
};

ComparableTable.prototype.linear_interpolate = function(t) {
    // TODO handle case where t is exact match.
    let m = this.find_exact_match(t);
    if (m) return m;

    // is this good enough?
    if (!this.in_bounds(t)) {
        throw 'ComparableTable.get_left_nbr got out of bounds t: ' + t;
    }
    let [left, right] = this.get_nbrs(t);
    let dt = right.time - left.time;
    let dy = right.value - left.value;
    let slope = dy / dt;
    let y = left.value + slope * (t - left.time);
    return y;
};

ComparableTable.prototype.value_distance = function(table) {
    // establish a measure between two tables.
    let total_dist = 0;
    table.records.forEach(trec => {
        if (this.in_bounds(trec.time)) {
            val = this.linear_interpolate(trec.time);
            let d = Math.abs((val - trec.value) / trec.value);
            total_dist += d;
        }
    });
    return total_dist;
};

ComparableTable.prototype.plot = function() {
    this.records.forEach(rec => {
        console.log(rec.show());
    });
};

module.exports = {
    ComparableTable: ComparableTable,
};
