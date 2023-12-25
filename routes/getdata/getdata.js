const router = require("express").Router();
const { Customer, Order, Product, Pickup } = require('../../models');
const fs = require('fs');
const fastcsv = require('fast-csv');

router.get('/averageordervalue', async (req, res) => {//WORKS
    var average = null
    var totalCount = null
    async function getAverageSubtotal() {
        const result = await Order.aggregate([
          {
            $match: {
              subtotal: { $gt: 0 } // Exclude orders with missing or 0 subtotal
            }
          },
          {
            $group: {
              _id: null,
              averageSubtotal: { $avg: "$subtotal" },
              totalEntries: { $sum: 1 }
            }
          }
        ]);
      
        if (result.length > 0) {
          return {
            averageSubtotal: result[0].averageSubtotal,
            totalEntries: result[0].totalEntries
          };
        } else {
          return { averageSubtotal: 0, totalEntries: 0 };
        }
      }
      
      await getAverageSubtotal()
        .then(data => {
            console.log('Average Subtotal:', data.averageSubtotal, 'Total Entries:', data.totalEntries)
            totalCount = data.totalEntries
            average = data.averageSubtotal
        })
        .catch(err => console.error(err));

    res.send(`The average order total is ${average} dollars taking into account ${totalCount} orders`)
});

router.get('/averageordervalue/:year/:month', async (req, res) => {//WORKS
    var averageValue = null
    async function getAverageOrderTotalForMonth(year, month) {
        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 1);

        const result = await Order.aggregate([
            {
              $match: {
                creation_time: {
                  $gte: startOfMonth,
                  $lt: endOfMonth
                },
                order_total: { $gt: 0 } // Exclude orders with missing or 0 order_total
              }
            },
            {
              $group: {
                _id: null,
                averageOrderTotal: { $avg: "$subtotal" }
              }
            }
          ]);

        return result.length > 0 ? result[0].averageOrderTotal : 0;
    }

    await getAverageOrderTotalForMonth(req.params.year, req.params.month) 
        .then(average => {
            console.log('Average Order Total:', average)
            averageValue = average
        })
        .catch(err => console.error(err));

    res.send(`the average order for ${req.params.month} is ${averageValue}`)
})


router.get('/averageminutesperorder', async (req, res) => { //WORKS
    var average

    async function getAverageTimeDifference() {
        const result = await Order.aggregate([
          {
            $project: {
              timeDifferenceInMinutes: {
                $divide: [{ $subtract: ["$driver_arrival_time", "$creation_time"] }, 60000]
              }
            }
          },
          {
            $group: {
              _id: null,
              averageTimeDifference: { $avg: "$timeDifferenceInMinutes" }
            }
          }
        ]);
      
        return result.length > 0 ? result[0].averageTimeDifference : 0;
      }
      
      // Usage
      await getAverageTimeDifference()
        .then(averageMin => {
            console.log('Average Time Difference in Minutes:', averageMin)
            average = averageMin
        })
        .catch(err => console.error(err));

    res.send(`The average time per delivery is ${average} minutes`)
});

router.get('/averageminutesperorder/:year/:month', async (req, res) => {//WORKS
    var average

     async function getAverageTimeDifferenceForMonth(year, month) {
        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 1);
      
        const result = await Order.aggregate([
          {
            $match: {
              creation_time: {
                $gte: startOfMonth,
                $lt: endOfMonth
              }
            }
          },
          {
            $project: {
              timeDifferenceInMinutes: {
                $divide: [{ $subtract: ["$driver_arrival_time", "$creation_time"] }, 60000]
              }
            }
          },
          {
            $group: {
              _id: null,
              averageTimeDifference: { $avg: "$timeDifferenceInMinutes" }
            }
          }
        ]);
      
        return result.length > 0 ? result[0].averageTimeDifference : 0;
      }
      
      // Usage
     await getAverageTimeDifferenceForMonth(req.params.year, req.params.month) 
        .then(averageMin => {
            console.log('Average Time Difference in Minutes:', averageMin)
            average = averageMin
        })
        .catch(err => console.error(err));
  
    res.send(`The average time per delivery is ${average} minutes for the ${req.params.month} month`)
});


router.get('/averagedistanceperorder/:month', async (req, res) => {
   
    res.send(`The average time per delivery is minutes`)
});

router.get('/averagedistanceperorder', async (req, res) => {//WORKS
    var average
    const pipeline = [
        { $match: { delivery_distance: { $ne: null } } },
        { $group: { _id: null, average_distance: { $avg: '$delivery_distance' } } }
    ];

    await Order.aggregate(pipeline)
        .then(result => {

            if (result.length > 0) {
                average = result[0].average_distance;
                console.log(`The average minutes to complete tasks are: ${average}`);
            } else {
                console.log('No documents matched the query.');
            }
        })
        .catch(err => {
            console.error('An error occurred:', err);
        });

    res.send(`The average distance for each delivery is ${average} miles `)
});

router.get('/getcustomerinfo', async (req, res) => { //GETS ALL CUSTOMERS NAMES AND PHONE NUMBERS
    
    const outputPath = 'customer_info.csv';

    async function exportToCsv() {
        try {
            // Select only 'client_name' and 'client_phone_number' fields
            const docs = await Customer.find({}, { client_name: 1, client_phone_number: 1, _id: 0 }).lean();
            const writeStream = fs.createWriteStream(outputPath);
            const csvStream = fastcsv.format({ headers: true });

            csvStream.pipe(writeStream);
            docs.forEach(doc => csvStream.write(doc));
            csvStream.end();

            writeStream.on('finish', () => {
                console.log(`Successfully exported data to ${outputPath}`);
            });
        } catch (err) {
            console.error('Error during export:', err);
        }
    }

    exportToCsv();
    res.send("done")
})

module.exports = router;