# learn-aws-iot
Learn how to use Amazon Web Services Internet of Things (IoT) service to build connected applications.

### What is AWS IoT?
AWS IoT provides two-way communication between devices that are connected to the internet and the AWS Cloud. This means that you can create applications that your users will be able to control from their phones or tablets. _(Very cool stuff!)_

AWS IoT consists of a few components. They are:

* Message broker - a mechanism for things to publish and receive messages from each other. The MQTT protocol can be used to publish and subscribe and the HTTP REST interface can be used to publish.

* Rules engine - allows the integration between IoT and other AWS services.
* Thing Registry - a.k.a. 'Device Registry'. This organises the resources associated with each _thing_.
* Thing Shadow service - provides persistent representations of your things in the AWS Cloud. It can hold state information about your _thing_ which can be synchronised when it next connects. Your _things_ can also publish their current state to a thing shadow for other applications or devices to use.
* Thing shadow - a.k.a. 'Device shadow'. It's a JSON document used to store and retrieve current state information for a _thing_.
* Device gateway - enables devices to communicate with AwS IoT.
* Security and identity service - Your _things_ must keep their credentials safe in order to send data securely to the message broker. The message broker and rules engine use AWS Security features to send data to devices or other AWS services.


### Get Started by Creating a **_THING_** with AWS IoT

To create a thing you'll need to use the AWS CLI. Install it by following the steps **[here](http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-set-up.html)**.

You'll then need to go to your IAM console and create a user. Take down the Access Key ID and the Secret Access Key, you'll need them to configure your AWS CLI.

In the command line type the following command:

```$ aws configure```

You'll then be prompted to enter your Access Key ID, Secret Access Key and your region. Press enter for the fourth prompt. Your AWS CLI should now be ready to be used!

1. To create a _thing_ type the following into your terminal:

  ```$ aws iot create-thing --thing-name "theNameOfYourThing"```

  In order to see all of the things you have created, type ```$ aws iot list-things``` into the command line. It will then return an object with an array of your things in it:

  ```
  {
    "things": [
        {
            "attributes": {},
            "thingName": "thing1"
        },
        {
            "attributes": {},
            "thingName": "thing2"
        }
    ]
  }
  ```

2. To enable secure communication between a device and AWS IoT, you'll need to provision a certificate for your thing. You can create one yourself or you can have one created for you by AWS IoT. Type the following command into your command line to have a certificate provisioned for you:

  ```$ aws iot create-keys-and-certificate --set-as-active --certificate-pem-outfile cert.pem --public-key-outfile publicKey.pem --private-key-outfile privateKey.pem```

  This will automatically create your certificate and add the key files to your project. Make a note of the certificate ARN that it returns to your terminal.

3. Create and Attach an AWS IoT Policy to Your Certificate. To do so you'll need to create a new JSON file in your project. You can call it whatever you like, we've called it ```policy.json```. Include the following code in the newly created file:

  ```
  {
    "Version": "2012-10-17",
    "Statement": [{
        "Effect": "Allow",
        "Action":["iot:*"],
        "Resource": ["*"]
    }]
  }
  ```

  To create a policy you'll then need to type a create-policy command into your terminal. You'll need to name your policy here and copy the full file path to the policy file you just created:

  ```$ aws iot create-policy --policy-name "PolicyName" --policy-document file://path-to-your-policy-document```

  Now let's attach that policy to the certificate. Reference the certificate ARN you made a note of earlier. Use the folling command:

  ```$ aws iot attach-principal-policy --principal "certificate-arn" --policy-name "PolicyName"```

4. Attach your Certificate to your Device using the following command:

  ```$ aws iot attach-thing-principal --thing-name "theNameOfYourThing" --principal "certificate-arn"```

5. Verify MQTT Subscribe and Publish. You'll need to download the **_root certificate_** from [here](https://www.symantec.com/content/en/us/enterprise/verisign/roots/VeriSign-Class%203-Public-Primary-Certification-Authority-G5.pem) and then save it in a file called ```rootCA.pem```. Next download MQTT.fx from **[here](http://mqttfx.jfx4ee.org/index.php/download)**.

  Click on the link
  ![MQTT download](https://cloud.githubusercontent.com/assets/12450298/13011989/467f8938-d1a1-11e5-9308-efeb0294e793.png)

  Download the relevant files for your machine (eg windows or mac)
  ![machine spec](https://cloud.githubusercontent.com/assets/12450298/13012068/98e2be0c-d1a1-11e5-8b71-21eeb75ca95e.png)

  Type the following command to find out your AWS IoT endpoint. Make a note of it:
  ```$ aws iot describe-endpoint```

  Open the downloaded file to install MQTT and then launch it. Click on the gear at the top to configure the application. _(make sure egress to port 8883 is allowed on your network)_

  ![settings](https://cloud.githubusercontent.com/assets/12450298/13012350/e21f9ac6-d1a2-11e5-8a4a-29417e29ab95.png)

  Give it a profile name and then enter your Broker address which is the IoT endpoint. Then click on the SSL/TLS tab
  ![config](https://cloud.githubusercontent.com/assets/12450298/13012454/325b627c-d1a3-11e5-8ea4-eff11487ede5.png)

  Click on the 'Self signed certificates' radio button and then enter the following information:

  * CA File which is the path to your ```rootCA.pem``` file
  * Client Certificate File which is the path to your ```cert.pem``` file
  * Client Key File which is the path to your ```privateKey.pem``` file

  ![SSL/TLS](https://cloud.githubusercontent.com/assets/12450298/13012711/4393899c-d1a4-11e5-931c-aaf072f37bc7.png)

  Click 'OK' which will take you back to the MQTT.fx dashboard.

6. Click the connect button at the top of the window to connect to AWS IoT:

  ![connect](https://cloud.githubusercontent.com/assets/12450298/13012844/e8fd4c38-d1a4-11e5-8bfd-105445768591.png)


7. Subscribe to an MQTT topic by clicking on the subscribe tab, entering a topic name and then clicking subscribe (make sure the QoS 0 option is selected in the dropdown on the right):

  ![subscribe](https://cloud.githubusercontent.com/assets/12450298/13012947/576ee19a-d1a5-11e5-8f98-0ff25a229e31.png)

8. Publish to an MQTT topic by clicking on the publish tab and entering the name of the topic you just subscribed to:

  ![publish](https://cloud.githubusercontent.com/assets/12450298/13013055/b12be66a-d1a5-11e5-93e3-93523dcaa5a5.png)

  Then enter a message that you want to publish then hit publish. We posted 'hello world'. Go back to the subscribe tab to see your message:

  ![message sent](https://cloud.githubusercontent.com/assets/12450298/13013500/a61b4048-d1a7-11e5-883b-5ab4424e41bb.png)

That's it! You've set up your first Pub/Sub connection using AWS IoT!


### Create an IAM Role for AWS IoT
In order for IoT to interact with other AWS services, you need to create an IAM role so that it has the right permissions. Copy the following code into a file and call it trust-policy.json. _(make sure you enter an Sid, it can be anything you like)_:

```
{
"Version": "2012-10-17",  
"Statement": [{
      "Sid": "123456789example",     
      "Effect": "Allow",      
      "Principal": {
            "Service": "iot.amazonaws.com"
       },
      "Action": "sts:AssumeRole"
  }]
}
```

Then to create the IAM role, run the create-role command giving it the Assume Role policy document that you just created:

```$ aws iam create-role --role-name iot-actions-role --assume-role-policy-document file://path-to-file/trust-policy.json```

Make sure you save the ARN from the output of this command as you'll need it to create 
