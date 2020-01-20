## Example uage
### Geneation an Xcode Project
``` sh
sandbox-build -g
```

### Geneation an ipa file
``` sh
sandbox-build -b
```

### Uploading to testflight
``` sh
sandbox-build -u
```

### Changing configurarion file name
By default the script will search for Game.yml file. You can alter by using the folowwing command.
```
sandbox-build -c <FILE_NAME> -g
```

### Configuration file format Game.yml
```yml
xcodeProjectDir: "out"
templatePath: "../template"
gameSrc: "../html-game"
name: "My super Game"
bundleId: "com.company-name.my-game"
sdk: "8.0"
version: "1.0.0"
buildNumber: 10
appiconsetSrc: "AppIcon.appiconset"
developmentTeam: "FSX848FP3F"
GADApplicationIdentifier: "ca-app-pub-5014586027013097~8955954505"
MintegralApiKey: "fb1eba8f974622524f29bc12bc8cb6e5"
MintegralAppID: "123727"
BytedanceAppID: "5047875"
fastlane:
    appleID: "yaroslav.zhurakovskiy@gmail.com"
    teamID: "FSX848FP3F"
    itcTeamID: "98037968"
```

### Required fields
``` yml
templatePath: <VALUE>
gameSrc: <VALUE>
bundleId: <VALUE>
version: <VALUE>
buildNumber: <VALUE>
appiconsetSrc: <VALUE>
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