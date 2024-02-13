# playwright-dashboard

The Playwright Dashboard retrieves test results from the AWS S3 Bucket Browser application, aggregates these results, and provides a simple UI for analyzing individual test run results. Its primary purpose is to easily identify flaky or failed test cases.

This repository contains the following applications:
- **Playwright Dashboard API** (playwright-dashboard-api)
- **Playwright Dashboard Client** (playwright-dashboard-client)

## Features
- Retrieves Playwright test results from AWS S3 Bucket Browser and stores them in MongoDB.
- Displays aggregated test results and filters them by application, test status, and search text.
- Displays statistics about the number of flaky, all passed, and all failed test cases.
- Opens the result of the selected test run in the AWS S3 Bucket Browser.

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
To run this application, you will need to set up several environment variables. These variables configure the application and connect it to external services.

Here are the necessary environment variables:
- `PORT`: The port number where the application will run. Defaults to port 3000 if not set. For example: `3000`.
- `CLIENT_URL`: The base URL of the Playwright Dashboard Client application. For example: `http://localhost:4200`.
- `DATABASE_URL`: The MongoDB database connection string, including username, password, and hostname. For example: `mongodb://localhost:27017/playwright-dashboard?retryWrites=true&w=majority`.
- `BUCKET_BROWSER_API_URL_PREFIX`: The base URL for the AWS S3 bucket browser service API, used to fetch test results. For example: `https://boards-qa-results.diligentdatasystems.com/?list-type=2&delimiter=/&prefix=results/bw-client`.
- `BUCKET_BROWSER_CLIENT_URL_PREFIX`: The base URL for the AWS S3 bucket browser client, used to redirect users to full test run reports. For example: `https://boards-qa-results.diligentdatasystems.com/results/bw-client`.


#### Playwright Dashboard Client
The environment.ts file contains environment-specific settings, such as the API URL.

Here is the environment variable you need to set:
- `apiBaseUrl`: The base URL of the Playwright Dashboard API application. For example: `http://localhost:3000`.


## How to run the application locally
#### Run the Playwright Dashboard API application
1. Navigate to the playwright-dashboard-api folder and install npm dependencies before running the application.
2. Create a `.env` file in the root folder of the playwright-dashboard-api and add the variables mentioned above.
3. Run the `npm run start` command.

#### Run the Playwright Dashboard Client application
1. Navigate to the playwright-dashboard-client folder and install npm dependencies before running the application.
2. Ensure the apiBaseUrl variable in the environment.ts file is set.
3. Run the `npm run start` command.


## Playwright Dashboard API Endpoints
| HTTP Methods | Endpoints | Action |
| --- | --- | --- |
| POST | /api/test-results/sync | Retrieves test results from the AWS S3 Bucket Browser and stores them in the database |
| GET | /api/test-results/aggregated?from= | Retrieves aggregated test results from a specific date from the database |
| GET | /api/test-results/aggregated/latest | Retrieves the latest aggregated test result from the database |

## Technologies Used
#### Playwright Dashboard API
- [NodeJS](https://nodejs.org/en) This is a cross-platform runtime environment built on Chrome's V8 JavaScript engine used in running JavaScript codes on the server. It allows for installation and managing of dependencies and communication with databases.
- [ExpressJS](https://expressjs.com/) This is a NodeJS web application framework.
- [MongoDB](https://www.mongodb.com/) This is a free open source NOSQL document database with scalability and flexibility. Data are stored in flexible JSON-like documents.
- [Mongoose](https://mongoosejs.com/) This makes it easy to write MongoDB validation by providing a straight-forward, schema-based solution to model to application data.

#### Playwright Dashboard Client
- [Angular](https://angular.io/) A web development framework for building web applications.
