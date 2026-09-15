export interface SyllabusPreset {
  branch: string;
  semester: string;
  title: string;
  subjects: string[];
  rawText: string;
  sampleCareerGoal: string;
  sampleInterests: string[];
  sampleSkills: string[];
}

export const PRESET_CURRICULA: Record<string, SyllabusPreset> = {
  "Mechanical Engineering": {
    branch: "Mechanical Engineering",
    semester: "Semester 5",
    title: "B.Tech Mechanical Engineering - Thermal & Design Core",
    subjects: ["Thermodynamics II", "Machine Design", "Manufacturing Technology", "Kinematics of Machinery", "Fluid Mechanics & Machinery"],
    rawText: `DEPARTMENT OF MECHANICAL ENGINEERING
CURRICULUM & SYLLABUS - 5TH SEMESTER

SUBJECT 1: ME501 - APPLIED THERMODYNAMICS
Unit 1: Gas Power Cycles - Otto, Diesel, Dual, Brayton cycles. Regenerative and reheat gas turbine cycles.
Unit 2: Vapor Power Cycles - Rankine cycle with superheat, reheat and regeneration. Binary vapor cycles.
Unit 3: Steam Turbines & Nozzles - Velocity compounding, pressure compounding, impulse & reaction turbines.
Unit 4: Refrigeration & Air Conditioning - Vapor compression cycle, COP calculation, psychrometric chart, cooling loads.

SUBJECT 2: ME502 - DESIGN OF MACHINE ELEMENTS
Unit 1: Steady and Variable Stresses - Stress concentration, notch sensitivity, Goodman, Soderberg and Gerber criteria.
Unit 2: Design of Shafts, Keys and Couplings - Rigid and flexible couplings, ASME design code.
Unit 3: Fasteners and Welded Joints - Threaded joints, eccentric loading, welded and riveted joints.
Unit 4: Springs & Bearings - Helical springs, leaf springs, hydrodynamic lubrication, ball and roller bearings.

SUBJECT 3: ME503 - ADVANCED MANUFACTURING TECHNOLOGY
Unit 1: Metal Cutting Mechanics - Merchant circle diagram, tool wear, Taylor tool life equation.
Unit 2: Machine Tools - Lathe, milling, shaping, grinding operations and CNC introduction.
Unit 3: Unconventional Machining - EDM, ECM, USM, LBM, water jet cutting mechanisms.
Unit 4: Metrology and Quality Control - Comparators, CMM, interferometry, surface roughness measurement.`,
    sampleCareerGoal: "Electric Vehicle Powertrain & Autonomous Vehicle Design",
    sampleInterests: ["EV Architecture", "Battery Thermal Management", "Automotive CAD/CAE", "Vehicle Dynamics"],
    sampleSkills: ["SolidWorks Basics", "Engineering Mechanics", "Thermodynamics Fundamentals"]
  },

  "Civil Engineering": {
    branch: "Civil Engineering",
    semester: "Semester 5",
    title: "B.Tech Civil Engineering - Structural & Environmental Core",
    subjects: ["Structural Analysis I", "Design of Reinforced Concrete Structures", "Geotechnical Engineering", "Transportation Engineering", "Surveying II"],
    rawText: `DEPARTMENT OF CIVIL ENGINEERING
CURRICULUM & SYLLABUS - 5TH SEMESTER

SUBJECT 1: CE501 - DESIGN OF REINFORCED CONCRETE STRUCTURES
Unit 1: Limit State Method - Design principles, singly and doubly reinforced beams, shear and torsion design (IS 456).
Unit 2: Design of Slabs - One-way slabs, two-way slabs, cantilever slabs, detailing of reinforcement.
Unit 3: Columns and Footings - Axially loaded columns, uniaxial and biaxial bending, isolated square and rectangular footings.
Unit 4: Serviceability - Deflection and crack control, durability criteria.

SUBJECT 2: CE502 - GEOTECHNICAL ENGINEERING
Unit 1: Soil Properties and Classification - Index properties, phase relationships, USCS and IS classification.
Unit 2: Permeability & Seepage - Darcy's law, flow nets, piping failure, effective stress principle.
Unit 3: Compaction and Consolidation - Terzaghi 1D consolidation theory, e-log p curves, preconsolidation pressure.
Unit 4: Shear Strength - Mohr-Coulomb theory, direct shear test, triaxial tests (UU, CU, CD).

SUBJECT 3: CE503 - STRUCTURAL ANALYSIS
Unit 1: Indeterminate Structures - Degree of static and kinematic indeterminacy, energy methods, Castigliano theorems.
Unit 2: Slope Deflection Method - Continuous beams, portal frames with and without sway.
Unit 3: Moment Distribution Method - Hardy Cross method, stiffness and carryover factors.`,
    sampleCareerGoal: "BIM Specialist & Sustainable Green Infrastructure Project Lead",
    sampleInterests: ["Building Information Modeling (BIM)", "Autodesk Revit", "Sustainable Concrete", "Structural Optimization"],
    sampleSkills: ["AutoCAD 2D", "Basic Surveying", "Engineering Mechanics"]
  },

  "Electronics & Communication": {
    branch: "Electronics & Communication",
    semester: "Semester 5",
    title: "B.Tech ECE - Microcontrollers, VLSI & Signals",
    subjects: ["Microprocessors & Microcontrollers", "Digital Signal Processing", "Linear Integrated Circuits", "Electromagnetic Fields", "Communication Systems"],
    rawText: `DEPARTMENT OF ELECTRONICS & COMMUNICATION ENGINEERING
CURRICULUM & SYLLABUS - 5TH SEMESTER

SUBJECT 1: EC501 - MICROPROCESSORS & EMBEDDED CONTROLLERS
Unit 1: 8086 Architecture - Register organization, memory segmentation, pin diagram, addressing modes.
Unit 2: ARM Cortex-M Series - Architecture, thumb instruction set, memory mapping, NVIC, interrupt handling.
Unit 3: Peripherals Interfacing - GPIO, Timers, PWM, ADC, DAC, UART, SPI, I2C bus protocols.
Unit 4: Real Time Operating Systems - RTOS fundamentals, FreeRTOS tasks, semaphores, queues, scheduling.

SUBJECT 2: EC502 - DIGITAL SIGNAL PROCESSING
Unit 1: Discrete Fourier Transform - DFT properties, circular convolution, FFT decimation in time (DIT) and frequency (DIF).
Unit 2: IIR Filter Design - Butterworth and Chebyshev filters, bilinear transformation, impulse invariance.
Unit 3: FIR Filter Design - Linear phase characteristics, windowing techniques (Hamming, Hanning, Blackman).
Unit 4: Finite Wordlength Effects - Quantization noise, coefficient quantization, limit cycles.

SUBJECT 3: EC503 - VLSI DESIGN
Unit 1: MOS Transistor Theory - nMOS, pMOS, CMOS fabrication, V-I characteristics, parasitic capacitances.
Unit 2: CMOS Inverter - Static characteristics, noise margins, transient delay, power dissipation.
Unit 3: Verilog HDL - Gate level, dataflow, behavioral modeling, testbenches, combinational and sequential synthesis.`,
    sampleCareerGoal: "VLSI Verification & Embedded Edge AI Engineer",
    sampleInterests: ["SystemVerilog / UVM", "Embedded Linux", "FPGA Acceleration", "RISC-V Architecture"],
    sampleSkills: ["C Programming", "Digital Electronics", "Basic Verilog"]
  },

  "Computer Science & Engineering": {
    branch: "Computer Science & Engineering",
    semester: "Semester 5",
    title: "B.Tech CSE - Core Systems & Algorithms",
    subjects: ["Database Management Systems", "Operating Systems", "Computer Networks", "Design & Analysis of Algorithms", "Theory of Computation"],
    rawText: `DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING
CURRICULUM & SYLLABUS - 5TH SEMESTER

SUBJECT 1: CS501 - DATABASE MANAGEMENT SYSTEMS
Unit 1: Relational Model - ER diagrams, relational algebra, SQL DDL/DML, integrity constraints.
Unit 2: Normalization - Functional dependencies, 1NF, 2NF, 3NF, BCNF, lossless join decomposition.
Unit 3: Transaction Management - ACID properties, serializability, two-phase locking (2PL), deadlocks.
Unit 4: Storage & Indexing - B-Trees, B+ Trees, hashing, query optimization basics.

SUBJECT 2: CS502 - OPERATING SYSTEMS
Unit 1: Process Management - CPU scheduling algorithms (FCFS, SJF, Round Robin), process synchronization, semaphores.
Unit 2: Memory Management - Paging, segmentation, virtual memory, page replacement algorithms (LRU, FIFO).
Unit 3: Storage Management - File system interface, disk scheduling (SSTF, SCAN, C-LOOK).
Unit 4: Concurrency & Deadlocks - Banker's algorithm, deadlock detection and recovery.

SUBJECT 3: CS503 - COMPUTER NETWORKS
Unit 1: Network Layer - IPv4/IPv6 addressing, subnetting, routing algorithms (OSPF, BGP).
Unit 2: Transport Layer - TCP vs UDP, 3-way handshake, flow control (sliding window), congestion control.
Unit 3: Application Layer - HTTP/HTTPS, DNS, SMTP, sockets programming.`,
    sampleCareerGoal: "Senior Backend & Distributed Cloud Systems Architect",
    sampleInterests: ["Distributed Systems", "Docker & Kubernetes", "REST & gRPC APIs", "High-Throughput Caching"],
    sampleSkills: ["Python", "Java Basics", "Data Structures"]
  },

  "Electrical & Electronics": {
    branch: "Electrical & Electronics",
    semester: "Semester 5",
    title: "B.Tech EEE - Power Systems & Control",
    subjects: ["Power System Analysis", "Control Systems", "Power Electronics", "Electrical Machines II", "Renewable Energy Sources"],
    rawText: `DEPARTMENT OF ELECTRICAL & ELECTRONICS ENGINEERING
CURRICULUM & SYLLABUS - 5TH SEMESTER

SUBJECT 1: EE501 - POWER SYSTEM ANALYSIS
Unit 1: Representation of Power Systems - Single line diagrams, per-unit system, impedance and reactance diagrams.
Unit 2: Power Flow Analysis - Gauss-Seidel method, Newton-Raphson method, Fast Decoupled load flow.
Unit 3: Symmetrical & Unsymmetrical Faults - Symmetrical components, sequence networks, LG, LL, LLG faults.
Unit 4: Power System Stability - Rotor angle stability, swing equation, equal area criterion.

SUBJECT 2: EE502 - POWER ELECTRONICS
Unit 1: Power Semiconductor Devices - SCR, MOSFET, IGBT characteristics, triggering and gate drive circuits.
Unit 2: Controlled Rectifiers - Single phase and three phase half and fully controlled bridges with R, RL loads.
Unit 3: DC-DC Converters - Buck, Boost, Buck-Boost, SEPIC topologies, continuous and discontinuous conduction.
Unit 4: Inverters - Voltage Source Inverters (VSI), PWM techniques, SPWM, THD analysis.`,
    sampleCareerGoal: "Smart Grid & Renewable Energy Storage Specialist",
    sampleInterests: ["BMS (Battery Management Systems)", "Solar Inverter Design", "Microgrid Control", "MATLAB/Simulink"],
    sampleSkills: ["Circuit Analysis", "Basic Control Systems", "MATLAB Basics"]
  },

  "Aerospace Engineering": {
    branch: "Aerospace Engineering",
    semester: "Semester 5",
    title: "B.Tech Aerospace - Aerodynamics & Propulsion",
    subjects: ["Incompressible Aerodynamics", "Aircraft Structures II", "Gas Turbine Propulsion", "Flight Mechanics", "Avionics"],
    rawText: `DEPARTMENT OF AEROSPACE ENGINEERING
CURRICULUM & SYLLABUS - 5TH SEMESTER

SUBJECT 1: AE501 - GAS TURBINE PROPULSION
Unit 1: Air Breathing Engines - Turbojet, turbofan, turboprop, ramjet, scramjet performance parameters.
Unit 2: Inlets and Nozzles - Subsonic and supersonic diffusers, convergent-divergent nozzles, choking.
Unit 3: Compressors & Turbines - Axial flow compressors, blade stalling, centrifugal compressors, axial turbine stages.
Unit 4: Combustion Chambers - Flame stabilization, pressure loss, cooling techniques.

SUBJECT 2: AE502 - FLIGHT MECHANICS
Unit 1: Equations of Motion - Standard atmosphere, true vs indicated airspeed, steady level flight, climbing and gliding.
Unit 2: Aircraft Performance - Range and endurance for propeller and jet aircraft, take-off and landing distances.
Unit 3: Static Stability - Longitudinal static stability, neutral point, static margin, lateral and directional stability.`,
    sampleCareerGoal: "Autonomous Drone & UAV Flight Systems Engineer",
    sampleInterests: ["UAV Autopilot (PX4/ArduPilot)", "CFD Aerodynamics (ANSYS Fluent)", "Composite Structures", "Flight Dynamics"],
    sampleSkills: ["Basic Aerodynamics", "MATLAB", "SolidWorks"]
  }
};
