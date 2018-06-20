#!/bin/bash
INPUT="$1"
OLDIFS=$IFS
IFS=,
[ ! -f $INPUT ] && { echo "$INPUT file not found"; exit 99; }
while read hosts refCount propOfApps companies
do
    echo -e "\n\nHost Name: $hosts\n"
    echo -e "\n\n$hosts" >> ./results.txt
    curl "localhost:8080/host/$hosts" >> ./results.txt
    
    sleep 1s
done < $INPUT
IFS=$OLDIFS
