#!/bin/bash

echo npm version `npm --version`

if [ "$?" -eq "0" ]
then
  npm install
else
  echo "Es necesario nodejs y npm para instalar el proyecto."
fi
