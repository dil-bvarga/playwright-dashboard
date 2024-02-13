# playwright-dashboard

The Playwright Dashboard retrieves test results from the AWS S3 Bucket Browser application, aggregates these results, and provides a simple UI for analyzing individual test run results. The primary purpose of the application is to easily identify flaky or failed test cases.

This repo contains the following applications:
- **Playwright Dashboard API** (playwright-dashboard-api)
- **Playwright Dashboard Client** (playwright-dashboard-client)

## Features
- get playwright test results from AWS S3 Bucket Browser and store them to MongoDB
- display the aggregated test results and filter them by application, test status and search text
- display statistics about the number of flaky, all passed and all failed test cases
- open the result of the selected test run in the AWS S3 Bucket Browser

## Architecture
![Alt](/playwright_dashboard_architecture.png "Playwright Dashboard Architecture")

## Prerequisites
[Node.js](https://nodejs.org/en/) **version 20** and [npm](https://www.npmjs.com/) **version 10** installed. To use different versions of Node.js, you can use [nvm](https://github.com/nvm-sh/nvm).

## Installation
#### Playwright Dashboard API
Navigate to the playwright-dashboard-api folder and run the `npm install` command.

#### Playwright Dashboard Client
Navigate to the playwright-dashboard-client folder and run the `npm install` command.

## Environment Variables and Configurations
#### Playwright Dashboard API
In order to run this application, we will need to set up several environment variables. These variables are used to configure the application and connect it to external services.

Here are the environment variables we need to set:
- `PORT`: The port number where the application will run. If this variable is not set, the application will default to port 3000. For example: `3000`.
- `CLIENT_URL`: This is the base URL of the playwright-dashboard-client application. It's used when the server needs to redirect the client or request resources from the client. For example: `http://localhost:4200`.
- `DATABASE_URL`: The URL of the MongoDB database. This should be a full connection string that includes the username, password, and hostname of the MongoDB server. For example: `mongodb://localhost:27017/playwright-dashboard?retryWrites=true&w=majority`.
- `BUCKET_BROWSER_API_URL_PREFIX`: This is the base URL for the API of the AWS S3 bucket browser service. It's used when the application needs to make API requests to the bucket browser service in order to get the test results. For example: `https://boards-qa-results.diligentdatasystems.com/?list-type=2&delimiter=/&prefix=results/bw-client`.
- `BUCKET_BROWSER_CLIENT_URL_PREFIX`: This is the base URL for the client of the AWS S3 bucket browser service. It's used when the application needs to redirect the client to the bucket browser application to see the full test run report. For example: `https://boards-qa-results.diligentdatasystems.com/results/bw-client`.


#### Playwright Dashboard Client
The environment.ts file contains environment-specific settings such as URL for API.

Here are the environment variables we need to set:

- `apiBaseUrl`: This is the base URL of the playwright-dashboard-api application. For example: `http://localhost:3000`.


## How to run the application locally
#### Run the Playwright Dashboard API application
1. Navigate to the playwright-dashboard-api folder and make sure to install npm dependencies before running the application.
2. Create a `.env` file in the root folder of the playwright-dashboard-api and add you variables mentioned above.
3. Run the `npm run start` command.

#### Run the Playwright Dashboard Client application
1. Navigate to the playwright-dashboard-client folder and make sure to install npm dependencies before running the application.
2. Make sure to set the `apiBaseUrl` variable in the environments.ts file.
3. Run the `npm run start` command.


## Playwright Dashboard API Endpoints
| HTTP Methods | Endpoints | Action |
| --- | --- | --- |
| POST | /api/test-results/sync | To get test results from the AWS S3 Bucket Browser and store them to the database |
| GET | /api/test-results/aggregated?from= | To retrieve the aggregated test results from a specific date from the database |
| GET | /api/test-results/aggregated/latest | To retrieve the latest aggregated test result from the database |

## Technologies Used
#### Playwright Dashboard API
- [NodeJS](https://nodejs.org/en) This is a cross-platform runtime environment built on Chrome's V8 JavaScript engine used in running JavaScript codes on the server. It allows for installation and managing of dependencies and communication with databases.
- [ExpressJS](https://expressjs.com/) This is a NodeJS web application framework.
- [MongoDB](https://www.mongodb.com/) This is a free open source NOSQL document database with scalability and flexibility. Data are stored in flexible JSON-like documents.
- [Mongoose](https://mongoosejs.com/) This makes it easy to write MongoDB validation by providing a straight-forward, schema-based solution to model to application data.

#### Playwright Dashboard Client
- [Angular](https://angular.io/): A web development framework for building web applications.
