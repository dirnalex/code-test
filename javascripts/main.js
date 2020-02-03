const HEIGHTS = ["short", "tall"];
const WEIGHTS = ["slim", "fat"];
const GENDERS = ["female", "male"];

function labelCells(table) {
  table.querySelectorAll("tbody tr").forEach(function (row, rowIndex) {
    row.querySelectorAll("td").forEach(function (cell, colIndex) {
      cell.setAttribute("data-row", rowIndex);
      cell.setAttribute("data-col", colIndex);
    });
  });
}

labelCells(document.getElementById("lake"));

function setCharacteristics(table) {
  table.querySelectorAll("td label.frog").forEach(function (cell) {
    cell.setAttribute("data-height", getRandomElement(HEIGHTS));
    cell.setAttribute("data-weight", getRandomElement(WEIGHTS));
  });
}

setCharacteristics(document.getElementById("lake"));

function getRandomElement(arr) {
  return arr[getRandomInt(arr.length)];
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function getCheckedCells(container) {
  const checkedCells = [];
  container.querySelectorAll("input:checked").forEach(function (checkedInput) {
    const parentCell = checkedInput.closest("td");
    checkedCells.push({
      row: parseInt(parentCell.getAttribute("data-row")),
      col: parseInt(parentCell.getAttribute("data-col"))
    });
  });
  return checkedCells;
}

function onJump() {
  const checkedCells = getCheckedCells(document.getElementById("lake"));

  if (checkedCells.length !== 2) {
    alert("Select 2 cells to jump");
    return;
  }

  if (noFrogHere(checkedCells[0]) && noFrogHere(checkedCells[1])) {
    alert("Select at least one frog");
    return;
  }

  if (frogHere(checkedCells[0]) && frogHere(checkedCells[1])) {
    alert("2 frogs selected - select one free space");
    return;
  }

  if (notOnOneLine(checkedCells[0], checkedCells[1])) {
    alert("Frog can only jump by line (including diagonal)");
    return;
  }

  const frogCell = frogHere(checkedCells[0]) ? checkedCells[0] : checkedCells[1];
  const emptyCell = frogHere(checkedCells[0]) ? checkedCells[1] : checkedCells[0];

  if(isMale(frogCell) && distance(frogCell, emptyCell) !== 3) {
    alert("Male frog can jump only on 3 cells");
    return;
  }

  if(isFemale(frogCell) && distance(frogCell, emptyCell) !== 2) {
    alert("Female frog can jump only on 2 cells");
    return;
  }

  jump(frogCell, emptyCell);

  clearSelections(document.getElementById("lake"));
}

function jump(fromCell, toCell) {
  const labeFromParent = getCellLabel(fromCell).parentNode;

  getCellLabel(toCell).parentNode.replaceChild(getCellLabel(fromCell), getCellLabel(toCell));

  labeFromParent.innerHTML = '<label><input type="checkbox"></label>';
}

function onReproduce() {
  const checkedCells = getCheckedCells(document.getElementById("lake"));

  if (checkedCells.length !== 2 || (noFrogHere(checkedCells[0]) || noFrogHere(checkedCells[1]))) {
    alert("Select 2 frogs to reproduce");
    return;
  }

  if(distance(checkedCells[0], checkedCells[1]) > 1) {
    alert("Frogs should be together to reproduce");
    return;
  }

  if((isMale(checkedCells[0]) && isMale(checkedCells[1])) ||
    (isFemale(checkedCells[0]) && isFemale(checkedCells[1]))) {
    alert("Frogs should have different gender to reproduce");
    return;
  }

  const femaleCell = isFemale(checkedCells[0]) ? checkedCells[0] : checkedCells[1];
  const maleCell = isMale(checkedCells[0]) ? checkedCells[0] : checkedCells[1];

  try {
    reproduce(femaleCell, maleCell);
    clearSelections(document.getElementById("lake"));
  } catch (e) {
    alert(e.message);
  }
}

function reproduce(motherCell, fatherCell) {
  const childCharacteristics = createChildCharacteristics(motherCell, fatherCell);

  const childCell = selectChildCell(motherCell);

  getCellLabel(childCell).className = "frog " + childCharacteristics.gender;
  getCellLabel(childCell).setAttribute("data-weight", childCharacteristics.weight);
  getCellLabel(childCell).setAttribute("data-height", childCharacteristics.height);
}

function createChildCharacteristics(motherCell, fatherCell) {
  const availableWeights = [
    getCellLabel(motherCell).getAttribute("data-weight"),
    getCellLabel(fatherCell).getAttribute("data-weight")
  ];
  const availableHeights = [
    getCellLabel(motherCell).getAttribute("data-height"),
    getCellLabel(fatherCell).getAttribute("data-height")
  ];

  return {
    weight: getRandomElement(availableWeights),
    height: getRandomElement(availableHeights),
    gender: getRandomElement(GENDERS)
  };
}

function selectChildCell(motherCell) {
  for (let row = motherCell.row - 1; row <= motherCell.row + 1 ; row++) {
    for (let col = motherCell.col - 1; col <= motherCell.col + 1 ; col++) {
      const cell = {row, col};
      if (cellOnGrid(cell) && noFrogHere(cell)) {
        return cell;
      }
    }
  }
  throw Error("No place to reproduce");
}

function clearSelections(lake) {
  lake.querySelectorAll("input:checked").forEach(function (input) {
    input.checked = false;
  });
}

function distance(cell1, cell2) {
  return Math.max(Math.abs(cell1.row - cell2.row), Math.abs(cell1.col - cell2.col));
}

function cellOnGrid(cell) {
  const lakeSize = getLakeSize(document.getElementById("lake"));
  return cell.row >= 0 && cell.col >= 0 && cell.col < lakeSize.width && cell.row < lakeSize.height;
}

function getLakeSize(lake) {
  let height = 0;
  let width = 0;
  lake.querySelectorAll("tr").forEach(function (row, rowIndex) {
    row.querySelectorAll("td").forEach(function (cell, colIndex) {
      height = Math.max(height, rowIndex+1);
      width = Math.max(width, colIndex+1);
    });
  });
  return {height, width};
}


function isOnOneLine(cell1, cell2) {
  if (cell1.row === cell2.row) return true;
  if (cell1.col === cell2.col) return true;
  return Math.abs(cell1.col - cell2.col) === Math.abs(cell1.row - cell2.row);

}

function notOnOneLine(cell1, cell2) {
  return !isOnOneLine(cell1, cell2);
}

function isMale(cell) {
  if (!getCellLabel(cell)) return false;
  return getCellLabel(cell).className.match(/\bmale\b/);
}

function isFemale(cell) {
  if (!getCellLabel(cell)) return false;
  return getCellLabel(cell).className.match(/\bfemale\b/);
}

function frogHere(cell) {
  if (!getCellLabel(cell)) return false;
  return getCellLabel(cell).className.match(/\bfrog\b/);
}

function getCellLabel(cell) {
  const selector = "#lake td[data-row=\"" + cell.row + "\"][data-col=\"" + cell.col + "\"] label";
  return document.querySelector(selector);
}

function noFrogHere(cell) {
  return !frogHere(cell);
}

document.getElementById("jump").addEventListener("click", onJump);

document.getElementById("reproduce").addEventListener("click", onReproduce);