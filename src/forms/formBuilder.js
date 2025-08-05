const testDataURL = "http://127.0.0.1:5500/src/data/mockdata.json";

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
  console.log(form);
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
  if (startDate === endDate) {
    if (isAllDay) {
      dateCell = `
        <td>${startDate.toDateString()}</td>
      `;
    } else {
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
      dateCell = `
        <td>${startDate.toTimeString()} → ${endDate.toTimeString()}</td>
      `;
    }
  }
  return dateCell;
}

function createSignupsCell(signups) {
  let people = "";
  for (let i = 0; i < signups.length; i++) {
    if (i === signups.length - 1) {
      people += signups[i];
    } else {
      people += signups[i] + ", ";
    }
  }
  const signupsCell = `
    <td>${people}</td>
  `;
  return signupsCell;
}

function createCapacityCell(capacity, signups) {
  const currentSignups = signups.length;
  const percentFull = signups / capacity;
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
      <span class="pill ${capacityColor}">${currentSignups}/${capacity}</span>
    </td>
  `;
  return capacityCell;
}

function addRow(slot, description, startTimestampUnix, 
  endTimestampUnix, isAllDay, signups, capacity) {
  const slotCell = `
    <td>${slot}</td>
  `;

  const descriptionCell = `
    <td>${description}</td>
  `;

  const dateCell = createDateCell(startTimestampUnix, 
    endTimestampUnix, isAllDay);

  const signupsCell = createSignupsCell(signups);

  const capacityCell = createCapacityCell(capacity);

  formBody.innerHTML += `<tr>${slotCell}<tr>`;
  formBody.innerHTML += `<tr>${descriptionCell}<tr>`;
  formBody.innerHTML += `<tr>${dateCell}<tr>`;
  formBody.innerHTML += `<tr>${signupsCell}<tr>`;
  formBody.innerHTML += `<tr>${capacityCell}<tr>`;
}

function buildTable(data) {
  const slots = data.slots;
  const entries = data.entries;

  formTitle.textContent = data.title;
}
