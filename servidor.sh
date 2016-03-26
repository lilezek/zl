#!/bin/bash

if [ -d "node_modules" ]
then
  echo Servidor montado en "http://localhost:8080"
  node_modules/http-server/bin/http-server -c-1
else
  echo "Primero hay que ejecutar instalar.sh para montar el servidor"
fi
