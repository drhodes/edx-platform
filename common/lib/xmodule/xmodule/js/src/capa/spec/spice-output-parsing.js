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

let example_spice = `
* schematic.js
R__1 0 net_0 1
V__0 0 net_0 DC SIN(0 1 1 0 0)


.control
tran 10s 1s
echo "start delimeter net_0"
print net_0
echo "end delimeter net_0"
.endc
`;

console.log(example_spice);
