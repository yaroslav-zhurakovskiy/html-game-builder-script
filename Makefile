EXECUTABLE_NAME=sandbox-build
INSTALLATION_PATH=/usr/local/bin/${EXECUTABLE_NAME}

.DEFAULT_GOAL := install

build:
	./compile.sh ${EXECUTABLE_NAME}

test:
	./test.sh

clean:
	rm ${EXECUTABLE_NAME} 

install:
	./compile.sh ${EXECUTABLE_NAME}
	cp ${EXECUTABLE_NAME} ${INSTALLATION_PATH}
	rm ${EXECUTABLE_NAME}
	
generate-template:
	./generate-template.sh