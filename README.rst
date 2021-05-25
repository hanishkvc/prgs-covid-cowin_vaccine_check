##########################################
CoWin Vaccine Availability Status Check
##########################################
Author: HanishKVC
Version: v20210526IST0122

Overview
##########

General
==========

As the govt (central) has gone for a fastest finger first get vaccination mode for citizens,
and inturn as the specific vaccine needed is not necessarily available in many cases in
vaccination centers even at a district level. So there is a need to get the status of vac
availability across a full state, so that one may find a relatively near by vaccination
center, where the needed specific vaccine is hopefully available, this is especially the case
for those needing 2nd dose and that too for vaccines with lower production capacity.

So this simple program has been created to try and help with the same. It returns the list of
vaccination centers for the specified state, which have vaccines available on the given date,
as of the moment when this logic is run. The query could be either manually triggered each
time as required, or a auto repeating search can be enabled (wrt browser mode). The results
are shown on the screen (web page or terminal as the case maybe) as well as optionally local
notification (wrt browser mode) may be triggered.

This is a minimal keep it simple and stupid (kiss) based logic, to get the required data and
look at it in a efficient way by caching it temporarily for a short period, so as to avoid
overloading of the server.

This uses the public api provided by the govt to query the CoWin's servers.

The same vaccination center may appear more than once in the search results, as it could be
providing same or different vaccines to different age groups at the same time.

THis can be run by anyone on their own computer, thus not needing to share any of their details
with any 3rd party.

At the same time, I would request the central govt to go for a more structured phase wise, dose
aware vaccination drive, rather than the current musical chair, that the unconnected commoners
are needed to participate in currently, till one gets vaccinated.


Things to Note
================

As the availability data provided by the CoWin Public API could be upto 30 minutes (or as decided
by cowin/govt team) old, so there is a possibility that even thou this shows that vaccination slot
is available at a given place, in reality it might have been already booked by someone.

One requires to go to the cowin site to cross verify the latest status as well as to book the
slot. This program mainly helps with getting availability status wrt a full state in one shot.

The cowin servers rate limit queries into their public apis' so that people dont abuse it nor
overload it. So dont search/run the logic many times with in any 5 minute window, else the cowin
server will potentially disable access to your ip for few minutes, so you wont get any data.
After few minutes the access will be restored and you can get the data again.

To help mitigate this to some extent, and also to be bit efficient and less loading on the server,
the logic caches data wrt any given state for upto 5 mins by default. So if a user tries to requery
wrt the same state, it wont try to fetch the data from the server. However if user tries to query
wrt a new state, then it will fetch fresh data, provided previously data had not been fetched for
that state within the past 5 minutes.

NOTE: The local temporary caching is mainly useful for the modular browser based version of this
logic. The NodeJS based version currently cant make use of this caching capability, as it exits
after each search run.

Chances are the periodic auto repeating search supported by the modular browser based version of
the program will trigger the search only when the user is actively using the system and inturn
potentially the browser. Else the browser may decide to pause/stop such background logics on its
own to avoid overloading the local system or to conserve power or ... so.

   Firefox mobile has a issue/bug with setInterval (i.e periodic call backs), so auto repeating
   search wont work with it. Also even on Chrome mobile/android, these callbacks are not called
   when required, instead one call will be made, as and when the browser is visible/active again.

NotifyMe option in the Browser based version of this logic is experimental and doesnt work in
many of the setups.

   Seems to work with Chrome and Firefox on Chromebook (checked) and potentially logically
   hopefully on desktops (need to check). However mobile versions of Chrome ie on Android
   doesnt seem to support the same and some discussions on the web, seem to indicate
   that one needs to use service workers wrt android chrome. Even thou I can understand
   the reason given for needing service worker, at the same time I dont see any reason as
   to why the system/browser cant adopt orphan notifications with limited interactivity
   support wrt such orphaned notifications on the mobile environments. Thus with a relatively
   simple and logically sane fix at the system-notification level, google can ensure a relatively
   uniform behaviour across desktop and mobile from the same simple js code. Why oh why google
   u arent taking such a path???


Program Versions
##################

Browser based
=================

This uses html and client side javascript to query the cowin servers and show the list of
vaccine centers if any with slot availability.

Modular Multifile version
--------------------------

User can enter the name of the state they want to search for, the vaccine they want, along
with the date for which they want to check vaccine slot availability.

The user can either enter the state name on their own and or chose from one of the names in
the predefined set. Wrt date again either they can directly enter or use the calender that
will come up. While wrt vaccine, they have to select one from the predefined set.

NOTE: This is a syncronised serialised version, so it takes some time to show the results
of the search.

There is also a periodic auto repeating search option, which will trigger the querying of
the cowin server periodically without user requiring to explicitly press the search button
each time. This is currently setup to do the periodic search once every 10 minutes. However
do note that this logic just updates the result shown on screen, and possibly notifies the
user using mobile/desktop notification(experimental), the user needs to monitor the same
(page and notification) and act on it as they see fit. Also this auto repeat logic may get
paused by the browser, as noted previously.

   There is a NotifyMe button to toggle the experimental local notification logic. User
   will also have to explicitly grant permission for showing local notification, when
   the same is requested for by the logic, after user clicks start-notifyme. This may
   not work in many of the setups.


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


Single file version (old)
--------------------------

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


ChangeLog
############

This contains only some of the changes/updates

vInitialExtRelease
====================

Browser and NodeJS based versions of the logic, which allow a user to select the state, date and
vaccine and inturn check if there are slots available in any vac centers.

The logic caches the last set of vaccenters wrt any given state, so that filtering wrt vaccine
or any other parameter in future, and or switching between states doesnt need refetching the
same data from server.


v20210524IST1724
=================

Allow caching of vac centers details wrt multiple dates for any state, in the db.
So user could either look at different dates for a given state, or look across multiple states
and or any combination of these and the logic will make use of its temp cache logic to handle
this use case with minimal server loading.


v20210524IST2303
=================

Allow user to trigger a auto periodic repeating search. However if there are any changes to the
search result, user will have to monitor it manually and act on it. The logic wont alert the
user or so.


v20210525IST1817
=================

Maybe slightly cleaner Browser UI.

AutoRepeatingSearch triggers immidiate search and also uses latest search paramaters,
when ever its triggered by user/system.

Error if any, is shown to user at the bottom.


v20210526IST0210
=================

Experimental NotifyMe logic, which works only in some setups.

Bit more informative Done Status message.

Avoid UserAgent wrt Fetch request headers, else Firefox's fetch fails.
However nodejs node-fetch wont work without UserAgent. Need to add a
generic workaround which can handle both cases from same code.


