#!/bin/sh

BUILD_FILE=$1
FILE_LIST=(
    AppfileInput.rb
    PluginFileInput.rb
    AppDelegateInput.rb
    GameTimerInput.rb
    ERBCompiler.rb
    InfoPlistInput.rb
    PofileInput.rb
    XCConfigInput.rb
    XcodeProjectGenerator.rb
    XcodeProjecBuilder.rb
    ScriptInputParser.rb
    ScriptInputProvider.rb
    BuildParamsLoader.rb
    ConfigurationParamsProcessor.rb
    Script.rb
    main.rb
)

insert_file_content()
{
    FILE=$1
    BUILD_FILE=$2
    cat $FILE >> $BUILD_FILE
    echo "\n" >> $BUILD_FILE
}

# Clean and build

if [[ -f "$BUILD_FILE" ]]; then
    rm $BUILD_FILE
fi

insert_file_content "src/header.rb" $BUILD_FILE

echo "SCRIPT_NAME = '${BUILD_FILE}'\n" >> $BUILD_FILE

for FILE in "${FILE_LIST[@]}" 
do
:
insert_file_content "src/${FILE}" $BUILD_FILE
done

chmod +x $BUILD_FILE