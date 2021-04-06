#!/usr/bin/env bash

set -ex

SRC_DIR=$1 #  root folder of the workspace, /opt/git/workspace
BUILD_DIR=$2 # /mnt/deb-builds/${PACKAGE_NAME}-${VERSION}
PACKAGE_NAME=$3 # appName
VERSION=$4 # autogenerated timestamp
echo "Using package $PACKAGE_NAME and version ${VERSION}"

cd $SRC_DIR

# Grab a newer node.js
wget https://nodejs.org/dist/v10.13.0/node-v10.13.0-linux-x64.tar.xz
xz -dc node-v10.13.0-linux-x64.tar.xz | tar xf - -C /usr/local/

export PATH=/usr/local/node-v10.13.0-linux-x64/bin:$PATH

# Get Yarn and use it for NPM dependencies
# npm install --global yarn

# Install global build packages
yarn i --global webpack webpack-dev-server karma karma-cli protractor typescript rimraf phantomjs-prebuilt

# Install dependencies
npm install

# Build the project! (uses Webpack)
npm run build:prod

# Collect our built files
rsync -a ${SRC_DIR}/dist/* ${BUILD_DIR}/

# Package our built app
tar -cvzf package.tgz ${SRC_DIR}/dist/
