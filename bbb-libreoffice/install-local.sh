#!/bin/bash
if [ "$EUID" -ne 0 ]; then
	echo "Please run this script as root ( or with sudo )" ;
	exit 1;
fi;

cd "$(dirname "$0")"

DOCKER_CHECK=`docker --version &> /dev/null && echo 1 || echo 0`

if [ "$DOCKER_CHECK"  = "0" ]; then
	echo "Docker not found";
	apt update;
	apt install apt-transport-https ca-certificates curl software-properties-common
	curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
	add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"
	apt update
	apt install docker-ce -y
	systemctl enable docker
	systemctl start docker
	systemctl status docker
else
	echo "Docker already installed";
fi

IMAGE_CHECK=`docker image inspect bbb-soffice &> /dev/null && echo 1 || echo 0`
if [ "$IMAGE_CHECK"  = "0" ]; then
	echo "Docker image doesn't exists, building"
	docker build -t bbb-soffice docker/
else
	echo "Docker image already exists";
fi

FOLDER_CHECK=`[ -d /usr/share/bbb-libreoffice-conversion/ ] && echo 1 || echo 0`
if [ "$FOLDER_CHECK" = "0" ]; then
	echo "Install folder doesn't exists, installing"
	install -Dm755 assets/convert-local.sh /usr/share/bbb-libreoffice-conversion/convert.sh
	install -Dm755 assets/convert-cool.sh /usr/share/bbb-libreoffice-conversion/convert-cool.sh
	install -Dm755 assets/etherpad-export.sh /usr/share/bbb-libreoffice-conversion/etherpad-export.sh
	chown -R root /usr/share/bbb-libreoffice-conversion/
else
	echo "Install folder already exists"
fi;

FILE_SUDOERS_CHECK=`[ -f /etc/sudoers.d/zzz-bbb-docker-libreoffice ] && echo 1 || echo 0`
if [ "$FILE_SUDOERS_CHECK" = "0" ]; then
	echo "Sudoers file doesn't exists, installing"
	cp assets/zzz-bbb-docker-libreoffice /etc/sudoers.d/zzz-bbb-docker-libreoffice
	chmod 0440 /etc/sudoers.d/zzz-bbb-docker-libreoffice
	chown root:root /etc/sudoers.d/zzz-bbb-docker-libreoffice
else
	echo "Sudoers file already exists"
fi;

aptInstalledList=$(apt list --installed 2>&1)
fontInstalled=0

for font in fonts-arkpandora fonts-crosextra-carlito fonts-crosextra-caladea fonts-noto fonts-noto-cjk fonts-liberation fonts-arkpandora
do
	if [[ $(echo $aptInstalledList | grep $font | wc -l) = "0" ]]; then
		echo "Font $font doesn't exists, installing"
		apt-get install -y --no-install-recommends $font
		fontInstalled=1
	else
		echo "Font $font already installed"
	fi
done

if [ $fontInstalled = "1" ]; then
	dpkg-reconfigure fontconfig && fc-cache -f -s -v
fi
