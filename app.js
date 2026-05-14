// -------------------------------
// GLOBAL STATE
// -------------------------------
let pathwaysData = {};
let universitiesData = [];
let degreeProfiles = [];

// -------------------------------
// LOAD DATA.JSON
// -------------------------------
const pathwaysPromise = fetch("data.json")
  .then(res => res.json())
  .then(data => {
    pathwaysData = data || {};
    console.log("Pathways loaded");
  })
  .catch(err => console.error("Pathways error:", err));

  

// -------------------------------
// LOAD DEGREE PROFILES
// -------------------------------
fetch("degree_profiles.json")
  .then(res => res.json())
  .then(data => {
    degreeProfiles = data || [];
    console.log("Degree profiles loaded");
  })
  .catch(err => console.error("Degree profiles error:", err));

// -------------------------------
// LOAD UNIVERSITY FILE
// -------------------------------
async function loadUniversitiesFile(background) {
  let file = "universities.json";

  if (background === "FSc_Pre_Medical") {
    file = "medical.json";
  }

  try {
    const res = await fetch(file);
    const data = await res.json();

    universitiesData = Array.isArray(data)
      ? data
      : Object.values(data).flatMap(x => x.career_paths || []);

    console.log("Universities loaded:", file);
  } catch (err) {
    console.error("University load error:", err);
    universitiesData = [];
  }
}

// -------------------------------
// MAIN FUNCTION
// -------------------------------
async function findCareer() {
  const bg = document.getElementById("background").value;
  const marks = parseFloat(document.getElementById("marks").value);
  const resultsDiv = document.getElementById("results");

  if (!pathwaysData || Object.keys(pathwaysData).length === 0) {
    resultsDiv.innerHTML = "<p>Loading data...</p>";
    await pathwaysPromise;
  }

  const selected = pathwaysData[bg];

  if (!selected) {
    resultsDiv.innerHTML = "<p>Invalid background selection</p>";
    return;
  }

  await loadUniversitiesFile(bg);

  let html = `<p class="results-title">Available Paths</p>`;
  let found = false;

  selected.career_paths.forEach(c => {
    if (marks >= c.eligibility.min_percentage) {
      found = true;

      html += `
        <div class="career-card" onclick="showUniversities('${bg}', '${c.code}')">
          <div class="career-icon">🎓</div>
          <div>
            <div class="career-name">${c.degree}</div>
            <div class="career-hint">${c.duration}</div>
          </div>
          <span class="career-arrow">›</span>
        </div>
      `;
    }
  });

  if (!found) {
    html = "<p>No eligible careers found for your marks.</p>";
  }

  resultsDiv.innerHTML = html;
}

// -------------------------------
// NORMALIZE FUNCTION
// -------------------------------
function normalizeProgram(code) {
  return (code || "").trim().toUpperCase();
}

// -------------------------------
// SHOW UNIVERSITIES
// -------------------------------
function showUniversities(background, programCode) {
  const resultsDiv = document.getElementById("results");

  const searchCode = normalizeProgram(programCode);

  if (!universitiesData.length) {
    resultsDiv.innerHTML = "<p>Loading universities...</p>";
    return;
  }

  const matched = universitiesData.filter(uni =>
    (uni.programs || []).map(normalizeProgram).includes(searchCode)
  );

  if (!matched.length) {
    resultsDiv.innerHTML = `
      <div class="detail-card">
        <h3>${programCode}</h3>
        <p>No universities found.</p>
        <button class="back-btn" onclick="findCareer()">← Back</button>
      </div>
    `;
    return;
  }

  let html = `<p class="results-title">Universities offering ${programCode}</p>`;

  matched.forEach(uni => {
    html += `
      <div class="career-card" onclick="showDegreeDetails('${uni.id}', '${programCode}')">
        <div class="career-icon">🏫</div>
        <div>
          <div class="career-name">${uni.name}</div>
          <div class="career-hint">${uni.city} • Tier ${uni.tier}</div>
        </div>
        <span class="career-arrow">›</span>
      </div>
    `;
  });

  html += `<button class="back-btn" onclick="findCareer()">← Back</button>`;

  resultsDiv.innerHTML = html;
}

