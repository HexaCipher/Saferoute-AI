# SafeRoute AI — Bengaluru NightRide
### Project Documentation (Simple Guide)

**IBM Bob National Hackathon 2026 • Team 042 (Team Null Pointers)**
**Problem Statement: PS-3 — RoadSafe India (Transport)**

---

## 1. What Is This Project?

**SafeRoute AI — Bengaluru NightRide** is a smart web dashboard that helps make Bengaluru's roads safer at night.

Think of it like a **weather forecast, but for road accidents**. Instead of telling you where rain might fall, it tells the traffic police and city engineers **where accidents are most likely to happen** — and, even better, **what to fix first** to prevent them.

The dashboard shows a satellite map of Bengaluru with roads colour-coded by danger level:

- 🔴 **Red** — high danger, needs urgent attention
- 🟠 **Orange / 🟡 Yellow** — medium danger
- 🟢 **Green** — relatively safe

Anyone can look at this map and immediately understand which stretches of road need help — no technical knowledge needed.

---

## 2. The Problem We Solve

Every year, thousands of people lose their lives on Indian roads. In 2023 alone, Bengaluru recorded **915 deaths** and **4,974 crashes** — and a large share of these deaths happen **at night, between 6 PM and 2 AM**.

Today, the authorities mostly work **reactively**: they arrive *after* a crash has already happened.

SafeRoute AI changes this. It answers six simple but powerful questions:

| Question | How SafeRoute AI Answers It |
|---|---|
| **WHERE** will accidents happen? | A colour-coded map of 428 road sections, each with a Safety Score from 0–100 |
| **WHY** do accidents happen there? | Simple explanations: too many junctions, poor lighting, no pedestrian crossings, etc. |
| **WHO** is most at risk? | Two-wheeler riders and pedestrians are highlighted as the most vulnerable groups |
| **WHEN** is it most dangerous? | Night-time danger hours are clearly marked and factored into every score |
| **WHAT** should be fixed first? | A ranked "Fix This First" list with estimated cost and expected benefit |
| **WILL** the fix actually help? | A "What-If" calculator that estimates lives saved before spending any money |

In short: **we help the city spend its safety budget where it will save the most lives.**

---

## 3. What the Dashboard Shows

When you open SafeRoute AI, you get a control room–style website with these main areas:

1. **Satellite Risk Map** — the whole city's road network, colour-coded by risk. Click any road section to see its Safety Score, crash history, and *why* it got that score.
2. **City Overview** — big headline numbers: total road sections analysed, high-risk count, most vulnerable road users, and the city's average Safety Score.
3. **Risk Analysis** — a deeper look at which roads are worst and what factors (lighting, junctions, speed) are driving the danger.
4. **What-If Simulator** — pick a fix, such as "add street lighting" or "add a pedestrian crossing," and instantly see how much the Safety Score improves and roughly how many lives could be saved.
5. **Fix This First** — a ready-made priority list of actions, ordered by lives saved per rupee spent.
6. **Action Tracker** — a to-do list for the city: assign each fix to an agency, set a budget, and track its status from *Planned* → *In Progress* → *Completed*.
7. **Reports & Export** — download the data as a CSV file to share with any other office or software.

---

## 4. How to Run It on Your Computer

You need about **10 minutes** and two free tools installed. No paid services, no special hardware, no internet account required.

### Step 0 — What You Need First

