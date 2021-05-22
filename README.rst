##########################################
CoWin Vaccine Availability Status Check
##########################################
Author: HanishKVC
Version: v20210522IST1849

Overview
##########

As the govt (central) has gone for a fastest finger first get vaccination mode for citizens,
and inturn as the specific vaccine needed is not necessarily available in many cases in
vaccination centers even at a district level. So there is a need to get the status of vac
availability across a full state, so that one may find a relatively near by vaccination
center, where the needed specific vaccine is hopefully available, this is especially the case
for those needing 2nd dose and that too for vaccines with lower production capacity.

So this simple program has been created to try and help with the same. It returns the list of
vaccination centers for the specified state, which have vaccines available on the given date,
as of the moment when this logic is run.

This uses the public api provided by the govt to query the CoWin's servers.

NOTE: As the Availability data provided by the CoWin Public API could be upto 30 minutes old,
so there is a possibility that even thou this shows that vaccine/slotForVaccination is available
at a given place, in reality it might have been already booked by someone.

THis can be run by anyone on their own computer, thus not needing to share any of their details
with any 3rd party.

At the same time, I would request the central govt to go for a more structured phase wise, dose
aware vaccination drive, rather than the current musical chair, everyone is needed to participate
in till one gets vaccinated.

Also if the cowin site itself provides a state level view in one shot, then there would be no
need for this program. Unless one is looking at extending it with automatic periodic check
and notification purpose.


Browser based
=================

Multifile version
---------------------

User needs to download the html file and the related javascript files into a folder locally
on their machine and then User needs to load the index.html page provided by this logic.
Inturn it will list the vac centers where vaccines are available, for the specified state/states.

TODO: The state and date needs to be edited in the code for now, this will be changed to user
selectable.


Single file version
---------------------

There is also a single file (i.e both html and js in a single file) version, which should allow
a user using mobile to download this single file and then run locally from the mobile.

The user can enter the state and the date for which they want to check availability for.


NodeJS based
=================

If one runs the commandline nodejs based version of the program, then one can get the list of
vaccine centers (with vaccine availability) wrt the specified state and specified date.

node index.js --state "State Name" \[--date DD-MM-YYYY\] \[--vaccine vaccineName\]

If date is not specified, then the current date is used.

If vaccine is not specified, get vac centers for all vaccines available on the specified date.


