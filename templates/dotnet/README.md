# .NET Templates
To scaffold and run your code in a .NET (dotnet) environment, use the value "dotnet" for the "environment" property of your project definition (shaman.json file -> projects). The proceeding templates are available in the "dotnet" environment, and can "include" references (dependencies) to other projects of type "dotnet". 

## Requirements
Before you can use the .NET environment during scaffolding, you will need to install .NET Core on your machine; please ensure your version is >= 5.0.1. Also, since dotnet projects will be added to a .NET solution file (.sln), you will be required to provide a top-level "name" value in your shaman.json file.

## Languages
The Shaman CLI "dotnet" environment currently only supports the c# language. However, we are planning to introduce additional .NET language support, including f# and VB.net, so we ask that you specify the "language" property for each .NET project in a solution. The currently available values are: *csharp*; the default value is: *csharp*.

## Naming Convention
To prevent issues with scaffolding, please make sure all .NET project definitions use upper-camel case values in "name" properties. For example

**Invalid Configuration**
```json
{
  "name": "name-of-your-solution", // MAY CAUSE ERRORS
  "projects": [
    {
      "name": "not-upper-camel-case", // MAY CAUSE ERRORS
      "environment": "dotnet",
      "type": "server",
      "path": "[where you want to store your code]",
      "language": "csharp"
    }
  ]
}
```

**Valid Configuration**
```json
{
  "name": "NameOfYourSolution", // WORKS LIKE A CHARM
  "projects": [
    {
      "name": "ThisIsUpperCamelCase", // WORKS LIKE A CHARM
      "environment": "dotnet",
      "type": "server",
      "path": "[where you want to store your code]",
      "language": "csharp"
    }
  ]
}
```

## Server Template
The .NET server template is built on top of .NET 5 and comes pre-built with the following features:

1. Application Configuration
2. Default CORS configuration
3. Swagger (Open API) "Living" Documentation
4. Dependency Injection
5. Health-check controller
6. Transformation hooks for configuration / composition

To create a project based on the .NET server template, use the following project configuration:

```json
{
  "name": "NameOfYourSolution",
  "projects": [
    {
      "name": "[name of your server project]",
      "environment": "dotnet",
      "type": "server",
      "path": "[where you want to store your code]",
      "language": "csharp",
      "include": [ //optional
        "SomeDependentProject",
        "AnotherDependentProject",
        "YouGetTheIdea"
      ]
    }
  ]
}
```

### Specs
The server project does not yet have any specs defined.

### Transformations
The following transformations can be applied to a scaffolded server project.

#### Comose Data Context
If you have both a server project and a database project included in your solution file, then you can use this transformation to automatically add your "data context" (the thing that abstracts database object access) to your server configuration and composition. This will save you time after scaffolding, so you don't have to manually add the database configuration to your server project and setup dependency injection. Below is a sample solution file that shows how to leverage this transformation:

```json
{
  "name": "NameOfYourSolution",
  "projects": [
    {
      "name": "SampleCsharpDatabaseLibrary",
      "environment": "dotnet",
      "type": "database",
      "path": "SampleCsharpDatabaseLibrary",
      "language": "csharp",
      "specs": {
        "contextName": "MyDataContext"
      }
    },
    {
      "name": "SampleCsharpServer",
      "environment": "dotnet",
      "type": "server",
      "path": "SampleCsharpServer",
      "language": "csharp",
      "include": [
        "SampleCsharpDatabaseLibrary"
      ]
    }
  ],
  "transform": [
    {
      "targetProject": "SampleCsharpServer",
      "transformation": "compose:datacontext",
      "sourceProject": "SampleCsharpDatabaseLibrary"
    }
  ]
}
```

## Database Library Template
The .NET database library template is built on top of Entity Framework Core and comes pre-built with the following features:

1. A placeholder "data context" (to perform data access operations against SQL database)
2. A sample "User" model

To create a project based on the .NET database library template, use the following project configuration:

```json
{
  "name": "NameOfYourSolution",
  "projects": [
    {
      "name": "[name of your database library project]",
      "environment": "dotnet",
      "type": "database",
      "path": "[where you want to store your code]",
      "language": "csharp",
      "include": [ //optional
        "SomeDependentProject",
        "AnotherDependentProject",
        "YouGetTheIdea"
      ],
      "specs": { //optional
        "contextName": "MyDataContext" 
      }
    }
  ]
}
```

### Specs
The following specs can be configured to customize your database library project:

#### Context Name
To specify the name of your data context, provide a property "contextName" to your database library's "specs" property; the value should be whatever you want to call your data context class.

### Transformations
The database library project does not yet have any transformations defined.

## Library Template
The .NET library template is really light and only contains 1 source file (Class1.cs) and a .gitignore file, configured for .NET projects.

To create a project based on the .NET library template, use the following project configuration:

```json
{
  "name": "NameOfYourSolution",
  "projects": [
    {
      "name": "[name of your library project]",
      "environment": "dotnet",
      "type": "library",
      "path": "[where you want to store your code]",
      "language": "csharp",
      "include": [ //optional
        "SomeDependentProject",
        "AnotherDependentProject",
        "YouGetTheIdea"
      ]
    }
  ]
}
```

### Specs
The library project does not yet have any specs defined.

### Transformations
The library project does not yet have any transformations defined.
