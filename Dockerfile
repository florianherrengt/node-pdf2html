FROM node:7.0

ENV REFRESHED_AT 20151007

RUN echo "deb http://ftp.de.debian.org/debian sid main" >> /etc/apt/sources.list && \
    apt-get -qqy update && \
    apt-get -qqy install pdf2htmlex && \
    rm -rf /var/lib/apt/lists/*

RUN mkdir /tmp/upload
RUN mkdir /tmp/converting
RUN mkdir /tmp/converted

VOLUME /code

WORKDIR /code
