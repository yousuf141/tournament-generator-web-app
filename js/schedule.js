init();

function init() {
  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  });

  if (!params.id) {
    const flShowScheduleFailed = document.querySelector(
      "#flShowScheduleFailed",
      HTMLDivElement
    );
    flShowScheduleFailed.removeAttribute("hidden");
    return;
  }

  const txtCopyLink = document.querySelector("#txtCopyLink", HTMLInputElement);
  txtCopyLink.value = window.location;

  updateSchedule(params.id);
}

async function updateSchedule(id) {
  let retrievedSchedule = await retrieveSchedule(id);
  if (retrievedSchedule == null) {
    retrievedSchedule = await createSchedule(id);
  }
  if (retrievedSchedule == null) {
    const flShowScheduleFailed = document.querySelector(
      "#flGetTournamentFailed",
      HTMLDivElement
    );
    flShowScheduleFailed.removeAttribute("hidden");
    return;
  }

  const tournament = await getTournamentInfo(retrievedSchedule.tournament);
  retrievedSchedule.tournament = tournament;

  displaySchedule(retrievedSchedule);
}

async function retrieveSchedule(id) {
  try {
    const res = await fetch(`http://localhost:3000/schedule/${id}`, {
      method: "GET",
    });
    const data = await res.json();

    return data;
  } catch (e) {
    console.error(e);
    displayGetScheduleError();
  }
}

async function createSchedule(id) {
  try {
    const res = await fetch(`http://localhost:3000/schedule/${id}`, {
      method: "POST",
    });
    const data = await res.json();

    return data;
  } catch (e) {
    console.error(e);
    return null;
  }
}

async function getTournamentInfo(tournamentId) {
  try {
    const res = await fetch(
      `http://localhost:3000/tournament/${tournamentId}`,
      {
        method: "GET",
      }
    );
    if (res.status >= 400) return null;
    return await res.json();
  } catch (e) {
    console.error(e);
    return null;
  }
}

function displayGetScheduleError() {
  const flGetScheduleFailed = document.querySelector(
    "#flGetScheduleFailed",
    HTMLDivElement
  );
  flGetScheduleFailed.removeAttribute("hidden");
}

