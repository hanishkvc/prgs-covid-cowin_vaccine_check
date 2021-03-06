##########################################
CoWin Vaccine Availability Status Check
##########################################
Author: HanishKVC
Version: v20210602IST1908

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
vaccination centers for the specified state, which have vaccines available on the given date
or the given week, as the case maybe, as of the moment when this logic is run. The query could
be either manually triggered each time as required, or a auto repeating search can be enabled
(wrt browser mode). The results are shown on the screen (web page or terminal as the case maybe)
as well as optionally local notification (wrt browser mode) may be triggered.

This is a minimal keep it simple and stupid (kiss) based logic, to get the required data and
look at it in a efficient way by caching it temporarily for a short period, so as to avoid
overloading of the server. Also it tries not to be unfair by querying only once every 10 mins.

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
slot. This program mainly helps with getting availability status wrt a full state in one shot
and or to query at periodic intervals.

The cowin servers rate limit queries into their public apis' so that people dont abuse it nor
overload it. So dont search/run the logic many times with in any 5 minute window, else the cowin
server will potentially disable access to your ip for few minutes, so you wont get any data.
After few minutes the access will be restored and you can get the data again.

To help mitigate this to some extent, and also to be bit efficient and less loading on the server,
the logic caches most of the data fetched from the server (be it wrt states/districts/vaccenters)
for upto 5 mins by default. So if a user tries to requery the same, it wont try to fetch the data
from the server. However if user tries to query wrt a new state/district/date, then it will fetch
fresh data, provided previously data had not been fetched for the same within the past 5 minutes.

NOTE: The local temporary caching is mainly useful for the modular browser based version of this
logic. The NodeJS based version currently cant make use of this caching capability, as it exits
after each search run.

Chances are the periodic auto repeating search supported by the modular browser based version of
the program will trigger the search only when the user is actively using the system and inturn
potentially the browser. Else the browser may decide to pause/stop such background logics on its
own to avoid overloading the local system or to conserve power or ... so, especially on mobile
or other such power constrained systems.

   Firefox mobile has a issue/bug with setInterval (i.e periodic call backs), so auto repeating
   search wont work with it. Also even on Chrome mobile/android, these callbacks are not called
   as specified in setInterval, instead one call will be made, as and when the browser is visible
   /active again.

NotifyMe option in the Browser based version of this logic is experimental and currently works
mostly on desktop or equivalent environments(chromebook) and not on mobile/similar environments.
This allows notification to be generated locally for the user, which they can see from their
GUI systems notifications panel.

   Notification api seems to work with Chrome/Firefox on Desktop/Chromebook (checked to some
   extent) and potentially logically hopefully on windows/mac also (need to check).

   However mobile versions of Chrome ie on Android doesnt seem to support the same and some
   discussions/docs on the web, seem to indicate that one needs to use service workers wrt
   android chrome. Even thou I can understand the reason given for needing service worker,
   (rather it has its use with interactive notifications) at the same time I dont see any
   reason as to why system/browser cant adopt orphan notifications with limited interactivity
   support needs on the mobile environments.

      And by allowing setInterval based callbacks to be categorised into different classes,
      they could even allow simple kinds of low overhead and low complexity background
      logics even on mobile/power constrained devices; especially where other aspects of
      service workers are not needed.

   Thus with a relatively simple and logically sane fix at the system-notification level,
   google can ensure a relatively uniform behaviour across desktop and mobile from the same
   simple js code. Why oh why google u arent taking such a path??? Same is also applicable
   to firefox.

The query vaccine centers wrt a specific state-district in the DISTRICT_1WEEK mode, doesnt
use the cached data, if week being checked for doesnt fully overlap the week corresponding
to the cached data.

The initial parallel asyncronous logic has been changed to a serialised syncronous query
chain logic. So it doesnt parallelise the co-operative multitasking logic of javascript,
wrt io blocking operations and so inturn it will take slightly more time than ideal.


Program Versions
##################

Browser based
=================

This uses html and client side javascript to query the cowin servers and show the list of
vaccine centers if any with slot availability.

Modular Multifile version
--------------------------

User can get the vaccine slots availability status as it stands at the time of querying wrt
FullState1Day view or for a SpecificDistrict1Week view.

User needs to select the name of the state they want to search for, the district they are
interested in (if they are looking for the District1Week view, else leave district as ANY),
vaccine they want, along with date for which they want to check vaccine slot availability.

The user can either enter the state name on their own and or chose from one of the names in
the predefined set. Same thing also applies to the District. However if one is interested in
the FullState1Day view, then they need to leave the District set to ANY (the default). Wrt
date either they can directly enter or use the calender that will come up. While wrt vaccine,
they have to select one from the predefined set.

