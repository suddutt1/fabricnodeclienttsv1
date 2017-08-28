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
            let org=process.argv[2]
            let command=process.argv[3]
            let networkConfigStr = fs.readFileSync(path.join(__dirname, "../network-config.json"));
            let networkConfig = JSON.parse(Buffer.from(networkConfigStr).toString())['network-config']
            let orderers: object[] = networkConfig['orderer']
            var orgConfig = networkConfig[org]
            var caClient = new CAClient(orgConfig["ca"], "admin", "adminpw", orgConfig["mspid"], org);
            var rslt: boolean = await caClient.init();
            var orgHFCLient = new HFCClient(orgConfig, orderers, "~/xxxz",caClient)
            var rslt = await orgHFCLient.init()
            if (rslt) {
                this.logger.info("CA Client Intialization result :" + rslt);
                if (command == "create") {
                    var isChannelCreated = await orgHFCLient.createChannel("mychannel1", "../artifacts/channel/mychannel1.tx");
                    this.logger.info("Channel created " + isChannelCreated)
                }
                else if (command == "join") {
                    var isJoined = await orgHFCLient.joinChannel("mychannel1")
                    this.logger.info("Channel join result "+ isJoined)
                }
                else if( command == "install"){
                    var isInstalled = await orgHFCLient.installChainCode("xchaincode","github.com/uniqueKeyValue","1.0")
                    this.logger.info("Install chain code "+ isInstalled)
                }
                else if ( command == "initcc"){
                    var isInstantiated = await orgHFCLient.instantiateChainCode("mychannel1","xchaincode","1.0","init",[])
                    this.logger.info("Instantiated chain code "+ isInstantiated)
                }
                else if (command =="invoke"){
                    var isTrxnSuccessful = await orgHFCLient.invokeChainCode("mychannel1","xchaincode","put",[process.argv[4],process.argv[5]],"suddutt1","cnp4test")
                    this.logger.info("Invoke chain code "+ isTrxnSuccessful)
                }else if(command =="query"){
                    var isQuerySuccess = await orgHFCLient.queryChaincode("mychannel1","xchaincode","get",[process.argv[4]],"suddutt1","cnp4test")
                    this.logger.info("Query chain code "+ isQuerySuccess)
                }
                else{
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