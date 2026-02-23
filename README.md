# Shelf-Life Manager

1. Install node.js globally LTS version > https://nodejs.org/en/download/
2. Install Angular globally latest stable version
# 'npm install -g @angular/cli'

3. Go to the project root directory and run this command

# npm install --force

4. For development run this command

# ng serve

After successfully compliation navigate to `http://localhost:4200/`.

6. For production first go to src/environments/environment.prod.ts and change the API urls and run this command

# ng build OR ng build --build-optimizer --base-href="yourWebsiteBaseUrl"

# like http://example.net/ if it lies in same folder then http://example.net/aicoin/

7. A dist folder will be generated then upload it on your server


This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 13.1.2.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

