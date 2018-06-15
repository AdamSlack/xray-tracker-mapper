FROM node:10.4.1
RUN mkdir /tracker_mapper
ADD . /tracker_mapper
WORKDIR /tracker_mapper
RUN npm i
EXPOSE 8080
CMD ["npm","start"]