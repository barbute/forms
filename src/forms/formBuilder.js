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

/*
 * TODO Should store date & time as UTC, then convert to CST/local time when
 * displaying. When inputting, use local browser time then convert to UTC
 */
function createDateCell(date, startTime, endTime, rowspan) {
  const months = ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", 
    "Sept", "Oct", "Nov", "Dec"];
  
  console.log(date);
  console.log(date+"T"+startTime+":00-5:00");
  let dateCell;
  const startDate = new Date(date+"T"+startTime+":00-5:00");
  const endDate = new Date(date+"T"+endTime+":00-5:00")
  dateCell = `<td rowspan=${rowspan}>${startDate.toDateString()}</td>`;

  // TODO Ensure timezone conversions are correct
  // TODO Fix date display to only show month and day when it's the current year
  // if (startTimestampUnix === endTimestampUnix) {
  //   if (isAllDay) {
  //     // TODO Fix date not spanning multiple rows
  //     dateCell = `
  //       <td rowspan=${rowspan}>${months[startDate.getMonth()]} ${startDate.getDate()} - All day</td>
  //     `;
  //   } else {
  //     // TODO Fix toTimeString() displaying the UTC time
  //     dateCell = `
  //       <td rowspan=${rowspan}>${months[startDate.getMonth()]} ${startDate.getDate()}</td>
  //     `;
  //   }
  // } else {
  //   if (isAllDay) {
  //     dateCell = `
  //       <td rowspan=${rowspan}>${months[startDate.getMonth()]} ${startDate.getDate()} → ${months[endDate.getMonth()]} ${endDate.getDate()} - All day</td>
  //     `;
  //   } else {
  //     // TODO Fix toTimeString() displaying the UTC time
  //     dateCell = `
  //       <td rowspan=${rowspan}>${months[startDate.getMonth()]} ${startDate.getDate()} → ${months[endDate.getMonth()]} ${endDate.getDate()}</td>
  //     `;
  //   }
  // }

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

function addRow(slot, description, date, startTime, endTime, signUps, 
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
    const dateCell = createDateCell(date, startTime, endTime, slotsNum);

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
      const date = entryDate.date;
      const startTime = entryDate.startTime;
      const endTime = entryDate.endTime;
      let signUps = [];
      for (let person of entry.signUps) {
        signUps.push(person.name);
      }
      const capacity = entrySlot.capacity;

      addRow(slotName, 
        description, date, startTime, endTime, signUps, capacity, entryDate.entries.length, i);
    }
  }
}
