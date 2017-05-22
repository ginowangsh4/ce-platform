import './affordances.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Router } from 'meteor/iron:router';
import { ReactiveDict } from 'meteor/reactive-dict';

import { Users } from '../../api/users/users.js';
import { Locations } from '../../api/locations/locations.js';


Template.affordances.onCreated(function() {

    this.autorun(() => {
      this.subscribe('locations');
      
       // TODO: make more specific
    });
    
});

Template.affordances.helpers({
    affordances(){
        console.log(Meteor.userId())
        var location = Locations.findOne({uid: Meteor.userId()})
        console.log('location: ', location);
        return location.affordances
    }
});