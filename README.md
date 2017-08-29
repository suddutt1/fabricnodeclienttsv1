# Fabric Nodejs Client with TypeScript v1
Hyperledger fabric nodejs client with typescript V1 

This is a convenience wrapper implementation of HFC client with typescript
To start with 

```sh
npm install -g typescript

npm install typescript --save-dev
npm install @types/node --save-dev
npm install fabric-ca-client --save
npm install fabric-client --save
npm install log4js --save

npm install
 
```

To complie

```sh

tsc

```
Output will be genrates to build folder
Artifcats must be generated and placed under dist/artifcats folder

Configuration file network=config.json

To run ( mychannel1 is the channel name and xcc is chain code ) 

```sh

node ./dist/index.js org1 create mychannel1 ../artifacts/channel/mychannel1.tx
node ./dist/index.js org2 join mychannel1
node ./dist/index.js org1 join mychannel1
node ./dist/index.js org1 install  xcc github.com/uniqueKeyValue 1.0
node ./dist/index.js org2 install  xcc github.com/uniqueKeyValue 1.0
node ./dist/index.js org2 initcc  mychannel1 xcc  1.0 init
node ./dist/index.js org2 invoke  mychannel1 xcc put X 1000
node ./dist/index.js org2 query  mychannel1 xcc get X


```


