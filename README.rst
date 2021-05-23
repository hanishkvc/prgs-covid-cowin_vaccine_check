##########################################
CoWin Vaccine Availability Status Check
##########################################
Author: HanishKVC
Version: v20210523IST1925

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

This is a minimal keep it simple and stupid (kiss) based logic, to get the required data and
nothing more.

This uses the public api provided by the govt to query the CoWin's servers.

The same vaccination center may appear more than once in the search results, as it could be
providing same or different vaccines to different age groups at the same time.

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

NOTE: The cowin servers rate limit queries into their public apis' so that people dont abuse
it nor overload it. So dont search/run the logic many times with in any 5 minute window, else
the cowin server will potentially disable access to your ip for few minutes, so you wont get
any data. After few minutes the access will be restored and you can get the data again.


Program Versions
##################

Browser based
=================

This uses html and client side javascript to query the cowin servers and show the list of
vaccine centers if any with slot availability.

Multifile version
---------------------

User can enter the name of the state they want to search for, the vaccine they want, along
with the date for which they want to check vaccine slot availability.

NOTE: This is a syncronised serialised version, so it takes some time to show the results
of the search.

From your local machine
~~~~~~~~~~~~~~~~~~~~~~~~~

User needs to download the html file and the related javascript files into a folder locally
on their machine and then User needs to load the index.html page provided by this logic.
Inturn it will list the vac centers where vaccines are available, for the specified state
and date.

Directly from github
~~~~~~~~~~~~~~~~~~~~~~

Access the following url to run the logic directly from the server

https://hanishkvc.github.io/prgs-covid-cowin_vaccine_check/browser/

NOTE: The logic is implemented using client side javascript, so it will run from your
browser. The github site is only used to serve the html and related javascript files.


Single file version
---------------------

There is also a single file (i.e both html and js in a single file) version, which should allow
a user using mobile to download this single file and then run locally from the mobile.

The user can enter the state and the date for which they want to check availability for.

NOTE: This is a asyncronous parallel version, so the search results appear, as they become
available, on the screen. However this has not been updated wrt some of the new logics/flows/etc.


NodeJS based
=================

If one runs the commandline nodejs based version of the program, then one can get the list of
vaccine centers (with vaccine availability) wrt the specified state and specified date.

node index.js --state "State Name" \[--date DD-MM-YYYY\] \[--vaccine vaccineName\]

If date is not specified, then the current date is used.

If vaccine is not specified, get vac centers for all vaccines available on the specified date.


