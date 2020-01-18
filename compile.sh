#!/bin/sh

BUILD_FILE="build"
FILE_LIST=(
    header.rb
    AppfileInput.rb
    AppDelegateInput.rb
    ERBCompiler.rb
    InfoPlistInput.rb
    PofileInput.rb
    XcodeProjectGenerator.rb
    XcodeProjecBuilder.rb
    BuildGameUtil.rb
    main.rb
)

# Clean and build

rm $BUILD_FILE

for FILE in "${FILE_LIST[@]}"
do
:
cat "src/${FILE}" >> $BUILD_FILE
echo "\n" >> $BUILD_FILE
done

chmod +x $BUILD_FILE