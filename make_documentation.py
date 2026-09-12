"""
SafeRoute AI — Project Documentation PDF Generator
Builds a simple, non-technical guide (per hackathon upload requirements) as a PDF.
Run:  python make_documentation.py
"""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Table,
    TableStyle, PageBreak, KeepTogether
)
from reportlab.platypus import HRFlowable

# ---------------------------------------------------------------- palette
NAVY = HexColor("#0A0E17")
NAVY_CARD = HexColor("#0F172A")
AMBER = HexColor("#F59E0B")
AMBER_LIGHT = HexColor("#FDE68A")
GREEN = HexColor("#22C55E")
RED = HexColor("#EF4444")
ORANGE = HexColor("#F97316")
YELLOW = HexColor("#EAB308")
SLATE = HexColor("#64748B")
SLATE_LIGHT = HexColor("#94A3B8")
BG_SOFT = HexColor("#F8FAFC")
WHITE = HexColor("#FFFFFF")

PAGE_W, PAGE_H = A4
OUT_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                        "Project_Documentation_SafeRoute_AI.pdf")

# ---------------------------------------------------------------- styles
S = {}
S["cover_title"] = ParagraphStyle("cover_title", fontName="Helvetica-Bold",
    fontSize=30, leading=36, textColor=WHITE, alignment=TA_CENTER)
S["cover_sub"] = ParagraphStyle("cover_sub", fontName="Helvetica",
    fontSize=13, leading=18, textColor=AMBER_LIGHT, alignment=TA_CENTER)
S["cover_meta"] = ParagraphStyle("cover_meta", fontName="Helvetica",
    fontSize=11, leading=16, textColor=SLATE_LIGHT, alignment=TA_CENTER)
S["h1"] = ParagraphStyle("h1", fontName="Helvetica-Bold", fontSize=17,
    leading=22, textColor=NAVY, spaceBefore=6, spaceAfter=6)
S["h2"] = ParagraphStyle("h2", fontName="Helvetica-Bold", fontSize=12.5,
    leading=17, textColor=SLATE, spaceBefore=10, spaceAfter=4)
S["body"] = ParagraphStyle("body", fontName="Helvetica", fontSize=10.5,
    leading=15.5, textColor=NAVY, alignment=TA_LEFT, spaceAfter=6)
S["bullet"] = ParagraphStyle("bullet", fontName="Helvetica", fontSize=10.5,
    leading=15.5, textColor=NAVY, leftIndent=14, bulletIndent=4, spaceAfter=4)
S["step"] = ParagraphStyle("step", fontName="Courier", fontSize=9.5,
    leading=14, textColor=NAVY_CARD, backColor=BG_SOFT, borderPadding=6,
    leftIndent=6, spaceBefore=2, spaceAfter=6)
S["note"] = ParagraphStyle("note", fontName="Helvetica-Oblique", fontSize=9.5,
    leading=14, textColor=SLATE, leftIndent=10, spaceAfter=6)
S["cell"] = ParagraphStyle("cell", fontName="Helvetica", fontSize=10,
    leading=14, textColor=NAVY)
S["cell_head"] = ParagraphStyle("cell_head", fontName="Helvetica-Bold",
    fontSize=10, leading=14, textColor=WHITE)

# ---------------------------------------------------------------- page painters
def paint_cover(canv, doc):
    canv.saveState()
    canv.setFillColor(NAVY)
    canv.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)
    # logo shield (drawn: amber shield, navy road, white dashes, green node)
    cx, cy = PAGE_W / 2, PAGE_H - 120
    canv.setFillColor(WHITE)
    shield_rim(canv, cx, cy, scale=1.12)
    canv.setFillColor(AMBER)
    shield_body(canv, cx, cy, scale=1.0)
    canv.setStrokeColor(NAVY); canv.setLineWidth(2.2)
    shield_body(canv, cx, cy, scale=1.0, stroke_only=True)
    canv.setFillColor(NAVY)
    canv.roundRect(cx - 7.2, cy - 20, 14.4, 30, 2, stroke=0, fill=1)
    canv.setStrokeColor(WHITE); canv.setLineWidth(1.6)
    canv.setDash(3.5, 3)
    canv.line(cx, cy - 18, cx, cy + 7)
    canv.setDash()
    canv.setFillColor(GREEN); canv.setStrokeColor(WHITE); canv.setLineWidth(1.4)
    canv.circle(cx, cy - 27, 4.4, stroke=1, fill=1)
    canv.restoreState()


