init();

function init() {
  refreshTournamentUI();

  // on team size changes
  const sltTournamentSize = document.querySelector(
    "#sltTournamentSize",
    HTMLSelectElement
  );
  sltTournamentSize.addEventListener("change", () => refreshTournamentUI());

  // generate
  const btnGenerateTournament = document.querySelector(
    "#btnGenerateTournament",
    HTMLButtonElement
  );
  btnGenerateTournament.addEventListener("click", () =>
    onGenerateTournamentSchedule()
  );

  // team name tools
  const btnClearTeamNames = document.querySelector(
    "#btnClearTeamNames",
    HTMLButtonElement
  );
  btnClearTeamNames.addEventListener("click", () => clearTeamNames());

  const btnRandomiseTeamNames = document.querySelector(
    "#btnRandomiseTeamNames",
    HTMLButtonElement
  );
  btnRandomiseTeamNames.addEventListener("click", () => randomiseTeamNames());
}

function refreshTournamentUI() {
  const sltTournamentSize = document.querySelector(
    "#sltTournamentSize",
    HTMLSelectElement
  );

  const tournamentSize = parseInt(sltTournamentSize.value);
  if (isNaN(tournamentSize)) {
    console.error("tournament size is an invalid value.");
    return;
  }

  const newDivTournameentNameSelection =
    getTournamentNameSelectionElement(tournamentSize);

  const divTournamentNameSelection = document.querySelector(
    "#tournamentNameSelection",
    HTMLDivElement
  );

  divTournamentNameSelection.replaceWith(newDivTournameentNameSelection);
}

function getTournamentNameSelectionElement(tournamentSize) {
  const newDiv = document.createElement("div");
  newDiv.setAttribute("id", "tournamentNameSelection");

  let counter = 1;

  for (let i = 0; i < Math.ceil(tournamentSize / 4); i++) {
    const row = document.createElement("div");
    row.setAttribute("class", "row mb-3");

    for (let j = 0; j < 4; j++) {
      const col = document.createElement("div");
      col.setAttribute("class", "col");

      const input = document.createElement("input");
      input.setAttribute("class", "form-control tournament-name-value");
      input.setAttribute("type", "text");
      input.placeholder = `${counter++}: `;

      col.appendChild(input);
      row.appendChild(col);
    }

    newDiv.appendChild(row);
  }
  return newDiv;
}

function onGenerateTournamentSchedule() {
  const txtTournamentName = document.querySelector(
    "#txtTournamentName",
    HTMLInputElement
  );
  const sltTournamentSize = document.querySelector(
    "#sltTournamentSize",
    HTMLSelectElement
  );
  const sltTournamentType = document.querySelector(
    "#sltTournamentType",
    HTMLSelectElement
  );
  const tournamentNameValueEls = document.querySelectorAll(
    ".tournament-name-value",
    HTMLInputElement
  );

  let tournamentNameValues = [];
  tournamentNameValueEls.forEach((x) => {
    tournamentNameValues.push(x.value);
  });

  const payload = {
    tournament: {
      name: txtTournamentName.value,
      size: parseInt(sltTournamentSize.value),
      type: sltTournamentType.value,
      teamNames: tournamentNameValues,
    },
  };

  const spinner = document.querySelector(
    "#spnGenerateTournament",
    HTMLDivElement
  );
  const btnGenerateTournament = document.querySelector(
    "#btnGenerateTournament",
    HTMLButtonElement
  );

  spinner.removeAttribute("hidden");
  btnGenerateTournament.setAttribute("disabled", true);

  fetch("http://localhost:3000/tournament", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((data) => {
      if (data.status >= 400) {
        toastGenerateError();
        return;
      }
      toastGenerateSuccess();
      window.open("http://localhost:3000/tournament/626df4ca3b5c8efc6b52a3e6");
    })
    .catch((err) => {
      console.error(err);
      displayGenerateError();
    })
    .finally(() => {
      spinner.setAttribute("hidden", true);
      btnGenerateTournament.removeAttribute("disabled");
    });
}

function toastGenerateError() {
  const flGenerateTournament = document.querySelector(
    "#flGenerateTournamentFailed",
    HTMLDivElement
  );
  flGenerateTournament.removeAttribute("hidden");
  setTimeout(() => flGenerateTournament.setAttribute("hidden", true), 3000);
}

function toastGenerateSuccess() {
  const flGenerateTournament = document.querySelector(
    "#flGenerateTournamentSuccess",
    HTMLDivElement
  );
  flGenerateTournament.removeAttribute("hidden");
  setTimeout(() => flGenerateTournament.setAttribute("hidden", true), 3000);
}

function clearTeamNames() {
  const teamNameEls = document.querySelectorAll(".tournament-name-value");
  teamNameEls.forEach((x) => {
    x.value = "";
  });
}

async function randomiseTeamNames() {
  const randomNames = await getRandomNames();

  let randomNameCounter = 0;

  const teamNameEls = document.querySelectorAll(".tournament-name-value");
  teamNameEls.forEach((x) => {
    if (x.value === "") {
      x.value = randomNames[randomNameCounter++];
    }
  });
}

async function getRandomNames() {
  try {
    const res = await fetch("http://localhost:3000/random-name");
    return await res.json();
  } catch (e) {
    console.error(e);
  }
}
