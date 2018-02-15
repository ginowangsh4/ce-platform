import {Meteor} from 'meteor/meteor';
import {_} from 'meteor/underscore';
import {resetDatabase} from 'meteor/xolvio:cleaner';
import {Accounts} from "meteor/accounts-base";
import {Experiences} from "../experiences/experiences";
import {Users} from "../users/users";

import {Incidents} from "../incidents/incidents";
import {LOCATIONS} from "./testinglocations";
import {onLocationUpdate} from "../locations/methods";
import {createIncidentFromExperience, startRunningIncident} from "../incidents/methods";
import {findUserByEmail} from "../users/methods";
import {Assignments} from "../coordinator/assignments";
import {Random} from 'meteor/random'
import {Submissions} from "../submissions/submissions";

describe('Simple End To End', function () {

  const EID = Random.id();

  beforeEach(function () {

    resetDatabase();
    Accounts.createUser({email: 'a@gmail.com', password: 'password', profile: {lastParticipated: null}});

    let experienceOne = {
      _id: EID,
      name: "You're at a restaurant",
      participateTemplate: [{templateName: "atLocation", submissionData: {proof: "photo"}}],
      resultsTemplate: "photoCollage",
      contributionTypes: [{
        templateName: "atLocation", needs: [
          {
            needName: "atRestaurant", situation: {detector: "restaurant", number: "1"},
            toPass: {item: "restaurant"}, numberNeeded: 10
          }]
      }],
      description: "This is a simple experience for testing",
      notificationText: "Please participate in this test experience!",
    }

    Experiences.insert(experienceOne);
    let incident = createIncidentFromExperience(experienceOne);
    startRunningIncident(incident);

    let count = Submissions.find({
      iid: incident._id
    }).count()

  });

  it('user gets added to experience', function () {

    let uid = findUserByEmail("a@gmail.com")._id;
    onLocationUpdate(uid, LOCATIONS.burgers.lat, LOCATIONS.burgers.lng);

    let incident = Incidents.findOne({eid: EID});
    let iid = incident._id;
    let user = findUserByEmail("a@gmail.com");
    //user has incident as an active incident
    let addedToUser = (user.profile.activeIncidents.indexOf(iid) !== -1);
    chai.assert(addedToUser, "active incident not added to user profile");

    //assignments has user assigned
    let assignmentEntry = Assignments.findOne({_id: iid});

    let needUserMap = assignmentEntry.needUserMaps.find(function(x) {
      return x.needName === "atRestaurant";
    })
    console.log("needUserMap", needUserMap)
    chai.assert.typeOf(needUserMap.uids, 'array', "no needUserMap in Assignment DB")
    chai.assert(needUserMap.uids.indexOf(uid) !== -1, "uid not in needUserMap in Assignment DB");

  })

});