# Shaman CLI Recipes

When using the [generate command]([../README.md#generate-command](https://github.com/iotshaman/shaman-cli/tree/main#generate-command)), a recipe can be used as a model for the created solution file. The default recipe is as follows:

```json
    "recipe": {
        "projects": [{
                "name": "sample-website",
                "environment": "node",
                "template": "client",
                "path": "client",
                "runtimeDependencies": [
                    "sample-server"
                ]
            },
            {
                "name": "sample-database",
                "environment": "node",
                "template": "database",
                "path": "database"
            },
            {
                "name": "sample-library",
                "environment": "node",
                "template": "library",
                "path": "library",
                "include": [
                    "sample-database"
                ]
            },
            {
                "name": "sample-server",
                "environment": "node",
                "template": "server",
                "path": "server",
                "include": [
                    "sample-database",
                    "sample-library"
                ]
            }
        ],
        "transform": [{
            "targetProject": "sample-server",
            "transformation": "compose:datacontext",
            "sourceProject": "sample-database"
        }]
    }
```