function displaySchedule(schedule) {
  const $ = go.GraphObject.make;

  myDiagram = $(go.Diagram, "tot-generation-diagram", {
    "textEditingTool.starting": go.TextEditingTool.SingleClick,
    "textEditingTool.textValidation": isValidScore,
    layout: $(go.TreeLayout, { angle: 180 }),
    "undoManager.isEnabled": true,
  });

  // validation function for editing text
  function isValidScore(textblock, oldstr, newstr) {
    if (newstr === "") return true;
    var num = parseInt(newstr, 10);
    return !isNaN(num) && num >= 0 && num < 1000;
  }

  // define a simple Node template
  myDiagram.nodeTemplate = $(
    go.Node,
    "Auto",
    { selectable: false },
    $(
      go.Shape,
      "Rectangle",
      { fill: "#00D5FF", stroke: "#000" },
      new go.Binding("fill", "color")
    ),
    $(
      go.Panel,
      "Table",
      $(go.RowColumnDefinition, { column: 0, separatorStroke: "black" }),
      $(go.RowColumnDefinition, {
        column: 1,
        separatorStroke: "black",
        background: "white",
      }),
      $(go.RowColumnDefinition, { row: 0, separatorStroke: "black" }),
      $(go.RowColumnDefinition, { row: 1, separatorStroke: "black" }),
      $(
        go.TextBlock,
        "",
        {
          row: 0,
          wrap: go.TextBlock.None,
          margin: 5,
          width: 175,
          isMultiline: false,
          textAlign: "left",
          font: "10pt  Segoe UI,sans-serif",
          stroke: "black",
        },
        new go.Binding("text", "player1").makeTwoWay()
      ),
      $(
        go.TextBlock,
        "",
        {
          row: 1,
          wrap: go.TextBlock.None,
          margin: 5,
          width: 175,
          isMultiline: false,
          textAlign: "left",
          font: "10pt  Segoe UI,sans-serif",
          stroke: "black",
        },
        new go.Binding("text", "player2").makeTwoWay()
      ),
      $(
        go.TextBlock,
        "",
        {
          column: 1,
          row: 0,
          wrap: go.TextBlock.None,
          margin: 2,
          width: 25,
          isMultiline: false,
          editable: true,
          textAlign: "left",
          font: "10pt  Segoe UI,sans-serif",
          stroke: "black",
        },
        new go.Binding("text", "score1").makeTwoWay()
      ),
      $(
        go.TextBlock,
        "",
        {
          column: 1,
          row: 1,
          wrap: go.TextBlock.None,
          margin: 2,
          width: 25,
          isMultiline: false,
          editable: true,
          textAlign: "left",
          font: "10pt  Segoe UI,sans-serif",
          stroke: "black",
        },
        new go.Binding("text", "score2").makeTwoWay()
      )
    )
  );

  // define the Link template
  myDiagram.linkTemplate = $(
    go.Link,
    {
      routing: go.Link.Orthogonal,
      selectable: false,
    },
    $(go.Shape, { strokeWidth: 2, stroke: "black" })
  );

  // Generates the original graph from an array of player names
  function createPairs(players) {
    if (players.length % 2 !== 0) players.push("(empty)");
    var startingGroups = players.length / 2;
    var currentLevel = Math.ceil(Math.log(startingGroups) / Math.log(2));
    var levelGroups = [];
    var currentLevel = Math.ceil(Math.log(startingGroups) / Math.log(2));
    for (var i = 0; i < startingGroups; i++) {
      levelGroups.push(currentLevel + "-" + i);
    }
    var totalGroups = [];
    makeLevel(levelGroups, currentLevel, totalGroups, players);
    return totalGroups;
  }

  function makeLevel(levelGroups, currentLevel, totalGroups, players) {
    currentLevel--;
    var len = levelGroups.length;
    var parentKeys = [];
    var parentNumber = 0;
    var p = "";
    for (var i = 0; i < len; i++) {
      if (parentNumber === 0) {
        p = currentLevel + "-" + parentKeys.length;
        parentKeys.push(p);
      }

      if (players !== null) {
        var p1 = players[i * 2];
        var p2 = players[i * 2 + 1];
        totalGroups.push({
          key: levelGroups[i],
          parent: p,
          player1: p1,
          player2: p2,
          parentNumber: parentNumber,
        });
      } else {
        totalGroups.push({
          key: levelGroups[i],
          parent: p,
          parentNumber: parentNumber,
        });
      }

      parentNumber++;
      if (parentNumber > 1) parentNumber = 0;
    }

    // after the first created level there are no player names
    if (currentLevel >= 0)
      makeLevel(parentKeys, currentLevel, totalGroups, null);
  }

  function makeModel(players) {
    var model = new go.TreeModel(createPairs(players));

    model.addChangedListener((e) => {
      if (e.propertyName !== "score1" && e.propertyName !== "score2") return;
      var data = e.object;
      if (isNaN(data.score1) || isNaN(data.score2)) return;

      var parent = myDiagram.findNodeForKey(data.parent);
      if (parent === null) return;

      var playerName =
        parseInt(data.score1) > parseInt(data.score2)
          ? data.player1
          : data.player2;
      if (parseInt(data.score1) === parseInt(data.score2)) playerName = "";
      myDiagram.model.setDataProperty(
        parent.data,
        data.parentNumber === 0 ? "player1" : "player2",
        playerName
      );
    });

    myDiagram.model = model;
  }

  let arr1 = [];
  schedule.matches.forEach((x) => {
    arr1.push(x.team_1);
    arr1.push(x.team_2);
  });

  makeModel(arr1);
}