def shield_rim(canv, cx, cy, scale=1.0):
    p = canv.beginPath()
    p.moveTo(cx, cy + 42 * scale)
    p.lineTo(cx + 36 * scale, cy + 30 * scale)
    p.lineTo(cx + 36 * scale, cy - 2 * scale)
    p.curveTo(cx + 36 * scale, cy - 26 * scale, cx + 20 * scale, cy - 40 * scale,
              cx, cy - 50 * scale)
    p.curveTo(cx - 20 * scale, cy - 40 * scale, cx - 36 * scale, cy - 26 * scale,
              cx - 36 * scale, cy - 2 * scale)
    p.lineTo(cx - 36 * scale, cy + 30 * scale)
    p.close()
    canv.drawPath(p, stroke=0, fill=1)


def shield_body(canv, cx, cy, scale=1.0, stroke_only=False):
    p = canv.beginPath()
    p.moveTo(cx, cy + 36 * scale)
    p.lineTo(cx + 31 * scale, cy + 25 * scale)
    p.lineTo(cx + 31 * scale, cy - 1 * scale)
    p.curveTo(cx + 31 * scale, cy - 22 * scale, cx + 17 * scale, cy - 35 * scale,
              cx, cy - 43 * scale)
    p.curveTo(cx - 17 * scale, cy - 35 * scale, cx - 31 * scale, cy - 22 * scale,
              cx - 31 * scale, cy - 1 * scale)
    p.lineTo(cx - 31 * scale, cy + 25 * scale)
    p.close()
    if stroke_only:
        canv.drawPath(p, stroke=1, fill=0)
    else:
        canv.drawPath(p, stroke=0, fill=1)


def paint_content(canv, doc):
    canv.saveState()
    canv.setStrokeColor(SLATE_LIGHT); canv.setLineWidth(0.6)
    canv.line(20 * mm, 14 * mm, PAGE_W - 20 * mm, 14 * mm)
    canv.setFont("Helvetica", 8)
    canv.setFillColor(SLATE)
    canv.drawString(20 * mm, 9.5 * mm,
                    "SafeRoute AI - Project Documentation (Simple Guide)")
    canv.drawRightString(PAGE_W - 20 * mm, 9.5 * mm, "Page %d" % doc.page)
    # thin amber top strip
    canv.setFillColor(AMBER)
    canv.rect(0, PAGE_H - 6, PAGE_W, 6, stroke=0, fill=1)
    canv.restoreState()


class Doc(BaseDocTemplate):
    def __init__(self, path, **kw):
        super().__init__(path, pagesize=A4, **kw)
        cover = PageTemplate(id="cover",
                             frames=[Frame(16 * mm, 16 * mm, PAGE_W - 32 * mm,
                                           PAGE_H - 32 * mm, id="cf")],
                             onPage=paint_cover)
        body = PageTemplate(id="body",
                            frames=[Frame(20 * mm, 18 * mm, PAGE_W - 40 * mm,
                                          PAGE_H - 34 * mm, id="bf")],
                            onPage=paint_content)
        self.addPageTemplates([cover, body])


# ---------------------------------------------------------------- helpers
def P(text, style="body"):
    return Paragraph(text, S[style])


def bullet(text):
    return Paragraph(text, S["bullet"], bulletText="-")


def table(headers, rows, widths):
    data = [[Paragraph(h, S["cell_head"]) for h in headers]]
    for r in rows:
        data.append([Paragraph(c, S["cell"]) for c in r])
    t = Table(data, colWidths=widths, repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY_CARD),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, BG_SOFT]),
        ("GRID", (0, 0), (-1, -1), 0.5, SLATE_LIGHT),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    return t


