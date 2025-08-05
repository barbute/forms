// const testDataURL = "http://127.0.0.1:5500/src/data/mockdata.json";
const testDataURL = "https://barbute.github.io/forms/data/mockdata.json";

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

function createDateCell(startTimestampUnix, endTimestampUnix, isAllDay) {
  // Convert UNIX timestamps to milliseconds
  startTimestampUnix = startTimestampUnix * 1000;
  endTimestampUnix = endTimestampUnix * 1000;
  // Convert milliseconds to JS Date object
  const startDate = new Date(startTimestampUnix);
  const endDate = new Date(endTimestampUnix);
  let dateCell;
  // TODO Fix date display to only show month and day when it's the current year
  if (startTimestampUnix === endTimestampUnix) {
    if (isAllDay) {
      dateCell = `
        <td>${startDate.toDateString()}</td>
      `;
    } else {
      // TODO Fix toTimeString() displaying the UTC time
      dateCell = `
        <td>${startDate.toTimeString()}</td>
      `;
    }
  } else {
    if (isAllDay) {
      dateCell = `
        <td>${startDate.toDateString()} → ${endDate.toDateString()}</td>
      `;
    } else {
      // TODO Fix toTimeString() displaying the UTC time
      dateCell = `
        <td>${startDate.toTimeString()} → ${endDate.toTimeString()}</td>
      `;
    }
  }
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

function addRow(slot, description, startTimestampUnix, 
  endTimestampUnix, isAllDay, signUps, capacity) {
  const slotCell = `
    <td>${slot}</td>
  `;

  const descriptionCell = `
    <td class="form-table-cell-description">${description}</td>
  `;

  const dateCell = createDateCell(startTimestampUnix, 
    endTimestampUnix, isAllDay);

  const signUpsCell = createSignUpsCell(signUps);

  const capacityCell = createCapacityCell(capacity, signUps);

  formBody.innerHTML += `<tr>${slotCell}${descriptionCell}${dateCell}${signUpsCell}${capacityCell}<tr>`;
}

function buildTable(data) {
  const slots = data.slots;
  const dates = data.dates;

  formTitle.textContent = data.title;

  for (let date of dates) {
    for (entry of date.entries) {
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
      const startDate = date.startDate;
      const endDate = date.endDate;
      const allDay = date.allDay;
      let signUps = [];
      for (let person of entry.signUps) {
        signUps.push(person.name);
      }
      const capacity = entrySlot.capacity;

      addRow(slotName, 
        description, startDate, endDate, allDay, signUps, capacity);
    }
  }
}