// -------------------------------
// SHOW DEGREE DETAILS
// -------------------------------
// -------------------------------
// SHOW DEGREE DETAILS
// -------------------------------
function showDegreeDetails(universityId, programCode) {

  const uni = universitiesData.find(u => u.id === universityId);
  const degree = degreeProfiles.find(d => d.code === programCode);

  if (!uni || !degree) {
    console.log("University or degree not found");
    return;
  }

  const modal = document.getElementById("detailModal");
  const content = document.getElementById("detailContent");

  content.innerHTML = `
    
    <div class="detail-page">

      <!-- HERO -->
      <div class="detail-hero">

        <button class="detail-back" onclick="closeModal()">
          ← Back
        </button>

        <div class="detail-category-tag">
          ${programCode}
        </div>

        <h1 class="detail-title">
          🎓 ${degree.full_form}
        </h1>

        <div class="detail-meta">
          <span class="detail-meta-badge green">
            ${uni.name}
          </span>

          <span class="detail-meta-badge">
            ${uni.city}
          </span>

          <span class="detail-meta-badge">
            Tier ${uni.tier}
          </span>
        </div>

      </div>

      <!-- BODY -->
      <div class="detail-body">

        <!-- LEFT SIDE -->
        <div class="detail-sections">

          <div class="detail-section">
            <div class="section-label">
              Description
            </div>

            <p class="section-text">
              ${degree.description || "No description available."}
            </p>
          </div>

          <div class="detail-section">
            <div class="section-label">
              Career Scope
            </div>

            <p class="section-text">
              ${degree.scope || "Scope information unavailable."}
            </p>
          </div>

          <div class="detail-section">
            <div class="section-label">
              Career Sectors
            </div>

            <div class="skills-grid">
              ${(degree.sectors || [])
                .map(
                  sector => `
                    <span class="skill-tag">
                      ${sector}
                    </span>
                  `
                )
                .join("")}
            </div>
          </div>

        </div>

        <!-- RIGHT SIDE -->
        <div class="detail-sidebar">

          <div class="sidebar-card">
            <h4>ENTRY TEST</h4>

            <div class="salary-display">
              ${uni.entry_test || "N/A"}
            </div>

            <div class="salary-unit">
              Required for admission
            </div>
          </div>

          <div class="sidebar-card">
            <h4>DURATION</h4>

            <div class="salary-display">
              4 Years
            </div>

            <div class="salary-unit">
              Approximate degree duration
            </div>
          </div>

          <div class="sidebar-card">
            <h4>CAREER SCOPE</h4>

            <div class="scope-bar">
              <div class="scope-bar-fill" style="width: 85%;"></div>
            </div>

            <div class="salary-unit" style="margin-top:10px;">
              High demand field
            </div>
          </div>
<!-- APPLY BUTTON -->
<button 
  class="apply-btn"
  onclick="applyNow('${uni.id}', '${programCode}')"
>
  Apply Now →
</button>

<!-- EDUCATION PATH BUTTON -->
<button 
  class="apply-btn"
  style="margin-top:10px; background: rgba(0,255,136,0.08);"
  onclick="showEducationPath('${uni.id}', '${programCode}')"
>
  🎓 View Education Path
</button>
          

        </div>

      </div>

    </div>
  `;

  modal.classList.remove("hidden");
}

// -------------------------------
// CLOSE MODAL
// -------------------------------
// -------------------------------
// APPLY NOW → OPEN UNIVERSITY WEBSITE
// -------------------------------
function applyNow(universityId, programCode) {

  const uni = universitiesData.find(u => u.id === universityId);

  if (!uni) {
    alert("University not found!");
    return;
  }

  if (!uni.website) {
    alert("Website not available for this university.");
    return;
  }

  closeModal();
  window.open(uni.website, "_blank");
}

// -------------------------------
// CLOSE MODAL
// -------------------------------
function closeModal() {
  const modal = document.getElementById("detailModal");
  if (modal) modal.classList.add("hidden");
}

// -------------------------------
// EDUCATION PATH VIEW
// -------------------------------
function showEducationPath(universityId, programCode) {

  const uni = universitiesData.find(u => u.id === universityId);
  const bg = document.getElementById("background").value;

  if (!uni) return;

  const modal = document.getElementById("detailModal");
  const content = document.getElementById("detailContent");

  const steps = [
    { title: "Background", value: bg },
    { title: "Degree", value: programCode },
    { title: "University", value: uni.name },
    { title: "Career Outcome", value: `Professional in ${programCode}` }
  ];

  content.innerHTML = `
    <div class="detail-page">

      <div class="detail-hero">
        <button class="detail-back" onclick="closeModal()">← Back</button>

        <div class="detail-category-tag">🎓 Education Path</div>

        <h1 class="detail-title">Your Career Journey</h1>
      </div>

      <div class="detail-body">

        <div class="detail-sections">

          <div class="detail-section">
            <div class="section-label">Timeline</div>

            <div class="progress-timeline">
              <div class="progress-line"></div>
              <div class="progress-fill"></div>

              ${steps.map((s, i) => `
                <div class="progress-step" style="animation-delay:${i * 0.15}s">
                  <div class="node"></div>
                  <div class="step-content">
                    <h3>${s.title}</h3>
                    <p>${s.value}</p>
                  </div>
                </div>
              `).join("")}

            </div>

          </div>

        </div>

      </div>

    </div>
  `;

  modal.classList.remove("hidden");

  setTimeout(() => {
    const fill = content.querySelector(".progress-fill");
    if (fill) fill.style.height = "100%";
  }, 100);
  // ------------------------
  // SAVE PATH FEATURE ------
  // ------------------------
  function saveEducationPath(universityId, programCode) {

  const uni = universitiesData.find(u => u.id === universityId);
  const bg = document.getElementById("background").value;

  if (!uni) return;

  const path = {
    id: Date.now(),
    background: bg,
    program: programCode,
    university: uni.name
  };

  let saved = JSON.parse(localStorage.getItem("savedPaths")) || [];
  saved.push(path);

  localStorage.setItem("savedPaths", JSON.stringify(saved));

  alert("✅ Path Saved Successfully!");
} 
}

