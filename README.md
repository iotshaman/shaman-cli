## Shaman CLI - by IoT Shaman

![npm badge](https://img.shields.io/npm/v/shaman-cli.svg) [![Coverage Status](https://coveralls.io/repos/github/iotshaman/shaman-cli/badge.svg?branch=main)](https://coveralls.io/github/iotshaman/shaman-cli?branch=main)

## Generate application scaffolding in seconds with Shaman CLI.

Get started working on core business logic faster by streamlining your application scaffolding. The initial version of Shaman CLI only supports scaffolding typescript application components, but future iterations will add additional language support, as well as other CLI improvements. 

## Installation

To install Shaman CLI on your machine, first install Node JS then run the following command:

```sh
npm i -g shaman-cli
```

*NOTE: You may need elevated permissions to run this command*

## Solution File

Some commands require the existence of a "solution" file, which indicates what projects (servers, libraries, database libraries, etc.) are available as part of the solution. This file should be called "shaman.json", and has the following interface:

```ts
interface Solution {
  name: string;
  projects: SolutionProject[];
  transform?: ProjectTransformation[];
}

interface SolutionProject {
  name: string;
  environment: string;
  type: string;
  path: string;
  language?: string;
  include?: string[];
  specs?: {[spec: string]: any};
  runtimeDependencies?: string[];
}

interface ProjectTransformation {
  targetProject: string;
  transformation: string;
  sourceProject?: string;
}
```

For example, if you have a node js solution that includes a website, library, database library, and a server, it could look like this:

```json
{
  "name": "sample-node-solution",
  "projects": [
    {
      "name": "sample-website",
      "environment": "node",
      "type": "client",
      "path": "client",
      "runtimeDependencies": [
        "sample-server"
      ]
    },
    {
      "name": "sample-database",
      "environment": "node",
      "type": "database",
      "path": "database"
    },
    {
      "name": "sample-library",
      "environment": "node",
      "type": "library",
      "path": "library",
      "include": [
        "sample-database"
      ]
    },
    {
      "name": "sample-server",
      "environment": "node",
      "type": "server",
      "path": "server",
      "include": [
        "sample-database",
        "sample-library"
      ]
    }
  ],
  "transform": [
    {
      "targetProject": "sample-server",
      "transformation": "compose:datacontext",
      "sourceProject": "sample-database"
    }
  ]
}
```

*Note: All paths should be relative to the solution file*

### Project Specs
Some project types (for specific environments) allow you to provide "specs" to further customize the auto-generated source code. For more information regarding project specs, please refer to the [project templates](https://github.com/iotshaman/shaman-cli/tree/main/templates) documentation.

### Transformations
Some project types (for specific environments) allow you to perform "transformations" on the auto-generated source code, to create custom source code during initial scaffolding. For example, you can use a transformation to automatically write "data context" composition for a server project (that depends on a database library). For more information regarding project transformations, please refer to the [project templates](https://github.com/iotshaman/shaman-cli/tree/main/templates) documentation.

## CLI Reference

Once you have installed Shaman CLI, you can access it by invoking "shaman" in a command line interface (CMD, bash, etc). The format for executing commands looks like this:

```sh
shaman [command] [...arguments]
```

**[command]:** Available values: *scaffold-solution, scaffold, install, build, run, serve*  
**[...arguments]:** A list of arguments that vary, depending on the command provided.  

### Scaffold Solution Command

The scaffold-solution command requires the existence of a solution file, and will iterate over the available projects and scaffold them all. Under the hood, the cli will use the project variables to invoke the ["scaffold" command](#scaffold-command). The syntax for the scaffold-solution command is as follows:

```sh
shaman scaffold-solution [solutionFilePath]
```

**[solutionFilePath]:** (Optional) relative path to the shaman.json file (including file name). If no value is provided, the default value is the current working directory.

### Scaffold Command

The scaffold command generates application scaffolding automatically, based on the arguments provided, and installs all dependencies. The syntax for the scaffold command is as follows; please note that these arguments must be provided in-order:

```sh
shaman scaffold [environment] [type] [name] [output folder]
```

**[environment]:** Indicates the coding environment, which will help determine what type of code files will be generated. Available values are: *node*  
**[type]:** The application component type. Available values are: *library, server, database*  
**[name]:** The name of the component (can be anything).  
**[output folder]:** The folder in which application scaffolding will be generated.  

### Install Command

The install command requires the existence of a solution file, and will iterate over the available projects and install them. If no "environment" argument is provided (or wildcard value * is provided), Shaman CLI will iterate over the unique "environment" types, and perform independent installs for each. The syntax for the install command is as follows; please note that these arguments must be provided in-order.

```sh
shaman install [environment] [solutionFilePath]
```

**[environment]:** (Optional) Indicates the coding environment, which will help determine which projects should be installed. Available values are: *node*, *\**  
**[solutionFilePath]:** (Optional) relative path to the shaman.json file (including file name). If no value is provided, the default value is the current working directory.

### Build Command

The build command requires the existence of a solution file, and will iterate over the available projects and build them. If no "environment" argument is provided (or wildcard value * is provided), Shaman CLI will iterate over the unique "environment" types, and perform independent builds for each. The syntax for the build command is as follows; please note that these arguments must be provided in-order.

```sh
shaman build [environment] [solutionFilePath]
```

**[environment]:** (Optional) Indicates the coding environment, which will help determine which projects should be built. Available values are: *node*, *\**  
**[solutionFilePath]:** (Optional) relative path to the shaman.json file (including file name). If no value is provided, the default value is the current working directory.

*Note: In order for the build command to work, each project needs to have a script (in package.json) called "build". If you used Shaman CLI to scaffold your code, this is already available.*

### Run Command

The run command requires the existence of a solution file, and will execute an npm script for a specific project; if no script is specified, it will default to 'start'. The syntax for the run command is as follows; please note that these arguments must be provided in-order.

```sh
shaman run [project] [script] [solutionFilePath]
```

**[project]:** The name of the project for which you would like to execute the provided (or default) script. The provided project value must match a project name in your solution file.  
**[script]:** (Optional) The npm script to be executed; if no value is provided, the default value is 'start'. Please note that for the run command to work, the specified project must have a script setup in its respective 'package.json' file that corresponds to the provided (or default) script value.  
**[solutionFilePath]:** (Optional) relative path to the shaman.json file (including file name). If no value is provided, the default value is the current working directory.

*Note: In order for the run command to work, the specified project needs to have a script (in package.json) that corresponds to the provided (or default) script value.*

### Serve Command

The serve command requires the existence of a solution file, and will execute the 'start' script for 1-to-many projects. For example, if you have a website and a server, you can use the serve command to start both the server and the website, with 1 command. In order for Shaman CLI to start multiple projects, you must define any "runtime dependencies" in the "runtimeDependencies" property of the respective "parent" project (the one that depends on the other). So, for the previous example (server and website) you would want to register the server project as a runtime dependency of the website project.

The syntax for the serve command is as follows:

```sh
shaman serve [project]
```

**[project]:** The name of the project for which you would like to serve. The provided project value must match a project name in your solution file. Note: any project names listed as "runtime dependencies" will be started first, and runtime dependencies can be nested.

*Note: In order for the serve command to work, the specified project (any and runtime dependencies) must have a 'start' script (in package.json).*

### Version Command

The version command can be invoked to determine what version of Shaman CLI is currently installed. 

The syntax for the serve command is as follows:

```sh
shaman --version
```

## Project Dependencies

Sometimes, one project in a solution will be dependent on another project; when this happens, you may need to instruct the Shaman CLI about these dependencies. If you know these project dependencies when scaffolding a solution (using Shaman CLI), you can simply define these dependencies in your [solution file](#solution-file) by adding the name of the *dependent* project to the "include" property of the *parent* project; then, when you run the "scaffold-solution" command it will automatically install these dependencies, and future builds will know the correct order. If you **do not** know the project dependencies when scaffolding, or you do not use the Shaman CLI to scaffold your code, you will need to manually install your dependencies in any *parent* project's package.json file, then update your solution file to reflect the relationship.