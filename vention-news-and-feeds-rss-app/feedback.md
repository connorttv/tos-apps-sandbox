no endpoints provided for rss feed

cannot deploy app via connecting the github to the telemetry dashboard.
    after connecting the github, the 404 page shows up in dashboard and can't proceed anywhere
    - the solution is to go to the github account settings-> integration/applications->authorized github apps tab-> revoke telemetry

workers don't work on local browser development



#MEDIA:
how to work with media, especially with menu app, because there can me a lot of images. Currently we have 3 options
 - static in repo images
 - input box in /settings, where we put url
 - somehow use media from telemetryOS

is media files from telemetryOS are public and if not, do we need authorization?
how to access telemetryOS media files/folders from local dev app?

#API tokens:
I can't generate an access token in telemetryOS. I see message "API Access is a Premium feature"


#TelemetryOS applications

We are still facing issues with deploying apps. 
telemetryos->application->new application->upload archive
 - if zip whole folder
  ```Build failed: no telemetry.config.json file found```
 - if all files in root	

 ```Starting build
Fetching sources
Starting build
Build failed: Could not complete build```
https://qa-studio.telemetryos.com/content/applications/app/698487411a765e15ff332866

 - run build and archive /dist dir
 ```Build failed: no telemetry.config.json file found```

  - copy over telemetry.config.json to dist, then run build and archive dist dir
 ```Starting build
Fetching sources
Starting build
Build failed: Could not complete build```


### telemetryos->applications->any app.
It would be great to see hash or last commit, or last commited date from git. Otherwise it is impossible to know, is it using latest changes or not.


cannot access telemetry object in browser dev tools.


### news and feeds app
 - not a single image from all the feeds. Maybe I am missing something...