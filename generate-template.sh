#!/bin/sh

destination_dir=./intergration-test/html-game-build
current_dir=`pwd`
sh compile.sh
cp build $destination_dir
cd $destination_dir
./build -g
rm build
cd $current_dir
rm build