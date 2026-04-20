export const mockTests = [
  {
    id: "TT-001",
    workName: "Highway Construction Phase 2",
    taluka: "Pune",
    contractorName: "ABC Constructions Ltd",
    totalAmount: 2500000,
    details: "Concrete strength test - Grade M30",
    reportStatus: "Sent",
    approvalStatus: "Approved",
    testDate: "2026-01-15",
    panNumber: "ABCDE1234F",
    aadhaarNumber: "XXXX-XXXX-5678",
    registrationNumber: "MH/PWD/2024/1234",
    rejectionReason: null,
    documents: [
      { name: "Work Order Document", url: "#" },
      { name: "Request Document", url: "#" }
    ],
    materials: [
      {
        category: "Water",
        tests: ["PH Value", "Sulphate & Chloride Content"]
      },
      {
        category: "Overlay Design",
        tests: ["Benkelman Beam Test"]
      }
    ]
  },
  {
    id: "TT-002",
    workName: "Bridge Renovation Project",
    taluka: "Mumbai",
    contractorName: "XYZ Infrastructure",
    totalAmount: 4800000,
    details: "Steel reinforcement test",
    reportStatus: "Sent",
    approvalStatus: "Approved",
    testDate: "2026-01-20",
    panNumber: "XYZAB5678C",
    aadhaarNumber: "XXXX-XXXX-1234",
    registrationNumber: "MH/PWD/2024/5678",
    rejectionReason: null,
    documents: [
      { name: "Work Order Document", url: "#" },
      { name: "Request Document", url: "#" }
    ],
    materials: [
      {
        category: "Concrete",
        tests: ["Compressive Strength", "Slump Test"]
      }
    ]
  },
  {
    id: "TT-003",
    workName: "Metro Rail Foundation",
    taluka: "Thane",
    contractorName: "Metro Build Corp",
    totalAmount: 8200000,
    details: "Soil bearing capacity analysis",
    reportStatus: "In-process",
    approvalStatus: "Approved",
    testDate: "2026-01-25",
    panNumber: "METRO9876D",
    aadhaarNumber: "XXXX-XXXX-9876",
    registrationNumber: "MH/PWD/2024/9876",
    rejectionReason: null,
    documents: [
      { name: "Work Order Document", url: "#" },
      { name: "Request Document", url: "#" }
    ],
    materials: [
      {
        category: "Soil",
        tests: ["Bearing Capacity", "Moisture Content"]
      }
    ]
  },
  {
    id: "TT-004",
    workName: "Residential Complex - Tower A",
    taluka: "Nagpur",
    contractorName: "Prime Developers",
    totalAmount: 1900000,
    details: "Brick compression test",
    reportStatus: "Sent",
    approvalStatus: "Pending",
    testDate: "2026-02-01",
    panNumber: "PRIME2468E",
    aadhaarNumber: "XXXX-XXXX-2468",
    registrationNumber: "MH/PWD/2024/2468",
    rejectionReason: null,
    documents: [
      { name: "Work Order Document", url: "#" },
      { name: "Request Document", url: "#" }
    ],
    materials: [
      {
        category: "Bricks",
        tests: ["Compression Test", "Water Absorption"]
      }
    ]
  },
  {
    id: "TT-005",
    workName: "Airport Runway Extension",
    taluka: "Nashik",
    contractorName: "Sky Infrastructure",
    totalAmount: 12000000,
    details: "Asphalt mix design verification",
    reportStatus: "Rejected",
    approvalStatus: "Approved",
    testDate: "2026-02-05",
    panNumber: "SKYIF1357F",
    aadhaarNumber: "XXXX-XXXX-1357",
    registrationNumber: "MH/PWD/2024/1357",
    rejectionReason: "Incorrect material test data - sample preparation did not follow standard procedures",
    documents: [
      { name: "Work Order Document", url: "#" },
      { name: "Request Document", url: "#" }
    ],
    materials: [
      {
        category: "Asphalt",
        tests: ["Marshall Stability", "Flow Value"]
      }
    ]
  },
  {
    id: "TT-006",
    workName: "Dam Safety Assessment",
    taluka: "Satara",
    contractorName: "Water Works Ltd",
    totalAmount: 3500000,
    details: "Concrete core sample testing",
    reportStatus: "Sent",
    approvalStatus: "Approved",
    testDate: "2026-02-10",
    panNumber: "WATER8520G",
    aadhaarNumber: "XXXX-XXXX-8520",
    registrationNumber: "MH/PWD/2024/8520",
    rejectionReason: null,
    documents: [
      { name: "Work Order Document", url: "#" },
      { name: "Request Document", url: "#" }
    ],
    materials: [
      {
        category: "Concrete",
        tests: ["Core Strength", "Rebound Hammer Test"]
      }
    ]
  }
];