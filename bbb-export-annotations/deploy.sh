#!/usr/bin/env bash
cd "$(dirname "$0")"

for var in "$@"
do
    if [[ $var == --reset ]] ; then
    	echo "Performing a full reset..."
      rm -rf node_modules
    fi
done

if [ ! -d ./node_modules ] ; then
	npm install --production
fi

sudo cp -r ./* /usr/local/bigbluebutton/bbb-export-annotations
sudo systemctl restart bbb-export-annotations
echo ''
echo ''
echo '----------------'
echo 'bbb-export-annotations updated'
