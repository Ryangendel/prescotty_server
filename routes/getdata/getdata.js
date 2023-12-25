const router = require("express").Router();
const { Customer, Order, Product, Pickup } = require('../../models');

router.get('/averageordervalue', async (req, res) => {
    var average

    const pipeline = [
        { $match: { order_total: { $ne: null } } },
        { $group: { _id: null, average_order_total: { $avg: '$order_total' } } }
    ];

    await Order.aggregate(pipeline)
        .then(result => {

            if (result.length > 0) {
                average = result[0].order_total;
                console.log(`The average Order total is: ${average}`);
            } else {
                console.log('No documents matched the query.');
            }
        })
        .catch(err => {
            console.error('An error occurred:', err);
        });

    res.send(`The average order total is ${average} dollars`)
});

router.get('/averageminutesperorder', async (req, res) => {
    var average
    const pipeline = [
        { $match: { minutes_to_complete: { $ne: null } } },
        { $group: { _id: null, average_minutes: { $avg: '$minutes_to_complete' } } }
    ];

    await Order.aggregate(pipeline)
        .then(result => {

            if (result.length > 0) {
                average = result[0].average_minutes;
                console.log(`The average minutes to complete tasks are: ${average}`);
            } else {
                console.log('No documents matched the query.');
            }
        })
        .catch(err => {
            console.error('An error occurred:', err);
        });

    res.send(`The average time per delivery is ${average} minutes`)
});

router.get('/averagedistanceperorder/:months', async (req, res) => {
    fs.createReadStream(`./on_fleet_${req.params.months}.csv`)
        .pipe(csv())
        .on('data', async (data) => {

            if (data.taskType == "dropoff") {

                Order.findOneAndUpdate({ onfleet_task_id: data.shortId }, { $set: { "distance_for_delivery": data.distance } }, { new: true, runValidators: true })
                    .then((dbNote) => {
                        // if (!dbNote) {
                        //     res.json({ message: 'No note found with this id!' });
                        //     return;
                        // }
                        // res.json(dbNote);
                        console.log("worked")
                    })
                    .catch((err) => {
                        res.json(err);
                    });

            }
        })



    res.send(`The average time per delivery is minutes`)
});

router.get('/averagedistanceperorder', async (req, res) => {
    var average
    const pipeline = [
        { $match: { distance_for_delivery: { $ne: null } } },
        { $group: { _id: null, average_distance: { $avg: '$distance_for_delivery' } } }
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

router.get('/getcustomerinfo', async (req, res) => {
    // CSV file output path
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