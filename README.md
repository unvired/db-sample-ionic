# db-sample-ionic
Ionic sample application integrating with databases

```
$ ionic info
cli packages: (/usr/local/lib/node_modules)

@ionic/cli-utils  : 1.9.2
ionic (Ionic CLI) : 3.9.2

System:

Node : v6.11.2
npm  : 3.10.10 
OS   : macOS Sierra
```

# Clone Unvired DB Sample Project

Clone the GitHub Project by executing the following command in Terminal.

```
 $ git clone https://github.com/unvired/db-sample-ionic.git
```

Install npm node modules 

In the Terminal app, do a cd into the project folder and execute the following command.

```
 $npm install 
```

# To Run the App in iOS

**Install CocoaPods (if not already installed)**
------------------------------------------------

Install CocoaPods by executing the following command in the Terminal.

```
$ sudo gem install cocoapods
```

Note: After you install cocoapods, make sure you set it up by executing the following command in terminal

```
$ pod setup
```

**Install Unvired SDK**
-----------------------

In Terminal, do a cd into ios folder.

```
 $ cd platforms/ios
```

Install Pod by running the following command.

```
$ pod install --repo-update
```

This will set up Unvired DB Sample Project with all the required dependencies.

# Workaround: Error: Cannot read property 'replace' of undefined

```
$ cd platforms/ios/cordova/node_modules/
$ sudo npm install ios-sim@latest
```
More info can be found [Here](https://forum.ionicframework.com/t/error-cannot-read-property-replace-of-undefined/94532/12)