def legend_table():
    rows = [
        ["", Paragraph('<font color="#EF4444"><b>RED</b></font>', S["cell"]),
         "Most dangerous - needs urgent fixing"],
        ["", Paragraph('<font color="#F97316"><b>ORANGE</b></font>', S["cell"]),
         "Risky - high priority"],
        ["", Paragraph('<font color="#EAB308"><b>YELLOW</b></font>', S["cell"]),
         "Average - monitor and schedule work"],
        ["", Paragraph('<font color="#22C55E"><b>GREEN</b></font>', S["cell"]),
         "Comparatively safe"],
    ]
    t = Table(rows, colWidths=[8 * mm, 28 * mm, 120 * mm])
    style = [("TOPPADDING", (0, 0), (-1, -1), 4),
             ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
             ("LEFTPADDING", (0, 0), (-1, -1), 6)]
    for i in range(1, 5):
        style.append(("BACKGROUND", (0, i), (0, i),
                      [RED, ORANGE, YELLOW, GREEN][i - 1]))
    t.setStyle(TableStyle(style))
    return t


def build_story():
    story = []

    # ============================================================ COVER
    story.append(Spacer(1, 78 * mm))
    story.append(P("SafeRoute AI", "cover_title"))
    story.append(Spacer(1, 3 * mm))
    story.append(P("Bengaluru NightRide - Predictive Road Safety Platform",
                   "cover_sub"))
    story.append(Spacer(1, 24 * mm))
    story.append(P("PROJECT DOCUMENTATION", "cover_sub"))
    story.append(Spacer(1, 2 * mm))
    story.append(P("A simple, self-contained guide to what this project does, "
                   "what problem it solves, how to set it up and run it, and "
                   "the main tools used - written for non-technical readers.",
                   "cover_meta"))
    story.append(Spacer(1, 30 * mm))
    story.append(P("IBM Bob National Hackathon 2026", "cover_meta"))
    story.append(P("Team 042 - Team Null Pointers", "cover_meta"))
    story.append(P("Problem Statement PS-3: RoadSafe India (Transport)",
                   "cover_meta"))
    story.append(P("Version 1.0 - Documentation for project setup and execution",
                   "cover_meta"))
    story.append(PageBreak())

    # ============================================================ 1. WHAT IS IT
    story.append(P("1. What is SafeRoute AI? (Plain-language introduction)"))
    story.append(HRFlowable(width="100%", thickness=1, color=AMBER,
                            spaceAfter=8))
    story.append(P(
        "SafeRoute AI is a computer system that studies the roads of Bengaluru "
        "and predicts where road accidents are most likely to happen - "
        "<b>before they happen</b>. The easiest way to understand it is to "
        "think of a <b>weather forecast, but for road safety</b>: instead of "
        "saying there is a 70% chance of rain tomorrow, our system says things "
        "like this stretch of Outer Ring Road is high risk at night, here is "
        "why, and here is what to fix first."))
    story.append(P(
        "The system divides the city's main roads into small pieces of about "
        "500 metres each (roughly the length of five football fields). Each "
        "piece receives a <b>Safety Report Card</b> - a score from 0 to 100: "
        "a <b>high score</b> means the road piece is comparatively safe, while "
        "a <b>low score</b> means it is dangerous and should be fixed early."))
    story.append(Spacer(1, 2 * mm))
    story.append(legend_table())
    story.append(Spacer(1, 4 * mm))
    story.append(P(
        "In total, the current version studies <b>428 road pieces covering "
        "about 162 kilometres</b> of Bengaluru's most important corridors: "
        "Outer Ring Road, Hosur Road, and the Old Madras Road / Whitefield "
        "route. It also matches every road piece to the police station area "
        "it belongs to, using records from all <b>48 Bengaluru Traffic Police "
        "stations</b>."))

    # ============================================================ 2. PROBLEM
    story.append(P("2. The Problem We Solve"))
    story.append(HRFlowable(width="100%", thickness=1, color=AMBER,
                            spaceAfter=8))
    story.append(P(
        "Bengaluru recorded <b>4,974 road accidents and 915 deaths in one "
        "year (2023)</b>, according to official Bengaluru Traffic Police "
        "records. Nearly <b>43% of night-time deaths happen between 6 PM and "
        "2 AM</b> - people travelling home in the dark are at the greatest "
        "risk."))
    story.append(P(
        "Today, the authorities work <b>reactively</b>: a dangerous spot is "
        "usually identified only <b>after</b> accidents have already happened "
        "there. That approach costs lives. City engineers also face a hard "
        "question: with a limited budget, which roads should be repaired "
        "first?"))
    story.append(P(
        "SafeRoute AI answers that question with data instead of guesswork: "
        "it ranks the most dangerous road pieces, explains why each one is "
        "dangerous, and estimates how much safer each suggested repair would "
        "make it. This turns accident management from <b>reacting after "
        "tragedy</b> into <b>predicting and preventing</b>."))

    # ============================================================ 3. SIX QUESTIONS
    story.append(P("3. What the System Does (The Six Questions)"))
    story.append(HRFlowable(width="100%", thickness=1, color=AMBER,
                            spaceAfter=8))
    story.append(P("For every road piece, the system answers six practical "
                   "questions that road-safety officers actually ask:"))
    for q, a in [
        ("<b>WHERE</b> will accidents most likely happen?",
         "A colour-coded map of the city shows the risk of every road piece."),
        ("<b>WHY</b> is that road dangerous?",
         "The system points to the reasons: missing street lighting, too many "
         "junctions, high traffic speed, bus stops without safe crossings, "
         "and more."),
        ("<b>WHO</b> is most at risk there?",
         "It identifies the vulnerable people: motorcyclists (45.3% of "
         "Bengaluru's road deaths) and pedestrians (36.8%)."),
        ("<b>WHEN</b> is the risk highest?",
         "It applies night-time risk factors - unlit roads are treated as "
         "about 45% riskier at night, based on national road-safety studies."),
        ("<b>WHAT</b> should be fixed first?",
         "It produces a ranked to-do list of repairs, starting with the fix "
         "that brings the biggest safety improvement."),
        ("<b>WILL</b> the repair actually work?",
         "A built-in what-if calculator shows the expected safety gain of "
         "each repair before any money is spent."),
    ]:
        story.append(bullet("%s  %s" % (q, a)))
    story.append(Spacer(1, 4 * mm))
    story.append(P(
        "The city can then turn any recommendation into a tracked project: "
        "the system saves the plan with an assigned city agency (BBMP, BTP, "
        "NHAI or DULT), a budget field, and a progress status - so ideas "
        "become accountable, funded work."))

    # ============================================================ 4. USING IT
    story.append(P("4. How to Use It (The Website Dashboard)"))
    story.append(HRFlowable(width="100%", thickness=1, color=AMBER,
                            spaceAfter=8))
    story.append(P("Once the project is running (next section), open "
                   "<b>http://localhost:5173</b> in Chrome, Edge or Firefox. "
                   "You will see a control-room style screen. Here is what "
                   "each part does - no training needed:"))
    story.append(table(
        ["Screen Part", "What It Shows and How to Use It"],
        [
            ["Colour-coded map (centre)",
             "A satellite map of Bengaluru. Every road piece is drawn as a "
             "coloured line: red = most dangerous, orange = risky, yellow = "
             "average, green = comparatively safe. Use the + / - buttons to "
             "zoom, and the layers button to switch between map, satellite "
             "and traffic views."],
            ["Road list (left panel)",
             "A searchable list of all 428 road pieces with their safety "
             "scores. Use the search box and the risk-level filter to narrow "
             "it down, or click a corridor name to see only that route."],
            ["Details panel (right)",
             "Click any road piece on the map or in the list. The panel opens "
             "its Safety Report Card: the score, why it is risky (with "
             "percentage reasons), which people are most in danger, and the "
             "police-station accident history for that area."],
            ["What-If calculator (Simulate button)",
             "Choose repairs such as new LED street lighting, speed cameras, "
             "pedestrian crossings or junction redesign. The system instantly "
             "recalculates the road's score and shows the expected "
             "improvement. You can save the scenario with a name for later "
             "review."],
            ["Top search bar (Ctrl + K)",
             "Quick search across all road pieces and police stations using "
             "the keyboard."],
            ["Status badges (top right)",
             "Show whether the background service is connected (Live) or "
             "stopped (Offline). If it says Offline, the maps and scores "
             "cannot load - see the troubleshooting note below."],
            ["Mobile screens",
             "On a phone, the layout switches to tabbed views (Map / Roads / "
             "Details) so everything stays usable on small screens."],
        ],
        widths=[38 * mm, 128 * mm]))

    # ============================================================ 5. RUN IT
    story.append(P("5. How to Set Up and Run the Project (Step by Step)"))
    story.append(HRFlowable(width="100%", thickness=1, color=AMBER,
                            spaceAfter=8))
    story.append(P("The project has <b>two parts</b> that run together:"))
    story.append(bullet("<b>The engine</b> - a background service that holds "
                        "the road data and the safety calculations. It must be "
                        "started first."))
    story.append(bullet("<b>The website</b> - the colourful dashboard you see "
                        "in the browser. It asks the engine for information."))
    story.append(P("Follow these steps once, in order. They take about "
                   "10 minutes the first time."))

    story.append(P("Step 1 - Install two free programs (only needed once)",
                   "h2"))
    story.append(bullet("Install <b>Python 3.10 or newer</b> from "
                        "python.org (tick Add Python to PATH during install)."))
    story.append(bullet("Install <b>Node.js 18 or newer</b> from nodejs.org "
                        "(choose the LTS version)."))
    story.append(bullet("Restart your computer after installing both."))

    story.append(P("Step 2 - Start the engine (background service)", "h2"))
    story.append(P("Open the Command Prompt, go to the project folder, then "
                   "run these lines one at a time:", "note"))
    story.append(P("cd backend", "step"))
    story.append(P("python -m venv venv", "step"))
    story.append(P("venv\\Scripts\\activate", "step"))
    story.append(P("pip install -r requirements.txt", "step"))
    story.append(P("python scripts\\seed_database.py", "step"))
    story.append(P("uvicorn backend.main:app --reload --port 8000", "step"))
    story.append(P("When you see the line Application startup complete, the "
                   "engine is ready. Keep this window open - closing it stops "
                   "the engine. You can check it any time by opening "
                   "http://localhost:8000/health in the browser: it should say "
                   "healthy.", "note"))

    story.append(P("Step 3 - Start the website (dashboard)", "h2"))
    story.append(P("Open a <b>second</b> Command Prompt window and run:",
                   "note"))
    story.append(P("cd frontend", "step"))
    story.append(P("npm install", "step"))
    story.append(P("npm run dev", "step"))
    story.append(P("Then open <b>http://localhost:5173</b> in your browser. "
                   "The dashboard loads the live road-safety map and scores.",
                   "note"))

    story.append(P("Troubleshooting", "h2"))
    story.append(bullet("<b>Website says Backend Offline:</b> the engine "
                        "(Step 2) is not running, or was started in a closed "
                        "window. Start it again and refresh the browser."))
    story.append(bullet("<b>python is not recognised:</b> Python was not added "
                        "to PATH - reinstall and tick Add Python to PATH."))
    story.append(bullet("<b>npm is not recognised:</b> install Node.js from "
                        "nodejs.org and reopen the Command Prompt."))
    story.append(bullet("<b>Port already in use:</b> another program uses "
                        "8000 or 5173. Close the other program, or run the "
                        "website again - the system automatically picks the "
                        "next free port (5174, 5175) and shows it."))

    # ============================================================ 6. TOOLS
    story.append(P("6. Main Tools and Languages Used"))
    story.append(HRFlowable(width="100%", thickness=1, color=AMBER,
                            spaceAfter=8))
    story.append(table(
        ["Tool / Language", "What It Is and Why We Use It"],
        [
            ["Python", "The main programming language of the engine. Easy to "
             "read and widely used for data work."],
            ["FastAPI", "A free Python tool that lets the website ask the "
             "engine questions and get answers, like a helpful receptionist."],
            ["React (with JavaScript)", "The toolkit that builds the website "
             "screens - the map, lists, panels and buttons - and makes them "
             "respond instantly to clicks."],
            ["scikit-learn", "A machine-learning library: the part that "
             "studied past accident records and road features to learn how "
             "to score each road piece."],
            ["Leaflet", "The free map-drawing library that shows the "
             "satellite view of Bengaluru with the coloured road lines."],
            ["GeoPandas and OpenStreetMap data", "Free world-map data that "
             "provides the road layout, junctions, crossings and bus stops "
             "used in the safety calculations."],
            ["SQLite", "A small built-in notebook (database) that stores "
             "saved what-if plans and repair projects."],
            ["Vite", "The tool that starts the website quickly while "
             "developers work on it."],
            ["HTML and CSS", "The standard languages that give the website "
             "its structure and its dark control-room styling."],
        ],
        widths=[46 * mm, 120 * mm]))

    # ============================================================ 7. DATA
    story.append(P("7. Where the Information Comes From"))
    story.append(HRFlowable(width="100%", thickness=1, color=AMBER,
                            spaceAfter=8))
    story.append(bullet("<b>Bengaluru Traffic Police (BTP)</b> - official "
                        "yearly accident counts for each of the 48 traffic "
                        "police station areas (2020-2023), published on the "
                        "OpenCity public data portal."))
    story.append(bullet("<b>OpenStreetMap</b> - the volunteer-built free "
                        "world map, providing roads, junctions, pedestrian "
                        "crossings and bus stops."))
    story.append(bullet("<b>KGIS (Karnataka government map portal)</b> - the "
                        "official police station boundary map."))
    story.append(bullet("<b>MoRTH / NCRB national studies</b> - central "
                        "government road-safety research used for night-time "
                        "and road-user risk factors."))
    story.append(P("We follow a strict honesty rule: <b>no accident number is "
                   "ever invented</b>. Where information is missing (for "
                   "example, an unknown speed limit), the system says so "
                   "instead of guessing, and every road piece carries a "
                   "confidence label so users know how much to trust each "
                   "score.", "note"))

    # ============================================================ 8. LIMITS
    story.append(P("8. What the System Can and Cannot Do (Important Notes)"))
    story.append(HRFlowable(width="100%", thickness=1, color=AMBER,
                            spaceAfter=8))
    story.append(bullet("<b>It is a decision-support tool, not a fortune "
                        "teller.</b> The scores highlight where risk is "
                        "concentrated so that engineers and police can act "
                        "first where it matters most. They are guidance, not "
                        "guarantees."))
    story.append(bullet("<b>Accident counts come per police-station area.</b> "
                        "Official records do not include exact accident spots, "
                        "so road features (lighting, junctions, crossings) "
                        "provide the differences within each area."))
    story.append(bullet("<b>Three corridors are covered today.</b> Outer Ring "
                        "Road, Hosur Road and the Whitefield route. The same "
                        "method can be repeated for any other road in the "
                        "city."))
    story.append(bullet("<b>Safety improvements are estimates.</b> The "
                        "what-if calculator is based on the learned model and "
                        "accepted road-safety research; actual results should "
                        "always be verified with before-and-after field "
                        "studies."))
    story.append(bullet("<b>It runs entirely on your own computer.</b> No "
                        "private or personal data is collected, and no "
                        "internet service is required beyond the initial map "
                        "background images."))

    # ============================================================ 9. TEAM
    story.append(P("9. About the Team"))
    story.append(HRFlowable(width="100%", thickness=1, color=AMBER,
                            spaceAfter=8))
    story.append(P("SafeRoute AI was built by <b>Team 042 (Team Null Pointers)"
                   "</b> for the <b>IBM Bob National Hackathon 2026</b>, "
                   "problem statement <b>PS-3: RoadSafe India (Transport)"
                   "</b>. The work is shared across three areas: the website "
                   "dashboard, the background engine, and the safety-scoring "
                   "brain that learns from data."))
    story.append(Spacer(1, 4 * mm))
    thanks = Table(
        [[Paragraph("Acknowledgements. We thank the Bengaluru Traffic Police "
                    "and the OpenCity public data portal for publishing "
                    "official accident statistics; KGIS and the Karnataka "
                    "government for police boundary maps; the OpenStreetMap "
                    "contributors for the free road map; and MoRTH / NCRB for "
                    "national road-safety research. This project exists to "
                    "help make Bengaluru's nights safer for everyone.",
                    S["cell"])]],
        colWidths=[166 * mm])
    thanks.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), AMBER_LIGHT),
        ("BOX", (0, 0), (-1, -1), 0.8, AMBER),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
    ]))
    story.append(thanks)
    return story


# ---------------------------------------------------------------- build
def main():
    doc = Doc(OUT_PATH)
    doc.build(build_story())
    print("PDF created:", OUT_PATH)


if __name__ == "__main__":
    main()


