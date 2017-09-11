# db-sample-ionic
Ionic sample application integrating with databases

```
$ ionic info
Your system information:

Cordova CLI: 6.5.0 
Ionic CLI Version: 2.2.2
Ionic App Lib Version: 2.2.1
ios-deploy version: 1.9.1 
ios-sim version: 6.0.0 
OS: macOS Sierra
Node Version: v7.9.0
Xcode version: Xcode 8.3.3 Build version 8E3004b
```

Clone Unvired DB Sample Project

Clone the GitHub Project by executing the following command in Terminal.

> $ git clone https://github.com/unvired/db-sample-ionic.git

Install npm node modules 

In the Terminal app, do a cd into the project folder and execute the following command.

> npm install 

# To Run the App in iOS

**Install CocoaPods (if not already installed)**
------------------------------------------------

Install CocoaPods by executing the following command in the Terminal.

> $ sudo gem install cocoapods

Note: After you install cocoapods, make sure you set it up by executing the following command in terminal

> $ pod setup

> $ cd platforms/ios

> $ pod install --repo-update

This will set up Unvired DB Sample Project with all the required dependencies.

# Workaround: Error: Cannot read property 'replace' of undefined

```
$ cd platforms/ios/cordova/node_modules/
$ sudo npm install ios-sim@latest
```
More info can be found [Here](https://forum.ionicframework.com/t/error-cannot-read-property-replace-of-undefined/94532/12)

