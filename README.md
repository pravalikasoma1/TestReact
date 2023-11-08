- [Install Tools and build the project](#install-tools-and-build-the-project)
  - [Your Machine](#your-machine)
  - [VSCode](#vscode)
  - [Node LTS](#node-lts)
  - [Configure for your sharepoint environment](#configure-for-your-sharepoint-environment)
  - [Install deps, build and publish project](#install-deps-build-and-publish-project)
- [General dev workflow](#general-dev-workflow)
    - [`npm run build`](#npm-run-build)

# Install Tools and build the project
## Your Machine
* Windows fully supported and tested.
* MacOs/Linux should work, but are untested.
## VSCode
* Download and install [VSCode](https://code.visualstudio.com/).
* Inside of VSCode, install these extensions to get the best experience:

  * dbaeumer.vscode-eslint
  * dbaeumer.vscode-SonarLint
## Node LTS
* Download and install [Node LTS](https://nodejs.org/en/).

## Configure for your sharepoint environment
 Please follow the link to configure SharePoint with git
 https://ideaentity.sharepoint.com/:w:/s/RhyBus-DevelopmentPrinciples/EW9aQQpQg39EqS5msi0-tH0BQ6Z0ztitErMM5YjN9egPWw?e=w2MiD9

 * Add .env file in the project root folder (folder that contains package.json) with your development site like below (URL need to change as per your application)
   PUBLIC_URL=https://ideaentity.sharepoint.com/teams/AFIMSCDev/SUNILNAFFADev
  

* Use terminal and makesure you are in the project root folder to install the dependencies using below commands
  * `npm install`

* Once install complete successfully run the below command
 * `npm run build` 

* After get this message <strong>"The build folder is ready to be deployed"</strong>, <strong>"build"</strong> folder will create in the project root folder
* Publish build folder to your SharePoint dev site using "SPGO" command.  publish major version  (changes will reflect in site) 
* -In SPGo file need to change <strong>"src"</strong> to <strong>"build"</strong>

## Install deps, build and publish project
* open a command prompt and change into the project's root directory (folder that contains package.json) and run the following commands:
  * `npm install`
  * `npm run build`

<br>

# General dev workflow
- After completed changes we need to run the build. Run the following command in terminal 'npm run build'
* `npm start` - Using with this command we can run the project in local
* `npm run build` - Using with this command, build folder will generate

<br>

-----------------------------------------------------------------------------------------------------------------------

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

Runs eslint on the codebase to scan for code quality and style issues.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!
