// Bengaluru Road Safety Intelligence Dataset
// Sources: Bengaluru Traffic Police (BTP) Annual Crash Records & MoRTH Blackspot Audits 2023-2024

export const CITY_OVERVIEW_METRICS = {
  total_crashes_2023: 4974,
  crashes_trend_pct: "+12%",
  total_fatalities_2023: 915,
  fatalities_trend_pct: "+8%",
  total_injuries_2023: 6213,
  injuries_trend_pct: "+11%",
  motorcyclist_fatalities_pct: 59,
  night_time_deaths_pct: 43,
  night_time_window: "6 PM – 2 AM",
  active_blackspots_count: 10,
  critical_zones_count: 4,
  high_risk_count: 4,
  medium_risk_count: 2,
  modeled_lives_saveable: 58,
  economic_savings_cr: 84.5
};

export const BANGALORE_CORRIDORS = [
  {
    id: "BLR-001",
    name: "Silk Board Junction",
    corridor_name: "Outer Ring Road",
    location: "Outer Ring Road, Bengaluru",
    highway: "NH 44 / ORR",
    latitude: 12.9172,
    longitude: 77.6228,
    risk_score: 94,
    risk_tier: "Critical",
    status_tag: "CRITICAL RISK",
    image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80",
    banner_image: "https://images.unsplash.com/photo-1545459720-aac8509eb02c?auto=format&fit=crop&w=1200&q=85",
    stats_2023: {
      crashes: 142,
      crashes_yoy: "+27% vs. 2022",
      deaths: 23,
      deaths_yoy: "+21% vs. 2022",
      injuries: 118,
      injuries_yoy: "+16% vs. 2022"
    },
    percentile_rank: "Among top 1% highest risk corridors in Bengaluru",
    why_it_happens: [
      { factor: "Lane Weaving / Merging", percentage: 42, color: "#EF4444" },
      { factor: "Pedestrian Jaywalking", percentage: 34, color: "#F97316" },
      { factor: "Blind Spots", percentage: 24, color: "#94A3B8" }
    ],
    vulnerable_groups: [
      { group: "Two-Wheelers", percentage: 52, icon: "bike", color: "#EF4444" },
      { group: "Pedestrians", percentage: 36, icon: "pedestrian", color: "#F97316" },
      { group: "Four-Wheelers", percentage: 9, icon: "car", color: "#64748B" },
      { group: "Public Transport", percentage: 3, icon: "bus", color: "#94A3B8" }
    ],
    peak_risk: {
      time_range: "21:00 – 01:30",
      description: "Peak night-time risk (43% of total deaths)",
      hourly_bars: [
        { label: "6PM", value: 25 },
        { label: "7PM", value: 40 },
        { label: "8PM", value: 65 },
        { label: "9PM", value: 85 },
        { label: "10PM", value: 95 },
        { label: "11PM", value: 100 },
        { label: "12AM", value: 90 },
        { label: "1AM", value: 80 },
        { label: "2AM", value: 55 },
        { label: "3AM", value: 35 },
        { label: "4AM", value: 20 },
        { label: "5AM", value: 15 },
        { label: "6AM", value: 30 }
      ]
    },
    ai_prediction: {
      risk_level: "High Risk",
      confidence: "87% confidence",
      expected_crashes: "~35–45 crashes expected",
      context: "if no intervention is taken.",
      trend_points: [18, 22, 25, 29, 34, 42] // Jan, Mar, May, Jul, Sep, Nov
    },
    interventions: [
      {
        id: "INT-01",
        rank: 1,
        title: "Pedestrian Skywalk",
        subtitle: "At key crossing points",
        category: "Infrastructure",
        cost: "₹ 45 Lakhs",
        cost_num: 45,
        reduction: "-38%",
        reduction_num: 38,
        lives_saved: "+9",
        lives_num: 9,
        risk_score_impact: 18,
        timeframe: "6-8 weeks"
      },
      {
        id: "INT-02",
        rank: 2,
        title: "Speed Enforcement",
        subtitle: "Automated speed cameras",
        category: "Enforcement",
        cost: "₹ 32 Lakhs",
        cost_num: 32,
        reduction: "-28%",
        reduction_num: 28,
        lives_saved: "+6",
        lives_num: 6,
        risk_score_impact: 14,
        timeframe: "2 weeks"
      },
      {
        id: "INT-03",
        rank: 3,
        title: "Improved Lighting",
        subtitle: "LED street lighting",
        category: "Infrastructure",
        cost: "₹ 18 Lakhs",
        cost_num: 18,
        reduction: "-22%",
        reduction_num: 22,
        lives_saved: "+4",
        lives_num: 4,
        risk_score_impact: 10,
        timeframe: "1-2 weeks"
      }
    ]
  },
  {
    id: "BLR-002",
    name: "Hebbal Flyover",
    corridor_name: "NH 44",
    location: "Bellary Road / Airport Corridor, Bengaluru",
    highway: "NH 44",
    latitude: 13.0358,
    longitude: 77.5970,
    risk_score: 87,
    risk_tier: "Critical",
    status_tag: "CRITICAL RISK",
    image: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80",
    banner_image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=85",
    stats_2023: {
      crashes: 128,
      crashes_yoy: "+22% vs. 2022",
      deaths: 19,
      deaths_yoy: "+18% vs. 2022",
      injuries: 102,
      injuries_yoy: "+14% vs. 2022"
    },
    percentile_rank: "Top 2% highest fatality rate on National Highways in BLR",
    why_it_happens: [
      { factor: "Down-ramp Overspeeding", percentage: 48, color: "#EF4444" },
      { factor: "Sharp Radius Convergence", percentage: 32, color: "#F97316" },
      { factor: "Night Visibility & Fog", percentage: 20, color: "#94A3B8" }
    ],
    vulnerable_groups: [
      { group: "Two-Wheelers", percentage: 61, icon: "bike", color: "#EF4444" },
      { group: "Four-Wheelers", percentage: 25, icon: "car", color: "#F97316" },
      { group: "Pedestrians", percentage: 14, icon: "pedestrian", color: "#64748B" },
      { group: "Public Transport", percentage: 0, icon: "bus", color: "#94A3B8" }
    ],
    peak_risk: {
      time_range: "22:00 – 04:00",
      description: "High speed airport express travel window",
      hourly_bars: [
        { label: "6PM", value: 30 },
        { label: "7PM", value: 45 },
        { label: "8PM", value: 60 },
        { label: "9PM", value: 75 },
        { label: "10PM", value: 90 },
        { label: "11PM", value: 98 },
        { label: "12AM", value: 95 },
        { label: "1AM", value: 88 },
        { label: "2AM", value: 70 },
        { label: "3AM", value: 60 },
        { label: "4AM", value: 40 },
        { label: "5AM", value: 25 },
        { label: "6AM", value: 35 }
      ]
    },
    ai_prediction: {
      risk_level: "High Risk",
      confidence: "89% confidence",
      expected_crashes: "~30–38 crashes expected",
      context: "without deceleration traps.",
      trend_points: [16, 20, 24, 28, 33, 39]
    },
    interventions: [
      {
        id: "INT-04",
        rank: 1,
        title: "Dynamic Radar Speed Displays (DRSD)",
        subtitle: "Automated variable speed warnings",
        category: "Enforcement",
        cost: "₹ 24 Lakhs",
        cost_num: 24,
        reduction: "-34%",
        reduction_num: 34,
        lives_saved: "+8",
        lives_num: 8,
        risk_score_impact: 16,
        timeframe: "2-3 weeks"
      },
      {
        id: "INT-05",
        rank: 2,
        title: "High-Friction Anti-Skid Surfacing",
        subtitle: "On flyover curve descents",
        category: "Infrastructure",
        cost: "₹ 55 Lakhs",
        cost_num: 55,
        reduction: "-26%",
        reduction_num: 26,
        lives_saved: "+6",
        lives_num: 6,
        risk_score_impact: 13,
        timeframe: "4 weeks"
      },
      {
        id: "INT-06",
        rank: 3,
        title: "Reflective Crash Cushion Attenuators",
        subtitle: "At Y-junction bifurcation",
        category: "Safety Hardware",
        cost: "₹ 16 Lakhs",
        cost_num: 16,
        reduction: "-19%",
        reduction_num: 19,
        lives_saved: "+4",
        lives_num: 4,
        risk_score_impact: 9,
        timeframe: "1 week"
      }
    ]
  },
  {
    id: "BLR-003",
    name: "Tin Factory Junction",
    corridor_name: "Old Madras Road",
    location: "K.R. Puram Old Madras Rd Chokepoint, Bengaluru",
    highway: "NH 75",
    latitude: 12.9942,
    longitude: 77.6658,
    risk_score: 82,
    risk_tier: "Critical",
    status_tag: "CRITICAL RISK",
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
    banner_image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=85",
    stats_2023: {
      crashes: 96,
      crashes_yoy: "+19% vs. 2022",
      deaths: 17,
      deaths_yoy: "+15% vs. 2022",
      injuries: 71,
      injuries_yoy: "+12% vs. 2022"
    },
    percentile_rank: "Top 3% pedestrian & commuter interchange casualty zone",
    why_it_happens: [
      { factor: "Unregulated Bus Stoppages", percentage: 46, color: "#EF4444" },
      { factor: "Commuter Foot-Traffic Overflow", percentage: 35, color: "#F97316" },
      { factor: "Auto Queue Spillover", percentage: 19, color: "#94A3B8" }
    ],
    vulnerable_groups: [
      { group: "Pedestrians", percentage: 54, icon: "pedestrian", color: "#EF4444" },
      { group: "Two-Wheelers", percentage: 34, icon: "bike", color: "#F97316" },
      { group: "Auto-Rickshaws", percentage: 10, icon: "car", color: "#64748B" },
      { group: "Public Transport", percentage: 2, icon: "bus", color: "#94A3B8" }
    ],
    peak_risk: {
      time_range: "19:00 – 23:30",
      description: "Evening transit interchange rush hours",
      hourly_bars: [
        { label: "6PM", value: 60 },
        { label: "7PM", value: 85 },
        { label: "8PM", value: 95 },
        { label: "9PM", value: 90 },
        { label: "10PM", value: 75 },
        { label: "11PM", value: 50 },
        { label: "12AM", value: 35 },
        { label: "1AM", value: 25 },
        { label: "2AM", value: 15 },
        { label: "3AM", value: 10 },
        { label: "4AM", value: 15 },
        { label: "5AM", value: 30 },
        { label: "6AM", value: 55 }
      ]
    },
    ai_prediction: {
      risk_level: "High Risk",
      confidence: "84% confidence",
      expected_crashes: "~25–32 crashes expected",
      context: "without dedicated bus bays.",
      trend_points: [14, 17, 21, 25, 29, 34]
    },
    interventions: [
      {
        id: "INT-07",
        rank: 1,
        title: "Dedicated Off-Street BMTC Bus Bays",
        subtitle: "Separated from through-traffic",
        category: "Infrastructure",
        cost: "₹ 50 Lakhs",
        cost_num: 50,
        reduction: "-36%",
        reduction_num: 36,
        lives_saved: "+7",
        lives_num: 7,
        risk_score_impact: 17,
        timeframe: "4-6 weeks"
      },
      {
        id: "INT-08",
        rank: 2,
        title: "Raised Mid-Block Zebra Crossings",
        subtitle: "With pedestrian-actuated sensors",
        category: "Traffic Engineering",
        cost: "₹ 12 Lakhs",
        cost_num: 12,
        reduction: "-24%",
        reduction_num: 24,
        lives_saved: "+5",
        lives_num: 5,
        risk_score_impact: 12,
        timeframe: "1-2 weeks"
      },
      {
        id: "INT-09",
        rank: 3,
        title: "Pedestrian Guard Rails & Fencing",
        subtitle: "Continuous along 600m curb",
        category: "Infrastructure",
        cost: "₹ 15 Lakhs",
        cost_num: 15,
        reduction: "-18%",
        reduction_num: 18,
        lives_saved: "+3",
        lives_num: 3,
        risk_score_impact: 8,
        timeframe: "2 weeks"
      }
    ]
  },
  {
    id: "BLR-004",
    name: "Goraguntepalya",
    corridor_name: "Tumkur Road",
    location: "Tumkur Road / Outer Ring Rd Junction, Bengaluru",
    highway: "NH 48",
    latitude: 13.0285,
    longitude: 77.5407,
    risk_score: 78,
    risk_tier: "High",
    status_tag: "HIGH RISK",
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
    banner_image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=85",
    stats_2023: {
      crashes: 89,
      crashes_yoy: "+14% vs. 2022",
      deaths: 14,
      deaths_yoy: "+10% vs. 2022",
      injuries: 62,
      injuries_yoy: "+8% vs. 2022"
    },
    percentile_rank: "Major freight & inter-district passenger conflict junction",
    why_it_happens: [
      { factor: "Heavy Multi-Axle Truck Merging", percentage: 44, color: "#F97316" },
      { factor: "Poor Underpass Illumination", percentage: 32, color: "#FBBF24" },
      { factor: "Pedestrian Crossing on NH", percentage: 24, color: "#94A3B8" }
    ],
    vulnerable_groups: [
      { group: "Two-Wheelers", percentage: 55, icon: "bike", color: "#EF4444" },
      { group: "Pedestrians", percentage: 28, icon: "pedestrian", color: "#F97316" },
      { group: "Four-Wheelers", percentage: 12, icon: "car", color: "#64748B" },
      { group: "Public Transport", percentage: 5, icon: "bus", color: "#94A3B8" }
    ],
    peak_risk: {
      time_range: "23:00 – 03:30",
      description: "Inter-state truck entry hours",
      hourly_bars: [
        { label: "6PM", value: 35 },
        { label: "7PM", value: 50 },
        { label: "8PM", value: 65 },
        { label: "9PM", value: 75 },
        { label: "10PM", value: 85 },
        { label: "11PM", value: 92 },
        { label: "12AM", value: 95 },
        { label: "1AM", value: 88 },
        { label: "2AM", value: 78 },
        { label: "3AM", value: 60 },
        { label: "4AM", value: 40 },
        { label: "5AM", value: 25 },
        { label: "6AM", value: 30 }
      ]
    },
    ai_prediction: {
      risk_level: "High Risk",
      confidence: "82% confidence",
      expected_crashes: "~22–28 crashes expected",
      context: "during commercial freight hours.",
      trend_points: [12, 15, 18, 22, 26, 30]
    },
    interventions: [
      {
        id: "INT-10",
        rank: 1,
        title: "Underpass High-Mast LED Lighting",
        subtitle: "Floodlighting blind corners",
        category: "Infrastructure",
        cost: "₹ 18 Lakhs",
        cost_num: 18,
        reduction: "-30%",
        reduction_num: 30,
        lives_saved: "+6",
        lives_num: 6,
        risk_score_impact: 15,
        timeframe: "1-2 weeks"
      },
      {
        id: "INT-11",
        rank: 2,
        title: "Truck Speed Limiter Enforcement",
        subtitle: "Fixed radar speed gantries",
        category: "Enforcement",
        cost: "₹ 28 Lakhs",
        cost_num: 28,
        reduction: "-22%",
        reduction_num: 22,
        lives_saved: "+4",
        lives_num: 4,
        risk_score_impact: 11,
        timeframe: "3 weeks"
      },
      {
        id: "INT-12",
        rank: 3,
        title: "Illuminated Bollard Lane Dividers",
        subtitle: "Physical separation of 2-wheelers",
        category: "Traffic Engineering",
        cost: "₹ 14 Lakhs",
        cost_num: 14,
        reduction: "-16%",
        reduction_num: 16,
        lives_saved: "+3",
        lives_num: 3,
        risk_score_impact: 8,
        timeframe: "1 week"
      }
    ]
  },
  {
    id: "BLR-005",
    name: "Marathahalli Junction",
    corridor_name: "Outer Ring Road",
    location: "ORR Tech Corridor, Marathahalli, Bengaluru",
    highway: "ORR",
    latitude: 12.9562,
    longitude: 77.7019,
    risk_score: 76,
    risk_tier: "High",
    status_tag: "HIGH RISK",
    image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80",
    banner_image: "https://images.unsplash.com/photo-1545459720-aac8509eb02c?auto=format&fit=crop&w=1200&q=85",
    stats_2023: {
      crashes: 84,
      crashes_yoy: "+11% vs. 2022",
      deaths: 12,
      deaths_yoy: "+8% vs. 2022",
      injuries: 59,
      injuries_yoy: "+7% vs. 2022"
    },
    percentile_rank: "Tech park commute corridor with peak evening cab/bike collision density",
    why_it_happens: [
      { factor: "U-Turn Chaos & Cab Halting", percentage: 41, color: "#F97316" },
      { factor: "Service Road Merging Conflicts", percentage: 35, color: "#FBBF24" },
      { factor: "Jaywalking Tech Park Staff", percentage: 24, color: "#94A3B8" }
    ],
    vulnerable_groups: [
      { group: "Two-Wheelers", percentage: 58, icon: "bike", color: "#EF4444" },
      { group: "Pedestrians", percentage: 27, icon: "pedestrian", color: "#F97316" },
      { group: "Four-Wheelers", percentage: 11, icon: "car", color: "#64748B" },
      { group: "Public Transport", percentage: 4, icon: "bus", color: "#94A3B8" }
    ],
    peak_risk: {
      time_range: "20:30 – 01:00",
      description: "Late evening tech park shift releases",
      hourly_bars: [
        { label: "6PM", value: 45 },
        { label: "7PM", value: 65 },
        { label: "8PM", value: 80 },
        { label: "9PM", value: 92 },
        { label: "10PM", value: 95 },
        { label: "11PM", value: 85 },
        { label: "12AM", value: 70 },
        { label: "1AM", value: 50 },
        { label: "2AM", value: 30 },
        { label: "3AM", value: 20 },
        { label: "4AM", value: 15 },
        { label: "5AM", value: 25 },
        { label: "6AM", value: 40 }
      ]
    },
    ai_prediction: {
      risk_level: "High Risk",
      confidence: "80% confidence",
      expected_crashes: "~20–25 crashes expected",
      context: "without automated U-turn signals.",
      trend_points: [11, 14, 17, 20, 23, 27]
    },
    interventions: [
      {
        id: "INT-13",
        rank: 1,
        title: "Smart Synchronized U-Turn Signals",
        subtitle: "Eliminating free-flowing merges",
        category: "Traffic Engineering",
        cost: "₹ 22 Lakhs",
        cost_num: 22,
        reduction: "-32%",
        reduction_num: 32,
        lives_saved: "+5",
        lives_num: 5,
        risk_score_impact: 14,
        timeframe: "2 weeks"
      },
      {
        id: "INT-14",
        rank: 2,
        title: "Elevated Foot-Over-Bridge (FOB)",
        subtitle: "Between tech campuses & bus stop",
        category: "Infrastructure",
        cost: "₹ 48 Lakhs",
        cost_num: 48,
        reduction: "-25%",
        reduction_num: 25,
        lives_saved: "+4",
        lives_num: 4,
        risk_score_impact: 11,
        timeframe: "8 weeks"
      },
      {
        id: "INT-15",
        rank: 3,
        title: "Dedicated Cab Pick-up/Drop-off Bays",
        subtitle: "Behind service road curbs",
        category: "Infrastructure",
        cost: "₹ 16 Lakhs",
        cost_num: 16,
        reduction: "-17%",
        reduction_num: 17,
        lives_saved: "+3",
        lives_num: 3,
        risk_score_impact: 7,
        timeframe: "3 weeks"
      }
    ]
  },
  {
    id: "BLR-006",
    name: "KR Puram",
    corridor_name: "Old Madras Road",
    location: "K.R. Puram Hanging Bridge & Junction, Bengaluru",
    highway: "NH 75",
    latitude: 13.0012,
    longitude: 77.6963,
    risk_score: 72,
    risk_tier: "High",
    status_tag: "HIGH RISK",
    image: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80",
    banner_image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=85",
    stats_2023: {
      crashes: 79,
      crashes_yoy: "+9% vs. 2022",
      deaths: 11,
      deaths_yoy: "+6% vs. 2022",
      injuries: 53,
      injuries_yoy: "+5% vs. 2022"
    },
    percentile_rank: "Critical Eastern gateway bottleneck connecting NH 75 and ORR",
    why_it_happens: [
      { factor: "Bridge Ramp Confluence Weaving", percentage: 39, color: "#F97316" },
      { factor: "Pedestrian Transit Interchange", percentage: 36, color: "#FBBF24" },
      { factor: "Heavy Commercial Vehicles", percentage: 25, color: "#94A3B8" }
    ],
    vulnerable_groups: [
      { group: "Two-Wheelers", percentage: 48, icon: "bike", color: "#EF4444" },
      { group: "Pedestrians", percentage: 38, icon: "pedestrian", color: "#F97316" },
      { group: "Four-Wheelers", percentage: 10, icon: "car", color: "#64748B" },
      { group: "Public Transport", percentage: 4, icon: "bus", color: "#94A3B8" }
    ],
    peak_risk: {
      time_range: "21:00 – 01:00",
      description: "Late evening truck and bus junction choke",
      hourly_bars: [
        { label: "6PM", value: 50 },
        { label: "7PM", value: 70 },
        { label: "8PM", value: 85 },
        { label: "9PM", value: 90 },
        { label: "10PM", value: 88 },
        { label: "11PM", value: 80 },
        { label: "12AM", value: 65 },
        { label: "1AM", value: 45 },
        { label: "2AM", value: 30 },
        { label: "3AM", value: 20 },
        { label: "4AM", value: 15 },
        { label: "5AM", value: 25 },
        { label: "6AM", value: 45 }
      ]
    },
    ai_prediction: {
      risk_level: "High Risk",
      confidence: "78% confidence",
      expected_crashes: "~18–24 crashes expected",
      context: "without junction lane re-engineering.",
      trend_points: [10, 12, 15, 18, 22, 25]
    },
    interventions: [
      {
        id: "INT-16",
        rank: 1,
        title: "Pedestrian Subway / Walkway Redesign",
        subtitle: "Direct integration with metro & railway",
        category: "Infrastructure",
        cost: "₹ 60 Lakhs",
        cost_num: 60,
        reduction: "-35%",
        reduction_num: 35,
        lives_saved: "+6",
        lives_num: 6,
        risk_score_impact: 15,
        timeframe: "10 weeks"
      },
      {
        id: "INT-17",
        rank: 2,
        title: "Ramp Speed Attenuators & Rumble Strips",
        subtitle: "Prior to hanging bridge merge",
        category: "Safety Hardware",
        cost: "₹ 10 Lakhs",
        cost_num: 10,
        reduction: "-20%",
        reduction_num: 20,
        lives_saved: "+3",
        lives_num: 3,
        risk_score_impact: 9,
        timeframe: "1 week"
      },
      {
        id: "INT-18",
        rank: 3,
        title: "Automatic Number Plate Recognition (ANPR)",
        subtitle: "For reckless lane cutting enforcement",
        category: "Enforcement",
        cost: "₹ 20 Lakhs",
        cost_num: 20,
        reduction: "-18%",
        reduction_num: 18,
        lives_saved: "+3",
        lives_num: 3,
        risk_score_impact: 8,
        timeframe: "2 weeks"
      }
    ]
  },
  {
    id: "BLR-007",
    name: "Electronic City",
    corridor_name: "Hosur Road",
    location: "Electronic City Toll Plaza / Elevated Tollway Entrance",
    highway: "NH 44",
    latitude: 12.8452,
    longitude: 77.6602,
    risk_score: 68,
    risk_tier: "Medium",
    status_tag: "MEDIUM RISK",
    image: "https://images.unsplash.com/photo-1545459720-aac8509eb02c?auto=format&fit=crop&w=800&q=80",
    banner_image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1200&q=85",
    stats_2023: {
      crashes: 71,
      crashes_yoy: "+7% vs. 2022",
      deaths: 10,
      deaths_yoy: "+4% vs. 2022",
      injuries: 49,
      injuries_yoy: "+3% vs. 2022"
    },
    percentile_rank: "Elevated expressway toll plaza approach with high speed differential",
    why_it_happens: [
      { factor: "Toll Gate Speed Differentials", percentage: 40, color: "#FBBF24" },
      { factor: "Pedestrian Surface Road Crossing", percentage: 35, color: "#F97316" },
      { factor: "Motorcycle Tollway Ramp Violations", percentage: 25, color: "#94A3B8" }
    ],
    vulnerable_groups: [
      { group: "Two-Wheelers", percentage: 62, icon: "bike", color: "#EF4444" },
      { group: "Pedestrians", percentage: 24, icon: "pedestrian", color: "#F97316" },
      { group: "Four-Wheelers", percentage: 11, icon: "car", color: "#64748B" },
      { group: "Public Transport", percentage: 3, icon: "bus", color: "#94A3B8" }
    ],
    peak_risk: {
      time_range: "22:00 – 02:00",
      description: "Night expressway return speeds",
      hourly_bars: [
        { label: "6PM", value: 35 },
        { label: "7PM", value: 50 },
        { label: "8PM", value: 65 },
        { label: "9PM", value: 78 },
        { label: "10PM", value: 85 },
        { label: "11PM", value: 88 },
        { label: "12AM", value: 75 },
        { label: "1AM", value: 60 },
        { label: "2AM", value: 45 },
        { label: "3AM", value: 25 },
        { label: "4AM", value: 15 },
        { label: "5AM", value: 20 },
        { label: "6AM", value: 35 }
      ]
    },
    ai_prediction: {
      risk_level: "Moderate Risk",
      confidence: "81% confidence",
      expected_crashes: "~15–20 crashes expected",
      context: "without speed radar calming.",
      trend_points: [9, 11, 13, 16, 19, 22]
    },
    interventions: [
      {
        id: "INT-19",
        rank: 1,
        title: "Toll Approach Speed Tables & Rumble Strips",
        subtitle: "Staged deceleration strips",
        category: "Safety Hardware",
        cost: "₹ 15 Lakhs",
        cost_num: 15,
        reduction: "-28%",
        reduction_num: 28,
        lives_saved: "+4",
        lives_num: 4,
        risk_score_impact: 12,
        timeframe: "1 week"
      },
      {
        id: "INT-20",
        rank: 2,
        title: "High-Mast Surface Street Illumination",
        subtitle: "Covering dark toll bypass lanes",
        category: "Infrastructure",
        cost: "₹ 20 Lakhs",
        cost_num: 20,
        reduction: "-21%",
        reduction_num: 21,
        lives_saved: "+3",
        lives_num: 3,
        risk_score_impact: 9,
        timeframe: "2 weeks"
      },
      {
        id: "INT-21",
        rank: 3,
        title: "Automated Barrier for 2-Wheeler Ramp Prevention",
        subtitle: "Preventing illegal elevated highway entry",
        category: "Enforcement",
        cost: "₹ 12 Lakhs",
        cost_num: 12,
        reduction: "-15%",
        reduction_num: 15,
        lives_saved: "+2",
        lives_num: 2,
        risk_score_impact: 7,
        timeframe: "2 weeks"
      }
    ]
  },
  {
    id: "BLR-008",
    name: "Yeshwanthpur",
    corridor_name: "Tumkur Road",
    location: "Yeshwanthpur Circle / Railway Station Corridor",
    highway: "NH 48",
    latitude: 13.0223,
    longitude: 77.5528,
    risk_score: 64,
    risk_tier: "Medium",
    status_tag: "MEDIUM RISK",
    image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80",
    banner_image: "https://images.unsplash.com/photo-1545459720-aac8509eb02c?auto=format&fit=crop&w=1200&q=85",
    stats_2023: {
      crashes: 66,
      crashes_yoy: "+5% vs. 2022",
      deaths: 9,
      deaths_yoy: "+3% vs. 2022",
      injuries: 43,
      injuries_yoy: "+4% vs. 2022"
    },
    percentile_rank: "Multimodal hub with heavy market, rail, and metro passenger crossover",
    why_it_happens: [
      { factor: "Market Loading Spillover", percentage: 42, color: "#FBBF24" },
      { factor: "Station Foot-Traffic Crossings", percentage: 36, color: "#F97316" },
      { factor: "Rickshaw/Cab Curb Parking", percentage: 22, color: "#94A3B8" }
    ],
    vulnerable_groups: [
      { group: "Pedestrians", percentage: 49, icon: "pedestrian", color: "#EF4444" },
      { group: "Two-Wheelers", percentage: 41, icon: "bike", color: "#F97316" },
      { group: "Auto-Rickshaws", percentage: 7, icon: "car", color: "#64748B" },
      { group: "Public Transport", percentage: 3, icon: "bus", color: "#94A3B8" }
    ],
    peak_risk: {
      time_range: "18:30 – 22:30",
      description: "Wholesale APMC market loading and evening passenger trains",
      hourly_bars: [
        { label: "6PM", value: 65 },
        { label: "7PM", value: 85 },
        { label: "8PM", value: 90 },
        { label: "9PM", value: 80 },
        { label: "10PM", value: 65 },
        { label: "11PM", value: 45 },
        { label: "12AM", value: 30 },
        { label: "1AM", value: 20 },
        { label: "2AM", value: 15 },
        { label: "3AM", value: 15 },
        { label: "4AM", value: 25 },
        { label: "5AM", value: 45 },
        { label: "6AM", value: 60 }
      ]
    },
    ai_prediction: {
      risk_level: "Moderate Risk",
      confidence: "79% confidence",
      expected_crashes: "~14–18 crashes expected",
      context: "without market loading regulation.",
      trend_points: [8, 10, 12, 15, 17, 20]
    },
    interventions: [
      {
        id: "INT-22",
        rank: 1,
        title: "Regulated Market Freight Loading Hours",
        subtitle: "Night-only loading windows (1 AM - 5 AM)",
        category: "Enforcement",
        cost: "₹ 8 Lakhs",
        cost_num: 8,
        reduction: "-26%",
        reduction_num: 26,
        lives_saved: "+3",
        lives_num: 3,
        risk_score_impact: 11,
        timeframe: "1 week"
      },
      {
        id: "INT-23",
        rank: 2,
        title: "Continuous Pedestrian Skywalk to Metro",
        subtitle: "Direct skywalk from railway concourse",
        category: "Infrastructure",
        cost: "₹ 55 Lakhs",
        cost_num: 55,
        reduction: "-31%",
        reduction_num: 31,
        lives_saved: "+4",
        lives_num: 4,
        risk_score_impact: 13,
        timeframe: "8 weeks"
      },
      {
        id: "INT-24",
        rank: 3,
        title: "High-Visibility Crosswalks with Flashing Studs",
        subtitle: "Solar LED road studs at crosswalks",
        category: "Safety Hardware",
        cost: "₹ 11 Lakhs",
        cost_num: 11,
        reduction: "-18%",
        reduction_num: 18,
        lives_saved: "+2",
        lives_num: 2,
        risk_score_impact: 7,
        timeframe: "1 week"
      }
    ]
  }
];

