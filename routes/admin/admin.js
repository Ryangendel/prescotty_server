const router = require("express").Router();
const { Busyness } = require('../../models');

router.get("/busynesscontroller/:level",  (req, res) => {
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
      var data=updateActiveStatusBasedOnBusynessLevel(req.params.level);
    res.json(data)
})

router.get("/currentbusynesslevel",  async (req, res) => {
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

module.exports = router;