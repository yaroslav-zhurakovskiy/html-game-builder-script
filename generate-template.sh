#!/bin/sh

EXECUTABLE_NAME=$1

destination_dir=./intergration-test/html-game-build
current_dir=`pwd`
sh compile.sh $EXECUTABLE_NAME
cp ${EXECUTABLE_NAME} $destination_dir
cd $destination_dir
./${EXECUTABLE_NAME} -g
rm ${EXECUTABLE_NAME}
cd $current_dir
rm ${EXECUTABLE_NAME}