There is also a periodic auto repeating search option, which will trigger the querying of
the cowin server periodically without user requiring to explicitly press the search button
each time. This is currently setup to do the periodic search once every 10 minutes. However
do note that this logic just updates the result shown on screen, and possibly notifies the
user using local desktop notification(experimental). User needs to monitor the same manualy
(page and notification) and act on it as they see fit. Also this auto repeat logic may get
paused by the browser, as noted previously.

   There is a NotifyMe button to toggle the experimental local notification logic. User
   will also have to explicitly grant permission for showing local notification, when
   the same is requested for by the logic, after user clicks start-notifyme. This may
   not work in some of the setups - especially wrt mobiles/...

   There is a periodically (once per minute) updating countdown which is shown in the
   auto button to indicate as to when the next auto repeating search will be triggered.

NOTE: If user selects/sets the district to be anything other than ANY, then the logic will
switch to District1Week mode and inturn the date will be reset to today. The user can change
the date to something different, if they want to after selecting the district.

One can attach age parameter has a query string to the URL, to filter the results to show
only those matching the specified age group (i.e 18 or 45).


From your local machine
~~~~~~~~~~~~~~~~~~~~~~~~~

User needs to download the html file and the related javascript files into a folder locally
on their machine and then User needs to load the index.html page provided by this logic.

NOTE: Local notifications dont seem to work in this context, as browsers seem to ignore
local file urls wrt thier notification management logic.


Directly from github
~~~~~~~~~~~~~~~~~~~~~~

Access the following url to run the logic directly from the server

https://hanishkvc.github.io/prgs-covid-cowin_vaccine_check/browser/

If only interested in results corresponding to 18-44 age group, then you can use this link

https://hanishkvc.github.io/prgs-covid-cowin_vaccine_check/browser/?age=18

If only interested in results corresponding to 45+ age group, then you can use this link

https://hanishkvc.github.io/prgs-covid-cowin_vaccine_check/browser/?age=45

NOTE: The logic is implemented using client side javascript, so it will run from your
browser. The github site is only used to serve the html and related javascript files.


Single file version (old - Dont use)
-------------------------------------

There is also a single file (i.e both html and js in a single file) version, which should allow
a user using mobile to download this single file and then run locally from the mobile.

The user can enter the state and the date for which they want to check availability for.

NOTE: This is a asyncronous parallel version, so the search results appear, as they become
available, on the screen. However this has not been updated wrt any of the new logics/flows/
features/etc.


NodeJS based
=================

If one runs the commandline nodejs based version of the program, then one can get the list of
vaccine centers (with vaccine availability) wrt specified state/district and specified date/week.

node index.js --state "State Name" [optional arguments]

The optional arguments are

   --stype <STATE_1DAY|DISTRICT_1WEEK>

      STATE_1DAY: fetch all VCs in the specified state for the give date, across all districts OR

         This is the default.

      DISTRICT_1WEEK: fetch VC slot availability for upto 1 week for the specified district.

   --date DD-MM-YYYY

      If date is not specified, then the current date is used.

   --vaccine vaccineName

      If vaccine is not specified, get vac centers for all vaccines available on the specified date.

   --district "District Name"

      Filter the VCs that are shown wrt STATE_1DAY Mode to those belonging to specified district.

      Fetch details about VC slots for the specified district only in DISTRICT_1WEEK mode.

NOTE: For now the SType is used to switch between forDate and forWeek related queries,
but STATE_1DAY doesnt ignore districts filtering, when fetching in dbget_vcs, so it fetches
data only for the specified districts, if any, instead of for all districts wrt STATE_1DAY
mode.


ChangeLog
############

This captures only some of the changes/updates. Started this program to help out those stuck
with non availability of vaccine doses, past their 2nd dose time (includign myself), who also
didnt want to share their details to 3rd parties on the net for alert service or so and also
at same time wouldnt have wanted to overload the servers. Have also tried to add some features
to easy the use in general, as I found further free time in between.

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

   Rather it mainly works on desktops/laptops and not on mobiles/tablets.

Bit more informative Done Status message.

Avoid UserAgent wrt Fetch request headers, else Firefox's fetch fails.
However nodejs node-fetch wont work without UserAgent. Need to add a
generic workaround which can handle both cases from same code.


v20210601IST0329
===================

Handle USerAgent as reqd wrt nodejs environment and browser environment.

Decouple fetching of data from using of same.

Add core logic related to fetching data about VC slots for upto a week,
for a specified district using the corresponding cowin public api.
Inturn the same is exposed to user through cmdline wrt NodeJS version.

Control SType, District, minCapacity from cmdline wrt NJS version of
the logic.

Tabular console logging wrt search result wrt NJS version of logic.


v20210601IST2050
==================

Local multi level caching allowing caching of states/districts/vcs
wrt 4date and 4week fetchs.


v20210602IST1827
=================

Allow State-SpecificDistrict 1 Week slot availability view fetch from the
browser based version of the logic.

Allow multiple District1Week search results to be stored in db for the same
district, provided they correspond to different 1Week views due to having
different start dates.

Add missing fields to what is shown to user wrt both Browser and NodeJS based
versions of the logic.


v20210603IST2114
==================

Filter vaccine centers based on age url query/search parameter.

Cache time controllable, States/Districts list cached for a hour, while VCs
cached for 5 mins.

Nano UI cleanup; Auto set to today.

Bit more info in the desktop notification.


v20210604IST1131
==================

Countdown shown wrt Auto Repeating search.

