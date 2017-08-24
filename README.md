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

# Workaround: Error: Cannot read property 'replace' of undefined

```
$ cd platforms/ios/cordova/node_modules/
$ sudo npm install ios-sim@latest
```
More info can be found [Here](https://forum.ionicframework.com/t/error-cannot-read-property-replace-of-undefined/94532/12)
