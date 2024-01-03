const router = require("express").Router();
const { Busyness } = require('../../models');
const fs = require('fs');
//import fs from 'fs/promises'
let mostRecientPickupTask = null
let mostRecientDropoffTask = null

router.get("/busynesscontroller/:level", (req, res) => {
  async function updateActiveStatusBasedOnBusynessLevel(desiredBusynessLevel) {
    try {
      // Set currentlyActive to true for the specified busynessLevel
      await Busyness.updateMany(
        { busyness_level: desiredBusynessLevel },
        { $set: { currently_active: true } }
      );

      // Set currentlyActive to false for other busynessLevels
      await Busyness.updateMany(
        { busyness_level: { $ne: desiredBusynessLevel } },
        { $set: { currently_active: false } }
      );

      console.log("Update complete.");
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }

  // Usage example
  var data = updateActiveStatusBasedOnBusynessLevel(req.params.level);
  res.json(data)
})

router.get("/currentbusynesslevel", async (req, res) => {
  async function findActiveDocument() {
    try {
      const activeDocument = await Busyness.findOne({ currently_active: true });
      if (activeDocument) {

      } else {

      }
      return activeDocument;
    } catch (error) {
      console.error('Error finding active document:', error);
    }
  }

  // Usage
  var active = await findActiveDocument();
  res.json(active)
})


router.get("/getmostrecientorders", async (req, res)=>{
  res.json([{ mostRecientPickupTask }, { mostRecientDropoffTask }])
})


router.get("/mostrecientorder", function(req, res) {

function readFileAsync(filePath) {
  return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf8', (err, data) => {
          if (err) {
              reject(err);
          } else {
              resolve(data);
          }
      });
  });
}

async function readJsonFile(filePath) {
  try {
      const fileContents = await readFileAsync(filePath);
      return JSON.parse(fileContents);
  } catch (err) {
      console.error(`Error reading file: ${err.message}`);
      throw err;
  }
}

// Example usage
(async () => {
  try {
      const dropoffData = await readJsonFile("./routes/webhooks/mostRecientOrder/dropoff.json");
      mostRecientDropoffTask = dropoffData
      const pickupData = await readJsonFile("./routes/webhooks/mostRecientOrder/pickup.json");
      mostRecientPickupTask = pickupData
      console.log("sup")
  } catch (err) {
      console.error(err);
  }
})();

// Example usage
// (async () => {
//   try {
//       const dropoffData = await readJsonFile("./routes/webhooks/mostRecientOrder/dropoff.json");
//       console.log('Dropoff Data:', dropoffData);
//       mostRecientDropoffTask = dropoffData
//       const pickupData = await readJsonFile("./routes/webhooks/mostRecientOrder/pickup.json");
//       console.log('Pickup Data:', pickupData);
//       mostRecientPickupTask= pickupData
//   } catch (err) {
//       // Handle or log error
//       console.error(err);
//   }
// })();

//   var mostRecientDropoffTask = null
//   var mostRecientPickupTask = null

//    async function readJsonFile(filePath) {
//     try {
//         const data = await fs.readFile(filePath, 'utf8');
//         const moreData = await JSON.parse(data);
//         return moreData
//     } catch (err) {
//         console.error(`Error reading file: ${err.message}`);
//         throw err; // Re-throw the error for further handling if necessary
//     }
// }

// // Example usage
// (async () => {
//     try {
//         mostRecientDropoffTask = await readJsonFile("./routes/webhooks/mostRecientOrder/dropoff.json");
//         mostRecientPickupTask = await readJsonFile("./routes/webhooks/mostRecientOrder/pickup.json");
//     } catch (err) {
//         // Handle or log error
//         console.error(err);
//     }
// })();




    // await fs.readFile("./routes/webhooks/mostRecientOrder/dropoff.json", 'utf8', (err, data) => {
    //   if (err) {
    //     console.error(`Error reading file from disk: ${err}`);
    //   } else {
    //     // Parse and log the data
    //     mostRecientDropoffTask = JSON.parse(data);
    //   }
    // });
  

    // await fs.readFile("./routes/webhooks/mostRecientOrder/pickup.json", 'utf8', (err, data) => {
    //   if (err) {
    //     console.error(`Error reading file from disk: ${err}`);
    //   } else {
    //     // Parse and log the data
    //     mostRecientPickupTask = JSON.parse(data);
    //   }
    // });
 res.send("done")
})

module.exports = router;