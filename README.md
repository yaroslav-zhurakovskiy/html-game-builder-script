
## Requirements
- Ruby 2.4+
- Xcode 11+
- Xcode Command Line Tools (xcode-select --install)
- [Cocoapods](https://cocoapods.org/)
- [XcodeGen](https://github.com/yonaskolb/XcodeGen)
- [Fastlane](https://fastlane.tools/)
- [Git LFS](https://git-lfs.github.com/) (Required for Bytedance)

## Troubleshooting
``` sh
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer/
```

## Read about Fastlane authentication
https://github.com/fastlane/fastlane/tree/master/credentials_manager

## Read about Fastlane codesigning
https://docs.fastlane.tools/codesigning/getting-started/

## Installation
- Download this git project
- Open the terminal and run the following commands
- cd <PROJECT_DIRECTORY>
- make

Now you should be able to run 
``` sh
sandbox-build -h
```
Note: If 'sandbox-build' command cannot be found just reload your terminal.

## Example uage
### Printing help
``` sh
sandbox-build -h
```
### Generating an Xcode Project
``` sh
sandbox-build -g
```

### Generating an ipa file
``` sh
sandbox-build -b
```

### Uploading to testflight
``` sh
sandbox-build -u
```

### Changing the configurarion file name
By default the script will search for Game.yml file. You can alter it by using the following command.
```
sandbox-build -c <FILE_NAME> -g
```

### Configuration file format Game.yml
#### Required fields
```yml
gameSrc: "../html-game" // A path to the source code of html game
bundleId: "com.company-name.my-game" // Apple game id 
version: "1.0.0" // App Store game version
buildNumber: 1 // App Store game build version
appiconsetSrc: "AppIcon.appiconset" // A path to iOS icon file
developmentTeam: "FSX848FP3F" // Apple dev team id
```

#### Optional fields
```yml
name: "My super Game" // Display name of the game
xcodeProjectDir: "out"  // A destination directory where an Xcode project wil be generated. But default it is "out"
templatePath: "../template" // If not specified it will use the one that was installed during "make install" or "make"
sdk: "11.0" // Minimum allowed version is 11.0
launchImageSrc: "LaunchImage.launchimage" // A path to an iOS splash screen image set

supportedInterfaceOrientations: // iPhone & iPad supported device orientation
    - portrait
    - portraitUpsideDown
    - landscapeLeft
    - landspaceRight
supportedInterfaceOrientationsIPad: // iPad only supported device orientation (Overwrites supportedInterfaceOrientations)
    - landscapeLeft
    - landspaceRight

statusBar: "hidden" | "light" | "dark" // Status bar style. You can hide it or change its color.
autoshowBanner: true // Automatically shows banner on launch. You need to have only one active ad banner id, otherwise it will use the first it finds.

// Google Admob plugin fields
GADApplicationIdentifier: "ca-app-pub-5014586027013097~8955954505"
GADInterstitialAdUnitID: "ca-app-pub-3940256099942544/4411468910"
GADBannerAdUnitID: "ca-app-pub-3940256099942544/2435281174"
GADBannerPlacement: "top" | "bottom"
GADRewardedAdUnitID: "ca-app-pub-3940256099942544/1712485313"

// Mintegral plugin fields
MintegralApiKey: "fb1eba8f974622524f29bc12bc8cb6e5"
MintegralAppID: "123727"
MintegralVideoAdUnitID: "193835"
MintegralInterstitialAdUnitID: "193836"
MintegralBannerAdUnitID: "193837"
MintegralBannerSize: "mediumRectangularBanner300x250" | "largeBannerType320x90" | "smartBannerType" | "standardBannerType320x50"
MintegralBannerPlacement: "top" | "bottom"


// Bytedance plugin fields
BytedanceAppID: "5000546"
BytedanceBannerAdUnitID: "900546198"
BytedanceBannerPlacement: "top" | "bottom"
BytedanceBannerSize: "600_90" | "600_100" | "600_150" | "600_260" | "600_286" | "600_300" | "600_388" | "600_400"
BytedanceVideoAdUnitID: "900546831"
BytedanceRewardedVideoAdUnitID: "900546566"

// Fastlane is required for uploading build to TestFlight using CLI
fastlane:
    appleID: "YOUR APPLE ID" // Your apple ID
    teamID: "APPLE DEVELOPER TEAM ID" // Company ID that can be found on https://developer.apple.com
    itcTeamID: "ITUNES CONNECT TEAM ID" // Company ID that can be found on https://itunesconnect.apple.com/
    
OnPlayRequest: "video" // A sandbox request that will be called on "play". It is equivalent to "sandbox://video 
"
// Timer that will be started when the game is started
GameTimer:
   interval: 10 // Interval in seconds
   request: "splash" // A sandbox request that will be called every 10 seconds. It is equivalent to "sandbox://splash 
"

```

## Using make
```sh
make compile
```
```sh
make test
```
```sh
make install
```

## Sandbox Javascript URL API
### List of supported sandbox request
- ```sandbox://video/{ad_id}?onFail=onFailed&onShown=onShown&onClicked=onClicked&onDismissed=onDismissed```
- ```sandbox://banner/{ad_id}?onFail=onFail&onShown=onShown&onClicked=onClicked&onDismissed=onDismissed```
- ```sandbox://splash/{ad_id}?onFail=onFail&onShown=onShown&onClicked=onClicked&onDismissed=onDismissed```
```
{ad_id} is optional
Callbacks are optional
```

