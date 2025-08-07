const testDataURL = "http://127.0.0.1:5500/src/data/mockdata.json";
// const testDataURL = "https://barbute.github.io/forms/data/mockdata.json";

const container = document.querySelector(".container")
let form;

async function readJSON(url) {
  const requestURL = url;
  const request = new Request(requestURL);

  const response = await fetch(request);
  const data = await response.json();

  if (form === undefined) {
    form = data;
  }
  buildTable(form);

  return data;
}

// Start point
readJSON(testDataURL);

const formBody = document.querySelector(".form-table-body");
const formTitle = document.querySelector(".form-title");

// Stole this from GPT lol
function to12HourTime(time24Hour) {
  const [hourStr, minuteStr] = time24Hour.split(":");
  let hour = parseInt(hourStr, 10);
  const minute = minuteStr.padStart(2, "0");

  const period = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  if (hour === 0) {
    hour = 12;
  }

  return `${hour}:${minute} ${period}`;
}

function toFormattedTimeLocal(dateUTC, timeUTC) {
  const fullDateUTC = new Date(`${dateUTC}T${timeUTC}:00Z`);
  // Date object already converts UTC to local
  const hoursLocal = fullDateUTC.getHours();
  const minutesLocal = fullDateUTC.getMinutes();
  // Display as 12-hour time
  let timeLocal;
  if (minutesLocal.toString().length === 1) {
    timeLocal = to12HourTime(`${hoursLocal}:0${minutesLocal}`);
  } else {
    timeLocal = to12HourTime(`${hoursLocal}:${minutesLocal}`);
  }
  return timeLocal;
}

// NOTE All times and dates are stored as UTC, thus will be converted to the
// user's local time and date in this function
function createDateCell(dateUTC, startTimeUTC, endTimeUTC, rowspan) {
  const months = ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", 
    "Sept", "Oct", "Nov", "Dec"];

  const startTimeLocal = toFormattedTimeLocal(dateUTC, startTimeUTC);
  const endTimeLocal = toFormattedTimeLocal(dateUTC, endTimeUTC);

  const monthLocal = months[new Date(dateUTC).getMonth()]; // Month lookup
  const dayLocal = new Date(dateUTC).getDate();

  let dateCell = `
  <td rowspan=${rowspan}>
    <p>${monthLocal} ${dayLocal}</p>
    <p>${startTimeLocal} → ${endTimeLocal}</p>
  </td>
  `;

  return dateCell;
}

function createSignUpsCell(signUps) {
  let people = "";
  for (let i = 0; i < signUps.length; i++) {
    if (i === signUps.length - 1) {
      people += signUps[i];
    } else {
      people += signUps[i] + ", ";
    }
  }
  const signUpsCell = `
    <td class="form-table-cell-signups">${people}</td>
  `;
  return signUpsCell;
}

function createCapacityCell(capacity, signUps) {
  const currentSignUps = signUps.length;
  const percentFull = signUps.length / capacity;
  let capacityColor = "";
  if (percentFull < 0.34) {
    capacityColor = "capacity-low";
  } else if (percentFull > 0.34 && percentFull < 1.0) {
    capacityColor = "capacity-med";
  } else {
    capacityColor = "capacity-max";
  }
  const capacityCell = `
    <td>
      <div class="pill ${capacityColor}">${currentSignUps}/${capacity}</div>
    </td>
  `;
  return capacityCell;
}

function addRow(slot, description, dateUTC, startTimeUTC, endTimeUTC, signUps, 
  capacity, slotsNum, currentSlot) {
  const slotCell = `
    <td>${slot}</td>
  `;

  const descriptionCell = `
    <td class="form-table-cell-description">${description}</td>
  `;

  const signUpsCell = createSignUpsCell(signUps);

  const capacityCell = createCapacityCell(capacity, signUps);


  let row;
  // If we are on the first slot for this date, add the date cell
  if (currentSlot === 0) {
    const dateCell = createDateCell(dateUTC, startTimeUTC, endTimeUTC, slotsNum);

    row = `<tr>${dateCell}${slotCell}${descriptionCell}${signUpsCell}${capacityCell}</tr>`
    formBody.innerHTML += row;
  } else {
    row = `<tr>${slotCell}${descriptionCell}${signUpsCell}${capacityCell}</tr>`;
    formBody.innerHTML += row;
  }
}

function buildTable(data) {
  const slots = data.slots;
  const dates = data.dates;

  formTitle.textContent = data.title;

  for (let entryDate of dates) {
    for (let i = 0; i < entryDate.entries.length; i++) {
      let entry = entryDate.entries[i];

      // Lookup slot for entry
      const entrySlotID = entry.slotID;
      let entrySlot;
      for (let slot of slots) {
        if (entrySlotID === slot.id) {
          entrySlot = slot;
        }
      }

      // Set variables that will be passed into row adder
      const slotName = entrySlot.name;
      const description = entrySlot.description;
      const dateUTC = entryDate.dateUTC;
      const startTimeUTC = entryDate.startTimeUTC;
      const endTimeUTC = entryDate.endTimeUTC;
      let signUps = [];
      for (let person of entry.signUps) {
        signUps.push(person.name);
      }
      const capacity = entrySlot.capacity;

      addRow(slotName, description, dateUTC, startTimeUTC, endTimeUTC, 
        signUps, capacity, entryDate.entries.length, i);
    }
  }
}