Install these two free programs (if you don't already have them):

| Tool | Where to Get It | How to Check It Works |
|---|---|---|
| **Python** (version 3.10 or newer) | https://www.python.org/downloads/ | Open a terminal and type `python --version` |
| **Node.js** (version 18 or newer) | https://nodejs.org/ | Open a terminal and type `node --version` |

> 💡 On Windows, open the terminal (Command Prompt) from the Start Menu. On Mac/Linux, open the Terminal app.

### Step 1 — Get the Project Files

Download (or clone) the project folder from the team's GitHub page, then open a terminal *inside* that folder.

### Step 2 — Start the "Brain" (the Backend)

The backend is the engine that holds the map data, the safety scores, and the smart predictions.

```bash
# 1. Go into the backend folder
cd backend

# 2. Create a private, isolated workspace for this project
python -m venv venv

# 3. Switch on that workspace
#    On Windows:
venv\Scripts\activate
#    On Mac/Linux:
source venv/bin/activate

# 4. Install everything the project needs (one-time, a few minutes)
pip install -r requirements.txt

# 5. Load the city data (48 police zones + 428 road sections) into the database
python scripts/seed_database.py

# 6. Switch the engine on!
uvicorn backend.main:app --reload --port 8000
```

✅ **Check it worked:** open your browser and go to **http://localhost:8000/health**. If you see a message saying the status is healthy, you're done.

### Step 3 — Start the Website (the Frontend)

Open a **second** terminal window (keep the first one running!) and type:

```bash
# 1. Go into the frontend folder
cd frontend

# 2. Install the website's building blocks (one-time)
npm install

# 3. Copy the sample settings file
#    (on Windows, the file is called .env.example — rename your copy to .env)
copy .env.example .env      # Windows
cp .env.example .env        # Mac/Linux

# 4. Switch the website on!
npm run dev
```

✅ **Check it worked:** open your browser and go to **http://localhost:5173**. The SafeRoute AI dashboard will appear, showing the live map with all 428 scored road sections.

> ⚠️ **Important:** the website must be started *after* the backend (Step 2) is running. If the dashboard shows an "offline" message, it means the backend engine isn't switched on yet.

### Step 4 — Try It Out!

- Click a **red road** on the map → read *why* it is dangerous.
- Open the **What-If Simulator** → add "street lighting" to that road → watch the score improve and see the estimated lives saved.
- Open **Fix This First** → see the city's top-priority fixes, ranked.
- Go to **Reports** → download a CSV to share with a colleague.

### Stopping Everything

When you're finished, click each terminal window and press **Ctrl + C** once to shut down the website and the engine.

---

## 5. Using the Dashboard — A Quick Tour

| You Want To… | Do This |
|---|---|
| See the most dangerous roads | Look at the map — red sections are the highest risk |
| Understand a road's score | Click the section on the map; a panel lists the reasons |
| Test a safety idea | Open the Simulator, choose the road and the fix, press Simulate |
| Decide what to fix first | Open "Fix This First" — the list is already ranked for you |
| Track the city's repairs | Open the Action Tracker and update each item's status |
| Share results with someone | Use Reports → Export CSV |

---

## 6. Main Tools and Languages Used

You do **not** need to understand these to use the project — this list is for reviewers and curious readers.

| Tool / Language | What It Does in This Project | In Simple Words |
|---|---|---|
| **Python** | The main language of the "brain" | The language the prediction engine is written in |
| **FastAPI** | Connects the engine to the website | The messenger between the data and the screen |
| **scikit-learn (Gradient Boosting)** | The machine-learning model | The part that *learns* from past crash data to predict danger |
| **pandas / GeoPandas / OSMnx** | Data preparation and map maths | Tools that read spreadsheets and map data |
| **SQLite** | Stores the results | A simple file-based database — no server setup needed |
| **JavaScript / React** | The dashboard website | The language and toolkit behind the screen you interact with |
| **Vite** | Runs and packages the website | A fast helper that starts the website during development |
| **MapLibre GL + Esri Satellite Imagery** | The interactive satellite map | The map technology you see and click on |
| **Docker / render.yaml / vercel.json** | Deployment helpers | Files that let the project be published online easily |

**Where the data comes from (all official and public):**
- **Bengaluru Traffic Police (BTP)** — official crash counts for 48 traffic police zones
- **OpenStreetMap** — free map of roads, junctions, crossings, and street lighting
- **MoRTH / NCRB** — national road-safety studies used to calibrate night risk
- **KGIS / Karnataka Government** — police boundary maps

---

## 7. Things to Keep in Mind

- **This is a decision-support tool, not a fortune teller.** The scores show where risk is concentrated so officials can act first where it matters most. They are guidance, not guarantees.
- **Crash data is counted per police-station area.** Official records don't include exact accident spots, so road features (lighting, junctions, crossings) provide the finer detail within each area.
- **Three corridors are covered today** — Outer Ring Road, Hosur Road, and the Whitefield route. The same method can be repeated for any other road in the city.
- **The lives-saved numbers are careful estimates,** based on the learned model and accepted road-safety research. Real-world results should be confirmed with before-and-after field studies.
- **Everything runs on your own computer.** No personal data is collected and no online account is needed (beyond loading the map background images).

---

## 8. About the Team

SafeRoute AI was built by **Team 042 (Team Null Pointers)** for the **IBM Bob National Hackathon 2026**, problem statement **PS-3: RoadSafe India (Transport)**.

The work is shared across three areas: the website dashboard, the background engine, and the safety-scoring brain that learns from data.

**Acknowledgements.** We thank the Bengaluru Traffic Police and the OpenCity public data portal for publishing official accident statistics; KGIS and the Karnataka government for police boundary maps; the OpenStreetMap contributors for the free road map; and MoRTH / NCRB for national road-safety research. This project exists to help make Bengaluru's nights safer for everyone.

---

<div align="center">

**Predict. Explain. Prioritize. Save lives.** 🛣️

</div>

