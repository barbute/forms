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

  return data;
}

readJSON(testDataURL);