// Corridor Routes for GIS Polyline rendering
export const CORRIDOR_POLYLINES = [
  {
    name: "Outer Ring Road (Silk Board to Marathahalli to Hebbal)",
    risk_level: "Critical",
    color: "#EF4444",
    weight: 4,
    coordinates: [
      [12.9172, 77.6228], // Silk Board
      [12.9248, 77.6502], // HSR
      [12.9279, 77.6834], // Bellandur
      [12.9352, 77.6947], // Devarabisanahalli
      [12.9562, 77.7019], // Marathahalli
      [12.9942, 77.6658], // Tin Factory / KR Puram
      [13.0180, 77.6320], // Kalyan Nagar
      [13.0358, 77.5970]  // Hebbal
    ]
  },
  {
    name: "Hosur Road (Silk Board to Electronic City)",
    risk_level: "High",
    color: "#F97316",
    weight: 4,
    coordinates: [
      [12.9172, 77.6228], // Silk Board
      [12.8980, 77.6380], // Bommanahalli
      [12.8710, 77.6520], // Kudlu Gate
      [12.8452, 77.6602]  // Electronic City
    ]
  },
  {
    name: "Tumkur Road (Goraguntepalya to Yeshwanthpur)",
    risk_level: "High",
    color: "#F97316",
    weight: 4,
    coordinates: [
      [13.0450, 77.5250], // Peenya
      [13.0285, 77.5407], // Goraguntepalya
      [13.0223, 77.5528]  // Yeshwanthpur
    ]
  },
  {
    name: "Old Madras Road (Tin Factory to KR Puram)",
    risk_level: "Critical",
    color: "#EF4444",
    weight: 4,
    coordinates: [
      [12.9860, 77.6480], // Indiranagar OMR
      [12.9942, 77.6658], // Tin Factory
      [13.0012, 77.6963]  // KR Puram
    ]
  }
];
