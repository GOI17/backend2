const { Reading, validate } = require("../models/reading");
const { Station } = require("../models/station");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const validateObjectId = require("../middleware/validateObjectId");
const moment = require("moment");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  const readings = await Reading.find()
    .select("-__v")
    .sort("date");
  res.send(readings);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const station = await Station.findById(req.body.stationId);
  if (!station)
    return res.status(400).send("The station with the given ID was not found.");

  const reading = new Reading({
    station: station,
    values: {
      temperature: req.body.values.temperature,
      dust: req.body.values.dust,
      windQuality: req.body.values.windQuality,
      humidity: req.body.values.humidity
    },
    creationDate: moment().toJSON()
  });

  await reading.save();

  res.send(reading);
});

router.put("/:id", [auth], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const sensor = await Sensor.findByIdAndUpdate(
    req.params.id,
    {
      description: req.body.description,
      model: req.body.model
    },
    { new: true }
  );

  if (!sensor)
    return res.status(404).send("The sensor with the given ID was not found.");

  res.send(sensor);
});

router.delete("/:id", [auth, admin], async (req, res) => {
  const sensor = await Sensor.findByIdAndRemove(req.params.id);

  if (!sensor)
    return res.status(404).send("The sensor with the given ID was not found.");

  res.send(sensor);
});

router.get("/:id", validateObjectId, async (req, res) => {
  const sensor = await Sensor.findById(req.params.id).select("-__v");

  if (!sensor)
    return res.status(404).send("The sensor with the given ID was not found.");

  res.send(sensor);
});

module.exports = router;
