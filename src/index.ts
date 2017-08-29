'use strict';
import * as fs from 'fs';
import * as path from 'path';
import * as log4js from 'log4js';
import { CAClient } from './hlfclient/CAClient'
import { HFCClient } from './hlfclient/HFClient'

class NetworkDriver {
    private logger = log4js.getLogger('NetworkDriver');
    constructor() {

    }


    /**
     * CAClient enrollment and registration flow
     */
    public async caEnrollmentFlow(): Promise<number> {
        this.logger.info("Running now....caEnrollmentFlow")
        if (process.argv.length >= 4) {


            var caClient = new CAClient("https://localhost:7054", "admin", "adminpw", "Org1MSP", "org1");
            var rslt: boolean = await caClient.init();
            this.logger.info("CA Client Intialization result :" + rslt);
            if (rslt) {
                //Register a user 
                var userId = process.argv[2]
                var secret = process.argv[3]
                var appUser = await caClient.loginUser(userId, secret);
                if (appUser === null) {
                    this.logger.info(`Unable to enroll user ${userId}`)
                } else {
                    this.logger.info(`User ${userId} enrollment successfull `)
                }
            }

        } else {
            this.logger.error("Invalid input params : Specify user id and secret")
        }
        return new Promise<number>(resolve => {
            resolve(0);
        });

    }
    public async fabricClientFlow(): Promise<number> {
        this.logger.info("Running now....fabricClientFlow")
        if (process.argv.length >= 4) {
            let org = process.argv[2]
            let command = process.argv[3]
            let networkConfigStr = fs.readFileSync(path.join(__dirname, "../network-config.json"));
            let networkConfig = JSON.parse(Buffer.from(networkConfigStr).toString())['network-config']
            let orderers: object[] = networkConfig['orderer']
            var orgConfig = networkConfig[org]
            var caClient = new CAClient(orgConfig["ca"], "admin", "adminpw", orgConfig["mspid"], org);
            var rslt: boolean = await caClient.init();
            var orgHFCLient = new HFCClient(orgConfig, orderers, "~/xxxz", caClient, "../artifacts")
            var rslt = await orgHFCLient.init()
            if (rslt) {
                this.logger.info("CA Client Intialization result :" + rslt);
                if (command == "create") {
                    var channelId = process.argv[4]
                    var txFile = process.argv[5]
                    if (channelId != null && txFile != null) {
                        var isChannelCreated = await orgHFCLient.createChannel(channelId, txFile);
                        this.logger.info("Channel created " + isChannelCreated)
                    } else {
                        this.logger.error(`Channel id and/or tx file is not provided `)
                    }
                }
                else if (command == "join") {
                    var channelId = process.argv[4]
                    if (channelId != null) {
                        var isJoined = await orgHFCLient.joinChannel(channelId)
                        this.logger.info("Channel join result " + isJoined)
                    } else {
                        this.logger.error(`Channel id not provided `)
                    }
                }
                else if (command == "install") {
                    var chaincodeId = process.argv[4]
                    var gitSrc = process.argv[5]
                    var version = process.argv[6]
                    if (chaincodeId != null && gitSrc != null && version != null) {
                        var isInstalled = await orgHFCLient.installChainCode(chaincodeId, gitSrc, version)
                        this.logger.info("Install chain code " + isInstalled)
                    } else {
                        this.logger.error(`Chaincode id, path , version  not provided `)
                    }
                }
                else if (command == "initcc") {
                    var channelId = process.argv[4]
                    var chainId = process.argv[5]
                    var version = process.argv[6]
                    var initMethName = process.argv[7]
                    if (channelId != null && chainId != null && version != null && initMethName != null) {
                        var params = this.getParameters(8)
                        this.logger.info('Params to chain code ', params)
                        var isInstantiated = await orgHFCLient.instantiateChainCode(channelId, chainId, version, initMethName, params)
                        this.logger.info("Instantiated chain code " + isInstantiated)
                    } else {
                        this.logger.error(`Channel id, Chaincode id,version, init method name  not provided `)
                    }
                }
                else if (command == "invoke") {
                    var channelId = process.argv[4]
                    var chainId = process.argv[5]
                    var invkMethName = process.argv[6]
                    if (channelId != null && chainId != null && initMethName != null) {
                        var params = this.getParameters(7)
                        var isTrxnSuccessful = await orgHFCLient.invokeChainCode(channelId, chainId, invkMethName, params, "suddutt1", "cnp4test")
                        this.logger.info("Invoke chain code " + isTrxnSuccessful)
                    } else {
                        this.logger.error(`Channel id, Chaincode id,init method name  not provided `)
                    }
                } else if (command == "query") {
                    var channelId = process.argv[4]
                    var chainId = process.argv[5]
                    var queryMethName = process.argv[6]
                    if (channelId != null && chainId != null && queryMethName != null) {
                        var params = this.getParameters(7)
                        var isQuerySuccess = await orgHFCLient.queryChaincode(channelId, chainId, queryMethName, params, "suddutt1", "cnp4test")
                        this.logger.info("Query chain code " + isQuerySuccess)
                    } else {
                        this.logger.error(`Channel id, Chaincode id,init method name  not provided `)
                    }
                }
                else {
                    this.logger.error("Invalid command ")
                }

            }

        } else {
            this.logger.error("Invalid input params : ")
        }
        return new Promise<number>(resolve => {
            resolve(0);
        });

    }
    private getParameters(startPos: number): any[] {
        var params = new Array()
        if (process.argv.length > startPos) {
            for (let index = startPos; index < process.argv.length; index++) {
                params.push(process.argv[index])
            }
        }
        return params
    }
    public async run(): Promise<number> {
        this.logger.info("Running now....")
        //await this.caEnrollmentFlow();
        await this.fabricClientFlow();
        return new Promise<number>(resolve => {
            resolve(0);
        });

    }
}
new NetworkDriver().run()