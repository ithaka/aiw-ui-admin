#!/usr/bin/env bash

set -ex

SRC_DIR=$1 #  root folder of the workspace, /opt/git/workspace
BUILD_DIR=$2 # /mnt/deb-builds/${PACKAGE_NAME}-${VERSION}
PACKAGE_NAME=$3 # appName
VERSION=$4 # autogenerated timestamp
echo "Using package $PACKAGE_NAME and version ${VERSION}"

cd $SRC_DIR

mkdir -p ${SRC_DIR}/dist/test

# Grab a newer node.js
wget https://nodejs.org/dist/v14.21.1/node-v14.21.1-linux-x64.tar.xz
xz -dc node-v14.21.1-linux-x64.tar.xz | tar xf - -C /usr/local/

export PATH=/usr/local/node-v14.21.1-linux-x64/bin:$PATH

# Get Yarn and use it for NPM dependencies
npm install --global yarn

# Install global build packages
yarn global add webpack webpack-dev-server karma karma-cli protractor typescript rimraf phantomjs-prebuilt

yarn add angular2-csv@0.2.5

# Install dependencies
yarn install

# Build the project! (uses Webpack)
yarn run build:test

echo "TEST build script complete"
