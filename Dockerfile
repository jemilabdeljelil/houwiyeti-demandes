FROM node:alpine
# Create app directory
WORKDIR /elmamy/src/demandes
# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --omit=dev
# Bundle app source
COPY . .

RUN npm run build

EXPOSE 3002
CMD [ "node", "dist/main" ]