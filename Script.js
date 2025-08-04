const teams = [];
const players = {};
const results = JSON.parse(localStorage.getItem("results")) || [];

// Vygeneruj 12 týmů, každý se 7 hráči
for (let i = 1; i <= 12; i++) {
  const teamName = `Tým ${i}`;
  teams.push(teamName);
  players[teamName] = [];
  for (let j = 1; j <= 7; j++) {
    players[teamName].push(`${teamName} - Hráč ${j}`);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const teamSelectA = document.querySelector("select[name='teamA']");
  const teamSelectB = document.querySelector("select[name='teamB']");
  const playersA = document.getElementById("playersA");
  const playersB = document.getElementById("playersB");

  teams.forEach((team) => {
    const optionA = document.createElement("option");
    optionA.value = team;
    optionA.textContent = team;
    teamSelectA.appendChild(optionA);

    const optionB = document.createElement("option");
    optionB.value = team;
    optionB.textContent = team;
    teamSelectB.appendChild(optionB);
  });

  function updatePlayerFields(teamSelect, container, prefix) {
    container.innerHTML = "";
    const teamName = teamSelect.value;
    const teamPlayers = players[teamName] || [];
    for (let i = 0; i < 3; i++) {
      const label = document.createElement("label");
      label.textContent = `Hráč ${i + 1}: `;
      const select = document.createElement("select");
      select.name = `${prefix}-player-${i}`;
      teamPlayers.forEach((p) => {
        const opt = document.createElement("option");
        opt.value = p;
        opt.textContent = p;
        select.appendChild(opt);
      });
      const score = document.createElement("input");
      score.type = "number";
      score.name = `${prefix}-score-${i}`;
      score.min = 0;
      score.placeholder = "skóre";
      label.appendChild(select);
      label.appendChild(score);
      container.appendChild(label);
    }
  }

  teamSelectA.addEventListener("change", () => {
    updatePlayerFields(teamSelectA, playersA, "A");
  });
  teamSelectB.addEventListener("change", () => {
    updatePlayerFields(teamSelectB, playersB, "B");
  });

  document.getElementById("open-form").addEventListener("click", () => {
    document.getElementById("input-form").style.display = "block";
  });

  document.getElementById("result-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const form = e.target;
    const data = {
      round: Number(form.round.value),
      teamA: form.teamA.value,
      teamB: form.teamB.value,
      playersA: [],
      playersB: [],
    };

    for (let i = 0; i < 3; i++) {
      data.playersA.push({
        name: form[`A-player-${i}`].value,
        score: Number(form[`A-score-${i}`].value),
      });
      data.playersB.push({
        name: form[`B-player-${i}`].value,
        score: Number(form[`B-score-${i}`].value),
      });
    }

    results.push(data);
    localStorage.setItem("results", JSON.stringify(results));
    alert("Výsledek uložen.");
    form.reset();
    updateTables();
  });

  updateTables();
});

function updateTables() {
  const teamStats = {};
  const playerStats = {};

  teams.forEach((team) => {
    teamStats[team] = {
      games: 0,
      wins: 0,
      losses: 0,
      points: 0,
      totalPins: 0,
      totalPlayers: 0,
    };
  });

  results.forEach((r) => {
    let sumA = 0;
    let sumB = 0;

    r.playersA.forEach((p) => {
      sumA += p.score;
      if (!playerStats[p.name]) {
        playerStats[p.name] = { team: r.teamA, games: 0, pins: 0 };
      }
      playerStats[p.name].games++;
      playerStats[p.name].pins += p.score;
    });

    r.playersB.forEach((p) => {
      sumB += p.score;
      if (!playerStats[p.name]) {
        playerStats[p.name] = { team: r.teamB, games: 0, pins: 0 };
      }
      playerStats[p.name].games++;
      playerStats[p.name].pins += p.score;
    });

    teamStats[r.teamA].games++;
    teamStats[r.teamB].games++;
    teamStats[r.teamA].totalPins += sumA;
    teamStats[r.teamB].totalPins += sumB;
    teamStats[r.teamA].totalPlayers += 3;
    teamStats[r.teamB].totalPlayers += 3;

    if (sumA > sumB) {
      teamStats[r.teamA].wins++;
      teamStats[r.teamA].points += 2;
      teamStats[r.teamB].losses++;
    } else {
      teamStats[r.teamB].wins++;
      teamStats[r.teamB].points += 2;
      teamStats[r.teamA].losses++;
    }
  });

  const teamBody = document.getElementById("teams-body");
  teamBody.innerHTML = "";
  teams.forEach((team) => {
    const stat = teamStats[team];
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${team}</td>
      <td>${stat.games}</td>
      <td>${stat.wins}</td>
      <td>${stat.losses}</td>
      <td>${stat.points}</td>
      <td>${(stat.totalPlayers ? (stat.totalPins / stat.totalPlayers).toFixed(1) : "0")}</td>
    `;
    teamBody.appendChild(tr);
  });

  const playerBody = document.getElementById("players-body");
  playerBody.innerHTML = "";
  Object.entries(playerStats).forEach(([name, stat]) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${name}</td>
      <td>${stat.team}</td>
      <td>${stat.games}</td>
      <td>${stat.pins}</td>
      <td>${(stat.pins / stat.games).toFixed(1)}</td>
    `;
    playerBody.appendChild(tr);
  });
}
