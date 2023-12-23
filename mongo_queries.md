//db.getCollection("orders").find({})
//
//db.getCollection("orders").aggregate([
//    {
//        $match: {
//            creation_time: {
//                $gte: new Date("2023-12-09T00:00:00.000Z"), // Start of the range, inclusive
//                $lt: new Date("2023-12-16T00:00:00.000Z")  // End of the range, exclusive
//            }
//        }
//    },
//    {
//        $project: {
//            delivery_driver: 1,
//            timeDifferenceInSeconds: {
//                $divide: [
//                    { $subtract: ["$driver_arrival_time", "$creation_time"] },
//                    1000
//                ]
//            }
//        }
//    },
//    {
//        $group: {
//            _id: "$delivery_driver",
//            averageTimeDifference: { $avg: "$timeDifferenceInSeconds" }
//        }
//    }
//]);
//



//db.getCollection("pickups").aggregate([
//    {
//        $lookup: {
//            from: "orders",
//            localField: "onfleet_task_id",
//            foreignField: "dependant_task",
//            as: "orderDetails"
//        }
//    },
//    {
//        $unwind: {
//            path: "$orderDetails",
//            preserveNullAndEmptyArrays: false
//        }
//    },
//    {
//        $project: {
//            pickup_dispensary: 1,
//            timeDifferenceInSeconds: {
//                $divide: [
//                    { $subtract: ["$orderDetails.driver_arrival_time", "$creation_time"] },
//                    1000
//                ]
//            }
//        }
//    },
//    {
//        $group: {
//            _id: "$pickup_dispensary",
//            averageTimeDifference: { $avg: "$timeDifferenceInSeconds" }
//        }
//    }
//]);


db.getCollection("pickups").aggregate([
    {
        $lookup: {
            from: "orders",
            localField: "onfleet_task_id",
            foreignField: "dependnt_task",
            as: "orderDetails"
        }
    },
    {
        $unwind: {
            path: "$orderDetails",
            preserveNullAndEmptyArrays: false
        }
    },
    {
        $project: {
            pickup_dispensary: 1,
            pickup_dispensary_location: 1, // Assuming this field exists in your 'pickups' collection
            timeDifferenceInSeconds: {
                $divide: [
                    { $subtract: ["$orderDetails.driver_arrival_time", "$creation_time"] },
                    1000
                ]
            }
        }
    },
    {
        $group: {
            _id: {
                dispensary: "$pickup_dispensary",
                location: "$pickup_dispensary_location"
            },
            averageTimeDifference: { $avg: "$timeDifferenceInSeconds" }
        }
    }
]);

//------------------------------
db.getCollection("orders").find({})


db.getCollection("orders").aggregate([
    {
        $match: {
            delivery_start_time: {
                $gte: new Date("2023-12-09T00:00:00.000Z"), // Start of the range, inclusive
                $lt: new Date("2023-12-16T00:00:00.000Z")  // End of the range, exclusive
            }
        }
    },
    {
        $group: {
            _id: null,
            averageDistance: { $avg: "$delivery_distance" }
        }
    }
]);

db.getCollection("orders").aggregate([
    {
        $match: {
            creation_time: {
                $gte: new Date("2023-12-09T00:00:00.000Z"), // Start of the range, inclusive
                $lt: new Date("2023-12-16T00:00:00.000Z")  // End of the range, exclusive
            }
        }
    },
    {
        $project: {
            timeDifferenceInSeconds: {
                $divide: [
                    { $subtract: ["$driver_arrival_time", "$creation_time"] },
                    1000
                ]
            }
        }
    },
    {
        $group: {
            _id: null,
            averageTimeDifference: { $avg: "$timeDifferenceInSeconds" }
        }
    }