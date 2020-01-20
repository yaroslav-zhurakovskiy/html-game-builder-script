#!/bin/sh

EXECUTABLE_NAME="build"

cleanup()
{
    destination_dir=$1

    rm build
    cd $current_dir
    rm build
    rm -fr "${destination_dir}/out"
}

run_integration_test()
{
    echo "\n\n======== Running integration with param '${1}' ========\n\n"
    destination_dir=./intergration-test/html-game-build
    current_dir=`pwd`
    sh compile.sh ${EXECUTABLE_NAME}
    cp build $destination_dir
    cd $destination_dir
    ./build $1
    build_result=$?
    cleanup $destination_dir
    if [[ $build_result -ne 0 ]] ; then
        echo "Test failed!"
        exit -1
    fi
}


OPTION_LIST=("-h" "-g" "-b")

for OPTION in "${OPTION_LIST[@]}" 
do
:
run_integration_test $OPTION
done