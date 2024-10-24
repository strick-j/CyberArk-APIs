
<a id="readme-top"></a>
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/strick-j/CyberArk-APIs">
    <img src="images/api-repo-logo.png" alt="Logo" width="80" height="80">
  </a>

<h3 align="center">CyberArk APIs Bruno</h3>

  <p align="center">
    Bruno collection for CyberArk APIs
    <br />
    <a href="https://github.com/strick-j/CyberArk-APIs"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/strick-j/CyberArk-APIs">View Demo</a>
    ·
    <a href="https://github.com/strick-j/CyberArk-APIs/issues/new?labels=bug&template=bug_report.md">Report Bug</a>
    ·
    <a href="https://github.com/strick-j/CyberArk-APIs/issues/new?labels=enhancement&template=feature-request.md">Request Feature</a>
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

[![Product Name Screen Shot][product-screenshot]](https://github.com/strick-j/CyberArk-APIs)

This project was built to help developers get started with CyberArk APIs. It is a collection of APIs that can be used to interact with CyberArk's services when using the Bruno API client. The project is open source and contributions are welcome.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running follow these simple example steps.

### Prerequisites

1. Install Bruno API client from [https://www.usebruno.com/](https://www.usebruno.com/)

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/strick-j/CyberArk-APIs.git
   ```
2. Copy .env.example to .env and update the values. At a minimum the following values need to be set:
   ```
   # GENERAL SETTINGS
   TENANT_ID="21215455-1234-4123-8ab1-123a68520abc" # The GUID of your CyberArk ISPSS Tenant. You can find this when logged in via Tenant Details pop up available in the top right corner of the screen.
   IDENTITY_TENANT_ID="abc1234" # The ID of your CyberArk ISPSS Tenant. You can find this when logged in via Tenant Details pop up available in the top right corner of the screen.
   IDENTITY_TENANT_NAME="example" # The subdomain of your CyberArk ISPSS Tenant (e.g. in example.cyberark.com, this would be "example")
   IDENTITY_TENANT_SUFFIX="example.com" # The common suffix used for logging in to your CyberArk ISPSS Tenant

   PLATFORM_TOKEN_CLIENT_ID="user@example.com" # This is the username of the user you want to use to authenticate
   PLATFORM_TOKEN_CLIENT_SECRET="ExamplePasssword1234" # This is the password of the user you want to use to authenticate
   ```
3. Open the collection folder within Bruno.
4. Navigate to the desired API endpoint and change the environment to "local" in the top right corner of the Bruno GUI.
5. Run the API endpoint.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- USAGE EXAMPLES -->
## Usage

Within Bruno, you can navigate to the desired API endpoint and run the API. The collection is organized by CyberArk capibility and the endpoints leverage the variables in .env file to run the API.

Note: The various API endpoints are not yet fully implemented. This is a work in progress.


<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Usage: API Authentication

The various APIs require authentication. The authentication header for most of the endpoints is automatically generated using the "Pre Request" script in Bruno. The following is an example of the Pre Request Script for one of the API endpoints:
  
  ```javascript
  const platformTokenAuth = require('./tools/platformTokenAuth');

  // Perform authentication usings platformToken.js tools
  await platformTokenAuth.login();
  ```

In the example above, the Pre Request script specifically calls the platformTokenAuth.login() function. This function is defined in the platformTokenAuth.js file located in the [tools] folder. The platformTokenAuth.login() function is responsible for authenticating the user and generating the necessary headers for the API request.

For authentication to work properly you must set the appropriate values in the .env file. For example, if the endpoint is configured to use Platform Token authentication you must set the following values in the .env file:
  ```
  PLATFORM_TOKEN_CLIENT_ID="user@example.com" 
  PLATFORM_TOKEN_CLIENT_SECRET="ExamplePasssword1234"
  ```

If you are planning to use any of the SCIM endpoints you must set the following values in the .env file:
  ```
  SCIM_CLIENT_ID="scim-client"
  SCIM_CLIENT_SECRET="scim-secret"
  SCIM_APPLICATION_ID="scim-application"
  SCIM_SCOPE="scim"
  ```

If you are planning to use either the Remote Access or Secure Web Sessions endpoints you must set the following values in the .env file:
  ```
  # Remote Access Login Information
  RA_BASE_URL="api.alero.io"
  RA_TENANT_ID="12ed12ae1EXAMPLEfb8d6e1234"
  RA_SERVICE_ACCOUNT_ID="11ef91EXAMPLE415dc11bf4"
  RA_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\r\nMIIEEXAMPLEowIBAAEXAMPLEu6p44EHG5f7QqREXAMPLEQ\r\n-----END RSA PRIVATE KEY-----\r\n"
  RA_REGION="us"

  # Secure Web Sessions Login Information
  SWS_BASE_URL="api.alero.io"  
  SWS_TENANT_ID="12ed12ae1EXAMPLEfb8d6e1234"
  SWS_SERVICE_ACCOUNT_ID="11ef91EXAMPLE415dc11bf4"
  SWS_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\r\nMIIEEXAMPLEowIBAAEXAMPLEu6p44EHG5f7QqREXAMPLEQ\r\n-----END RSA PRIVATE KEY-----\r\n"
  SWS_REGION="us"
  ```
You can find your Tenant ID by logging into your SWS or Remote Access portal. The Tenant ID is located in the URL of the portal. Your base URL will depend on your region and can be found in the documentation. The Service Account ID can be found in the Service Account ID and Private Key are part of the JSON file that gets created when you create a service account.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Usage: API Troubleshooting and Testing

The various APIs have the ability to be used in automated testing and troubleshooting. The APIs can be run in Bruno and the responses can be viewed in the response tab or within the developer view depending on .env variables. The responses can be used to troubleshoot issues with the API or to test the API in an automated fashion.

There are two environment variables you may enable for test puporpses:
  ```
  TEST_FLAG=true
  TEST_LOG_VERBOSE=true
  ```

The first variable, TEST_FLAG, will enable the test mode for the API. This will allow you to run the API in a test mode. Note that when TEST_FLAG is set to true variables configured with in the UI may be overwritten by test variables sourced from the .env file. The following example shows how variables may be set as part of the ***Pre Request*** script when the TEST_FLAG is set to true:
  ```javascript
  const tools = require('./tools/tools');

  // Sets pasSafeUrlId for testing based on environment flag and variables
  var flag = bru.getEnvVar('testFlag')
  if (flag == 'true') {
    tools.log('Setting Variables');
    bru.setVar('pasSafeUrlId', bru.getEnvVar('testSafeName'));
    tools.log('SafeName: ' + bru.getEnvVar('testSafeName'))
  }
  ```

The following example shows how variables may be set as part of the ***Post Response*** when the TEST_FLAG is set to true:
  ```javascript
  const tools = require('./tools/tools');

  // Sets Connector Id, Component Name, and version for testing based on environment flag and variables
  var flag = bru.getEnvVar('testFlag')
  if (flag == 'true') {
    tools.log('Setting Variables');
    bru.setVar('connector_id', res.body.components[0].connectorId);
    bru.setVar('component_name', res.body.components[0].componentName);
    bru.setVar('version', res.body.components[0].version);
    tools.log('Connector Id: ' + bru.getVar('connector_id'))
    tools.log('Component Name: ' + bru.getVar('component_name'))
    tools.log('Version: ' + bru.getVar('version'))
  }
  ```

The second variable, TEST_LOG_VERBOSE, will enable verbose logging for the API. This will allow you to see the full errors within the developer console. This is useful for troubleshooting issues with the API. The example below logs errors anytime the response is not a 200 status code:

  ```javascript
  const tools = require('./tools/tools');

  // Log on error
  if (res.status != 200) {
    if (res.body.code) {
      tools.log('Code: ' + res.body.code);
    }
    if (res.body.message) {
      tools.log('Message: ' + res.body.message);
    }
    if (res.body.description) {
      tools.log('Description: ' + res.body.description);
    }
    if (res.body.details) {
      tools.log('Details: ' + res.body.details);
    }
  }
  ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ROADMAP -->
## Roadmap

- [ ] Add Self Hosted API Endpoints
- [ ] Add Remaining SaaS API Endpoints
  - [ ] Enpoint Privilege Manager
  - [ ] Identity
  - [ ] Secure Web Sessions
- [x] Add Changelog
- [ ] Add more examples
- [ ] Add development documentation
- [ ] Ensure documentation is updated for endpoints
  - [ ] SaaS
    - [ ] Cloud Entitlements Manager
    - [x] Conjur Cloud
    - [x] Connector Managent
    - [ ] Identity
    - [ ] Privilege Cloud
    - [x] Secrets Hub
    - [x] Secure Cloud Access
    - [x] Secure Infrastructure Access
    - [x] Secure Web Sessions
  - [ ] Self Hosted
    - [ ] PAM


See the [open issues](https://github.com/strick-j/CyberArk-APIs/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Top contributors:

<a href="https://github.com/strick-j/CyberArk-APIs/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=strick-j/CyberArk-APIs" alt="contrib.rocks image" />
</a>



<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTACT -->
## Contact

Joe Strickland - [@joestrick](https://twitter.com/joestrick) - joseph.a.strickland@gmail.com

Project Link: [https://github.com/strick-j/CyberArk-APIs](https://github.com/strick-j/CyberArk-APIs)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ACKNOWLEDGMENTS -->
## Acknowledgments

* [Joe Garcia](https://github.com/infamousjoeg)
* [Bruno](https://www.usebruno.com/)
* [Img Shields](https://shields.io)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/strick-j/CyberArk-APIs.svg?style=for-the-badge
[contributors-url]: https://github.com/strick-j/CyberArk-APIs/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/strick-j/CyberArk-APIs.svg?style=for-the-badge
[forks-url]: https://github.com/strick-j/CyberArk-APIs/network/members
[stars-shield]: https://img.shields.io/github/stars/strick-j/CyberArk-APIs.svg?style=for-the-badge
[stars-url]: https://github.com/strick-j/CyberArk-APIs/stargazers
[issues-shield]: https://img.shields.io/github/issues/strick-j/CyberArk-APIs.svg?style=for-the-badge
[issues-url]: https://github.com/strick-j/CyberArk-APIs/issues
[license-shield]: https://img.shields.io/github/license/strick-j/CyberArk-APIs.svg?style=for-the-badge
[license-url]: https://github.com/strick-j/CyberArk-APIs/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/josephastrickland
[product-screenshot]: images/bruno-screenshot.png
[bruno-url]: https://www.usebruno.com/
[tools]: https://github.com/strick-j/CyberArk-APIs/tree/main/tools