const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

const dbPath = path.join(__dirname, "covid19India.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
const convert = (object) => {
  return {
    stateId: object.state_id,
    stateName: object.state_name,
    population: object.population,
  };
};
const convertDistrict = (object) => {
  return {
    districtId: object.district_id,
    districtName: object.district_name,
    stateId: object.state_id,
    cases: object.cases,
    cured: object.cured,
    active: object.active,
    deaths: object.deaths,
  };
};

initializeDBAndServer();
app.get("/states/", async (request, response) => {
  const getStatesQuery = `
    SELECT
      *
    FROM
     state;
   `;
  const statesArray = await db.all(getStatesQuery);
  response.send(statesArray.map((each) => convert(each)));
});
app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getStateQuery = `
    SELECT
      *
    FROM
     state
   WHERE
      state_id=${stateId};`;
  const stateArray = await db.get(getStateQuery);
  response.send(convert(stateArray));
});
app.post("/districts/", async (request, response) => {
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const postDistrictQuery = `
    INSERT INTO
     district(district_name,cases,cured,active,deaths)
    VALUES
     ('${districtName}','${stateId}','${cases}','${cured}','${active}','${deaths}')
   `;
  await db.run(postDistrictQuery);
  response.send("District Successfully");
});
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictQuery = `
    SELECT
      *
    FROM
     district
   WHERE
      district_id=${districtId};`;
  const DistrictArray = await db.get(getDistrictQuery);
  response.send(convertDistrict(DistrictArray));
});
app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteDistrictQuery = `
    DELETE FROM
    district
    WHERE
    district_id=${districtId};`;
  await db.run(deleteDistrictQuery);
  response.send("District Removed");
});
app.put("/districts/:districtId/", async (request, response) => {
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const { districtId } = request.params;
  const putDistrictQuery = `
    UPDATE
     district
    SET

     district_name=${districtName},
     state_id='${stateId}',
     cases='${cases}',
     cured='${cured}',
     active='${active}',
     deaths='${deaths}'
    WHERE
    district_id=${districtId};
   `;
  await db.run(putDistrictQuery);
  response.send("District Details Updated");
});
app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const getStatsQuery = `
    SELECT
      SUM(cases),
      SUM(cured),
      SUM(active),
      SUM(deaths)
    FROM
     district
   WHERE
      state_id=${stateId};`;
  const Stats = await db.get(getStatstQuery);
  response.send({
    totalCases: stats["SUM(cases)"],
    totalCured: stats["SUM(cured)"],
    totalActive: stats["SUM(active)"],
    totalDeaths: stats["SUM(deaths)"],
  });
});
app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictIdQuery = `
SELECT
 state_id 
FROM
 district
WHERE
 district_id = ${districtId};
`;
  const getDistrictIdQueryResponse = await database.get(getDistrictIdQuery);

  const getStateNameQuery = `
SELECT
 state_name as stateName 
 FROM
  state
WHERE
 state_id = ${getDistrictIdQueryResponse.state_id};
`;
  const getStateNameQueryResponse = await database.get(getStateNameQuery);
  response.send(getStateNameQueryResponse);
});
module.exports = app;
