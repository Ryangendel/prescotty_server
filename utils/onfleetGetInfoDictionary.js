const Onfleet = require("@onfleet/node-onfleet")
const onfleetApi = new Onfleet("433273baf931427ef6b294a5d14af7d4");
console.log(onfleetApi.verifyKey())

var onfleetGetInfoDictionary = {
    getAllDriversOnDuty: async function(){
        var data = null
        await onfleetApi.workers.get().then((results) => { 
            data = results
        });
        return data
    },
    getListOfDrivers: async function(){
      onfleetApi.workers.get();
    },
    getIndividualDriverTasks: async function(id){
      onfleetApi.workers.getTasks("sFtvhYK2l26zS0imptJJdC2q")
    },
    getDriversByLocation: async function(){
      onfleetApi.workers.getByLocation({"longitude":-122.41275787353516, "latitude":37.78998061344339, "radius":6000});
    },
    getPriscottyOnfleetInfo:async function(){

        onfleetApi.organization.get();
    },
    getUnassignedTasks: async function(){
        onfleetApi.teams.getTasks('h*wSb*apKlDkUFnuLTtjPke7',
                       {"from":1455072025000, 
                        "lastId": "tPMO~h03sOIqFbnhqaOXgUsd"
                       })
    },
    getContainerOfTasks:async function(){
        onfleetApi.containers.get("2Fwp6wS5wLNjDn36r1LJPscA", "workers");
    },
    insertTasksAtIndexNumber:async function(){
        onfleetApi.workers.insertTask("2Fwp6wS5wLNjDn36r1LJPscA", {"tasks":[3,"l33lg5WLrja3Tft*MO383Gub","tsc4jFSETlXBIvi8XotH28Wt"]});
    },
    getAllCurrentTasks: async function(){
        onfleetApi.tasks.get({"from":1455072025000, "lastId": "tPMO~h03sOIqFbnhqaOXgUsd"});
    },
    getSingleTask:async function(){
        onfleetApi.tasks.get("qNMz6CKwQ*26FOslywsiQxhY");
    },
    getSingleTaskByShortId: async function(){
        onfleetApi.tasks.get("e5f0cc28", "shortId");
    }
}

module.exports = onfleetGetInfoDictionary;