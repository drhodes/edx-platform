// -----------------------------------------------------------------------------
// PARSING SPICE OUTPUT

// Luckily ngspice is a practical tool, it has echo statements, so we
// can introduce delimeters, yay! A loop and a regex will do it.

// SPICE CODE
// echo "start delimeter net_0"
// print net_0
// echo "end delimeter net_0"

// PRODUCES OUTPUT
// start delimeter net_0
// ...
// 52	8.856000e-01	6.584793e-01
// 53	9.056000e-01	5.589614e-01
// 54	9.256000e-01	4.506283e-01

// Index   time            net_0
// --------------------------------------------------------------------------------
// 55	9.456000e-01	3.351885e-01
// 56	9.656000e-01	2.144626e-01
// 57	9.856000e-01	9.035447e-02
// 58	1.000000e+00	2.449294e-16
// ...
// end delimeter net_0

function TimeRecord(time, value) {
    this.time = time;
    this.value = value;
}

function parse_ngspice_line(line) {
    // does it match the form: "52 8.856000e-01 6.584793e-01" easier
    // without regex, hard to predict what ngspice is going to output
    // for float format. will play it safer and just feed it to the
    // javascript parser.
    let parts = line.match(/\S+/g) || [];
    if (parts.length < 3) return false;

    let [timeStr, valStr] = parts;

    time = parseFloat(timeStr);
    val = parseFloat(valStr);

    // check for NaN
    if (!(time + val)) return false;
    return new TimeRecord(time, val);
}

function parse_ngspice_output(stdout) {
    // a map from netid to an array of records.
    let data = {};

    // a place to store the spice output from transient analysis.
    var output_records = [];
    var recording = false;
    var cur_name = '';

    stdout.split('\n').forEach(line => {
        // look for "start delimeter" and save the network name.
        if (line.indexOf('start delimeter') != -1) {
            recording = true;
            cur_name = line
                .trim()
                .split('start delimeter')[1]
                .trim();
            return;
        }

        // look for "end delimeter".
        if (line.indexOf('end delimeter') != -1) {
            recording = false;
            data[cur_name] = output_records;
            output_records = [];
            cur_name = '';
            return;
        }

        // accum the next record.
        let maybeRecord = parse_ngspice_line(line);
        if (maybeRecord) output_records.push(maybeRecord);
        return;
    });
    return data;
}

module.exports = {
    TimeRecord: TimeRecord,
    parse_ngspice_output: parse_ngspice_output,
    parse_ngspice_line: parse_ngspice_line,
};
