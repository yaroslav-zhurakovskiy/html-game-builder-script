#!/bin/sh

BUILD_FILE="build"

rm $BUILD_FILE

cat src/header.rb >> $BUILD_FILE
echo "\n" >> $BUILD_FILE
cat src/AppDelegateInput.rb >> $BUILD_FILE
echo "\n" >> $BUILD_FILE
cat src/ERBCompiler.rb >> $BUILD_FILE
echo "\n" >> $BUILD_FILE
cat src/InfoPlistInput.rb >> $BUILD_FILE
echo "\n" >> $BUILD_FILE
cat src/PofileInput.rb >> $BUILD_FILE
echo "\n" >> $BUILD_FILE
cat src/XcodeProjectGenerator.rb >> $BUILD_FILE
echo "\n" >> $BUILD_FILE
cat src/XcodeProjecBuilder.rb >> $BUILD_FILE
echo "\n" >> $BUILD_FILE
cat src/BuildGameUtil.rb >> $BUILD_FILE
echo "\n" >> $BUILD_FILE
cat src/main.rb >> $BUILD_FILE
echo "\n" >> $BUILD_FILE

chmod +x $BUILD_FILE